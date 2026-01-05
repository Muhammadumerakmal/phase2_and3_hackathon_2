"""
MCP Server for Todo Application
Exposes task management tools for AI agents via Model Context Protocol
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Optional
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from sqlmodel import Session, select
from database import engine
from models import Todo, User


# Create MCP server
mcp = Server("todo-mcp-server")


def get_user_by_id(user_id: str) -> Optional[User]:
    """Get user by ID from database."""
    with Session(engine) as session:
        try:
            uid = int(user_id)
            return session.get(User, uid)
        except ValueError:
            return None


@mcp.list_tools()
async def list_tools() -> list[Tool]:
    """List all available MCP tools."""
    return [
        Tool(
            name="add_task",
            description="Create a new task for the user",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The user ID"
                    },
                    "title": {
                        "type": "string",
                        "description": "The task title/content"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional task description"
                    }
                },
                "required": ["user_id", "title"]
            }
        ),
        Tool(
            name="list_tasks",
            description="Retrieve tasks from the user's list",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The user ID"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter by status: all, pending, or completed"
                    }
                },
                "required": ["user_id"]
            }
        ),
        Tool(
            name="complete_task",
            description="Mark a task as complete",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The user ID"
                    },
                    "task_id": {
                        "type": "integer",
                        "description": "The task ID to complete"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The user ID"
                    },
                    "task_id": {
                        "type": "integer",
                        "description": "The task ID to delete"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="update_task",
            description="Update a task's title or mark it incomplete",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The user ID"
                    },
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
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="get_task_summary",
            description="Get a comprehensive summary and statistics of the user's tasks including completion rates, productivity insights, and task breakdown",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The user ID"
                    }
                },
                "required": ["user_id"]
            }
        ),
        Tool(
            name="get_productivity_insights",
            description="Get AI-friendly productivity insights and suggestions based on task patterns",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The user ID"
                    }
                },
                "required": ["user_id"]
            }
        )
    ]


@mcp.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls from the AI agent."""

    if name == "add_task":
        result = await add_task(
            user_id=arguments["user_id"],
            title=arguments["title"],
            description=arguments.get("description", "")
        )
    elif name == "list_tasks":
        result = await list_tasks(
            user_id=arguments["user_id"],
            status=arguments.get("status", "all")
        )
    elif name == "complete_task":
        result = await complete_task(
            user_id=arguments["user_id"],
            task_id=arguments["task_id"]
        )
    elif name == "delete_task":
        result = await delete_task(
            user_id=arguments["user_id"],
            task_id=arguments["task_id"]
        )
    elif name == "update_task":
        result = await update_task(
            user_id=arguments["user_id"],
            task_id=arguments["task_id"],
            title=arguments.get("title"),
            completed=arguments.get("completed")
        )
    elif name == "get_task_summary":
        result = await get_task_summary(
            user_id=arguments["user_id"]
        )
    elif name == "get_productivity_insights":
        result = await get_productivity_insights(
            user_id=arguments["user_id"]
        )
    else:
        result = {"error": f"Unknown tool: {name}"}

    return [TextContent(type="text", text=json.dumps(result))]


async def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Create a new task for the user."""
    with Session(engine) as session:
        try:
            uid = int(user_id)
            # Combine title and description
            content = title
            if description:
                content = f"{title} - {description}"

            todo = Todo(content=content, user_id=uid, completed=False)
            session.add(todo)
            session.commit()
            session.refresh(todo)

            return {
                "task_id": todo.id,
                "status": "created",
                "title": todo.content
            }
        except Exception as e:
            return {"error": str(e)}


async def list_tasks(user_id: str, status: str = "all") -> list:
    """List tasks for the user with optional status filter."""
    with Session(engine) as session:
        try:
            uid = int(user_id)
            query = select(Todo).where(Todo.user_id == uid)

            if status == "pending":
                query = query.where(Todo.completed == False)
            elif status == "completed":
                query = query.where(Todo.completed == True)

            todos = session.exec(query).all()

            return [
                {
                    "id": todo.id,
                    "title": todo.content,
                    "completed": todo.completed
                }
                for todo in todos
            ]
        except Exception as e:
            print(f"Error listing tasks: {str(e)}")
            return []


async def complete_task(user_id: str, task_id: int) -> dict:
    """Mark a task as completed."""
    with Session(engine) as session:
        try:
            uid = int(user_id)
            todo = session.get(Todo, task_id)

            if not todo:
                return {"error": "Task not found"}

            if todo.user_id != uid:
                return {"error": "Access denied"}

            todo.completed = True
            session.add(todo)
            session.commit()
            session.refresh(todo)

            return {
                "task_id": todo.id,
                "status": "completed",
                "title": todo.content
            }
        except Exception as e:
            return {"error": str(e)}


async def delete_task(user_id: str, task_id: int) -> dict:
    """Delete a task."""
    with Session(engine) as session:
        try:
            uid = int(user_id)
            todo = session.get(Todo, task_id)

            if not todo:
                return {"error": "Task not found"}

            if todo.user_id != uid:
                return {"error": "Access denied"}

            title = todo.content
            session.delete(todo)
            session.commit()

            return {
                "task_id": task_id,
                "status": "deleted",
                "title": title
            }
        except Exception as e:
            return {"error": str(e)}


async def update_task(
    user_id: str,
    task_id: int,
    title: Optional[str] = None,
    completed: Optional[bool] = None
) -> dict:
    """Update a task's details."""
    with Session(engine) as session:
        try:
            uid = int(user_id)
            todo = session.get(Todo, task_id)

            if not todo:
                return {"error": "Task not found"}

            if todo.user_id != uid:
                return {"error": "Access denied"}

            if title is not None:
                todo.content = title
            if completed is not None:
                todo.completed = completed

            session.add(todo)
            session.commit()
            session.refresh(todo)

            return {
                "task_id": todo.id,
                "status": "updated",
                "title": todo.content,
                "completed": todo.completed
            }
        except Exception as e:
            return {"error": str(e)}


async def get_task_summary(user_id: str) -> dict:
    """Get comprehensive task summary and statistics."""
    with Session(engine) as session:
        try:
            uid = int(user_id)
            query = select(Todo).where(Todo.user_id == uid)
            todos = session.exec(query).all()

            total_tasks = len(todos)
            completed_tasks = sum(1 for t in todos if t.completed)
            pending_tasks = total_tasks - completed_tasks
            completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

            # Get task titles for context
            pending_task_titles = [t.content for t in todos if not t.completed][:5]
            completed_task_titles = [t.content for t in todos if t.completed][:5]

            return {
                "summary": {
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "pending_tasks": pending_tasks,
                    "completion_rate": round(completion_rate, 1)
                },
                "pending_tasks_preview": pending_task_titles,
                "completed_tasks_preview": completed_task_titles,
                "status": "success"
            }
        except Exception as e:
            return {"error": str(e)}


async def get_productivity_insights(user_id: str) -> dict:
    """Get productivity insights and suggestions based on task patterns."""
    with Session(engine) as session:
        try:
            uid = int(user_id)
            query = select(Todo).where(Todo.user_id == uid)
            todos = session.exec(query).all()

            total_tasks = len(todos)
            completed_tasks = sum(1 for t in todos if t.completed)
            pending_tasks = total_tasks - completed_tasks
            completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

            # Generate insights based on patterns
            insights = []
            suggestions = []

            if total_tasks == 0:
                insights.append("You haven't created any tasks yet.")
                suggestions.append("Start by adding your first task to track your activities.")
            else:
                # Completion rate insights
                if completion_rate >= 80:
                    insights.append(f"Excellent productivity! You've completed {completion_rate:.0f}% of your tasks.")
                    suggestions.append("Keep up the great work! Consider setting more challenging goals.")
                elif completion_rate >= 50:
                    insights.append(f"Good progress! You've completed {completion_rate:.0f}% of your tasks.")
                    suggestions.append("Try to tackle a few more pending tasks to boost your completion rate.")
                elif completion_rate >= 25:
                    insights.append(f"You've completed {completion_rate:.0f}% of your tasks.")
                    suggestions.append("Consider breaking down larger tasks into smaller, manageable steps.")
                else:
                    insights.append(f"You have {pending_tasks} pending tasks out of {total_tasks} total.")
                    suggestions.append("Focus on completing one task at a time to build momentum.")

                # Pending task insights
                if pending_tasks > 10:
                    insights.append(f"You have {pending_tasks} pending tasks - quite a backlog!")
                    suggestions.append("Consider prioritizing your most important tasks and delegating or removing less critical ones.")
                elif pending_tasks > 5:
                    insights.append(f"You have {pending_tasks} tasks waiting to be completed.")
                    suggestions.append("Try to complete at least 2-3 tasks today to make progress.")
                elif pending_tasks > 0:
                    insights.append(f"You're close to clearing your task list with only {pending_tasks} pending tasks!")
                    suggestions.append("Finish these remaining tasks to achieve inbox zero!")
                else:
                    insights.append("Congratulations! You've completed all your tasks!")
                    suggestions.append("Time to plan your next set of goals and tasks.")

            # Get pending tasks for actionable suggestions
            pending_task_list = [{"id": t.id, "title": t.content} for t in todos if not t.completed][:5]

            return {
                "insights": insights,
                "suggestions": suggestions,
                "metrics": {
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "pending_tasks": pending_tasks,
                    "completion_rate": round(completion_rate, 1)
                },
                "actionable_tasks": pending_task_list,
                "status": "success"
            }
        except Exception as e:
            return {"error": str(e)}


async def main():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await mcp.run(
            read_stream,
            write_stream,
            mcp.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
