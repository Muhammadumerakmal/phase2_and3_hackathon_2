"""
Chat Router for Todo AI Chatbot
Implements stateless chat endpoint with conversation persistence
"""

from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
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
from agent import run_agent

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
