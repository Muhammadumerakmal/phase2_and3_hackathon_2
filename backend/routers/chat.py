"""
Chat Router for Todo AI Chatbot
Implements stateless chat endpoint with conversation persistence and streaming
"""

import asyncio
import json
from datetime import datetime
from typing import List, AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

from models import Conversation, Message, User
from database import get_session
from auth import get_current_active_user
from schemas import (
    ChatRequest,
    ChatResponse,
    ConversationRead,
    ConversationDetail,
    MessageRead
)
from agent import run_agent, TOOLS, MODEL

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Stateless chat endpoint.

    Flow:
    1. Receive user message
    2. Get or create conversation
    3. Fetch conversation history from database
    4. Store user message in database
    5. Run agent with MCP tools
    6. Store assistant response in database
    7. Return response
    """
    # Get or create conversation
    if request.conversation_id:
        conversation = session.get(Conversation, request.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Create new conversation
        # Use first few words of message as title
        title = request.message[:50] + "..." if len(request.message) > 50 else request.message
        conversation = Conversation(
            user_id=current_user.id,
            title=title
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

    # Fetch conversation history from database
    history_query = select(Message).where(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at)
    history_messages = session.exec(history_query).all()

    # Build history for agent
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
    ]

    # Store user message in database
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message
    )
    session.add(user_message)
    session.commit()

    # Run agent with MCP tools
    try:
        response_content = await run_agent(
            user_id=current_user.id,
            message=request.message,
            conversation_history=conversation_history
        )
    except Exception as e:
        # Store error message
        error_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content="I'm sorry, I encountered an error. Please try again."
        )
        session.add(error_message)
        session.commit()
        raise HTTPException(status_code=500, detail=str(e))

    # Store assistant response in database
    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=response_content
    )
    session.add(assistant_message)

    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)
    session.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        message=response_content,
        role="assistant"
    )


async def stream_agent_response(
    user_id: int,
    message: str,
    conversation_history: List[dict],
    conversation_id: int
) -> AsyncGenerator[str, None]:
    """
    Stream the agent response token by token.

    Yields:
        JSON-formatted chunks containing streamed text segments
    """
    import agent
    from agent import client

    # Build messages array
    messages = [{"role": "system", "content": agent.SYSTEM_PROMPT}]

    # Add conversation history
    for msg in conversation_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        messages.append({"role": role, "content": content})

    # Add new user message
    messages.append({"role": "user", "content": message})

    full_response = ""
    tool_calls = []

    try:
        # Make streaming API call
        response = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            stream=True,
        )

        # Handle streaming response
        async for chunk in response:
            delta = chunk.choices[0].delta

            # Handle content
            if delta.content:
                content = delta.content
                full_response += content
                yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"

            # Collect tool calls
            if delta.tool_calls:
                for tool_call in delta.tool_calls:
                    tool_calls.append(tool_call)

        # Handle tool calls if any
        if tool_calls:
            for tool_call in tool_calls:
                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)

                # Notify about tool call
                yield f"data: {json.dumps({'type': 'tool_call', 'tool': tool_name})}\n\n"

                # Execute the tool
                from mcp_server import (
                    add_task, list_tasks, complete_task, delete_task, update_task,
                    get_task_summary, get_productivity_insights
                )

                user_id_str = str(user_id)

                if tool_name == "add_task":
                    result = await add_task(
                        user_id=user_id_str,
                        title=arguments.get("title", ""),
                        description=arguments.get("description", "")
                    )
                elif tool_name == "list_tasks":
                    result = await list_tasks(
                        user_id=user_id_str,
                        status=arguments.get("status", "all")
                    )
                elif tool_name == "complete_task":
                    result = await complete_task(
                        user_id=user_id_str,
                        task_id=arguments.get("task_id")
                    )
                elif tool_name == "delete_task":
                    result = await delete_task(
                        user_id=user_id_str,
                        task_id=arguments.get("task_id")
                    )
                elif tool_name == "update_task":
                    result = await update_task(
                        user_id=user_id_str,
                        task_id=arguments.get("task_id"),
                        title=arguments.get("title"),
                        completed=arguments.get("completed")
                    )
                elif tool_name == "get_task_summary":
                    result = await get_task_summary(user_id=user_id_str)
                elif tool_name == "get_productivity_insights":
                    result = await get_productivity_insights(user_id=user_id_str)
                else:
                    result = {"error": f"Unknown tool: {tool_name}"}

                # Add tool result to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result)
                })

                # Stream tool result
                yield f"data: {json.dumps({'type': 'tool_result', 'tool': tool_name, 'result': result})}\n\n"

        # Continue with any additional response after tool calls
        # Build messages with tool results
        final_messages = messages.copy()

        # Get next response (may have more content after tool results)
        next_response = await client.chat.completions.create(
            model=MODEL,
            messages=final_messages,
            tools=TOOLS,
            tool_choice="auto",
            stream=True,
        )

        async for chunk in next_response:
            delta = chunk.choices[0].delta
            if delta.content:
                content = delta.content
                full_response += content
                yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
        return

    # Store assistant response in database using a new session
    from database import engine
    from sqlmodel import Session as SqlSession

    with SqlSession(engine) as db_session:
        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=full_response
        )
        db_session.add(assistant_message)

        # Update conversation timestamp
        conversation = db_session.get(Conversation, conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()
            db_session.add(conversation)

        db_session.commit()

    # Send done signal
    yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation_id})}\n\n"


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Streaming chat endpoint - returns Server-Sent Events for real-time response.

    Flow:
    1. Receive user message
    2. Get or create conversation
    3. Store user message in database
    4. Stream assistant response token by token
    5. Store full response when streaming completes
    """
    # Get or create conversation
    if request.conversation_id:
        conversation = session.get(Conversation, request.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Create new conversation
        title = request.message[:50] + "..." if len(request.message) > 50 else request.message
        conversation = Conversation(
            user_id=current_user.id,
            title=title
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

    # Get conversation ID before any streaming
    conversation_id = conversation.id

    # Fetch conversation history from database
    history_query = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at)
    history_messages = session.exec(history_query).all()

    # Build history for agent
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
    ]

    # Store user message in database
    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=request.message
    )
    session.add(user_message)
    session.commit()

    # Expunge all objects to detach from session
    session.expunge_all()

    async def event_generator():
        # Send conversation ID first
        yield f"data: {json.dumps({'type': 'start', 'conversation_id': conversation_id})}\n\n"

        # Stream the response
        async for chunk in stream_agent_response(
            user_id=current_user.id,
            message=request.message,
            conversation_history=conversation_history,
            conversation_id=conversation_id
        ):
            yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/conversations", response_model=List[ConversationRead])
async def list_conversations(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """List all conversations for the current user."""
    query = select(Conversation).where(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc())

    conversations = session.exec(query).all()
    return conversations


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get a specific conversation with all messages."""
    conversation = session.get(Conversation, conversation_id)

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get all messages for this conversation
    messages_query = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at)
    messages = session.exec(messages_query).all()

    return ConversationDetail(
        id=conversation.id,
        user_id=conversation.user_id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=[
            MessageRead(
                id=msg.id,
                conversation_id=msg.conversation_id,
                role=msg.role,
                content=msg.content,
                created_at=msg.created_at
            )
            for msg in messages
        ]
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Delete a conversation and all its messages."""
    conversation = session.get(Conversation, conversation_id)

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Delete all messages first
    messages_query = select(Message).where(Message.conversation_id == conversation_id)
    messages = session.exec(messages_query).all()
    for msg in messages:
        session.delete(msg)

    # Delete conversation
    session.delete(conversation)
    session.commit()

    return {"ok": True, "message": "Conversation deleted"}
