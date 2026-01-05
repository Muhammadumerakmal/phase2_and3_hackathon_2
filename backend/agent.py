"""
AI Agent for Todo Application using OpenAI SDK with OpenRouter
Handles natural language task management through function calling
"""

import os
import json
from typing import List
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

# Validate OPEN_ROUTER_KEY
OPEN_ROUTER_KEY = os.getenv("OPEN_ROUTER_KEY")
if not OPEN_ROUTER_KEY:
    raise ValueError("OPEN_ROUTER_KEY environment variable is not set")

# Configure OpenAI client for OpenRouter
client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPEN_ROUTER_KEY,
)

# Model to use
MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

# Agent system instructions
SYSTEM_PROMPT = """You are a helpful todo management assistant. You help users manage their tasks through natural conversation.

## Your Capabilities:
You can help users with:
- Adding new tasks
- Listing their tasks (all, pending, or completed)
- Marking tasks as complete
- Deleting tasks
- Updating task titles
- Summarizing tasks and providing statistics
- Providing productivity insights and smart suggestions

## Behavior Rules:
- When user mentions adding/creating/remembering something, use the add_task function
- When user asks to see/show/list tasks, use the list_tasks function with appropriate filter
- When user says done/complete/finished with a task, use the complete_task function
- When user says delete/remove/cancel a task, use the delete_task function
- When user says change/update/rename a task, use the update_task function
- When user asks for summary/overview/statistics/report, use the get_task_summary function
- When user asks for insights/suggestions/tips/productivity advice, use the get_productivity_insights function
- When user asks "how am I doing" or about their progress, use get_productivity_insights

## Response Style:
- Be conversational and friendly
- Always confirm actions clearly (e.g., "I've added 'Buy groceries' to your tasks!")
- When listing tasks, format them clearly with numbers
- If there are no tasks, let the user know kindly
- Offer helpful suggestions when appropriate
- Handle errors gracefully with helpful messages
- When providing summaries, present statistics in a clear, readable format
- When giving productivity insights, be encouraging and actionable

## Important:
- The user_id will be automatically injected - you don't need to ask for it
- Never make up task IDs - always get them from list_tasks first if needed
- When a user refers to a task by name or description, find its ID first
"""

# Tool definitions for OpenAI function calling
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The task title/content"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional task description"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Retrieve tasks from the user's list",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter by status: all, pending, or completed. Default is all."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as complete",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The task ID to complete"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The task ID to delete"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update a task's title or completion status",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The task ID to update"
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title"
                    },
                    "completed": {
                        "type": "boolean",
                        "description": "Task completion status"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_task_summary",
            "description": "Get a comprehensive summary and statistics of the user's tasks including completion rates and task breakdown",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_productivity_insights",
            "description": "Get productivity insights and smart suggestions based on task patterns",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
]


async def execute_tool(tool_name: str, arguments: dict, user_id: int) -> dict:
    """Execute a tool and return the result."""
    from mcp_server import (
        add_task, list_tasks, complete_task, delete_task, update_task,
        get_task_summary, get_productivity_insights
    )

    user_id_str = str(user_id)

    if tool_name == "add_task":
        return await add_task(
            user_id=user_id_str,
            title=arguments.get("title", ""),
            description=arguments.get("description", "")
        )
    elif tool_name == "list_tasks":
        return await list_tasks(
            user_id=user_id_str,
            status=arguments.get("status", "all")
        )
    elif tool_name == "complete_task":
        return await complete_task(
            user_id=user_id_str,
            task_id=arguments.get("task_id")
        )
    elif tool_name == "delete_task":
        return await delete_task(
            user_id=user_id_str,
            task_id=arguments.get("task_id")
        )
    elif tool_name == "update_task":
        return await update_task(
            user_id=user_id_str,
            task_id=arguments.get("task_id"),
            title=arguments.get("title"),
            completed=arguments.get("completed")
        )
    elif tool_name == "get_task_summary":
        return await get_task_summary(user_id=user_id_str)
    elif tool_name == "get_productivity_insights":
        return await get_productivity_insights(user_id=user_id_str)
    else:
        return {"error": f"Unknown tool: {tool_name}"}


async def run_agent(
    user_id: int,
    message: str,
    conversation_history: List[dict]
) -> str:
    """
    Run the AI agent with the given message and history.

    Args:
        user_id: The authenticated user's ID
        message: The new user message
        conversation_history: List of previous messages in the conversation

    Returns:
        The assistant's response string
    """
    try:
        # Build messages array
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add conversation history
        for msg in conversation_history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            messages.append({"role": role, "content": content})

        # Add new user message
        messages.append({"role": "user", "content": message})

        # Initial API call
        response = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )

        # Handle tool calls in a loop
        while response.choices[0].message.tool_calls:
            assistant_message = response.choices[0].message
            messages.append(assistant_message)

            # Process each tool call
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)

                # Execute the tool
                result = await execute_tool(tool_name, arguments, user_id)

                # Add tool result to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result)
                })

            # Get next response
            response = await client.chat.completions.create(
                model=MODEL,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
            )

        # Return the final text response
        return response.choices[0].message.content or "I've completed your request."

    except Exception as e:
        return f"I'm sorry, I encountered an error: {str(e)}. Please try again."
