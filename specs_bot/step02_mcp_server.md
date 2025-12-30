# Step 02: Implement MCP Server with Official MCP SDK

**Action:** Create `backend/mcp_server.py` implementing an MCP server that exposes task operations as tools.

**Reasoning:** MCP (Model Context Protocol) provides a standardized interface for AI agents to interact with the todo application. The AI agent will use these tools to manage tasks on behalf of users.

**Implementation Details:**

## MCP Tools Specification

### Tool: add_task
| Field | Value |
|-------|-------|
| Purpose | Create a new task |
| Parameters | user_id (string, required), title (string, required), description (string, optional) |
| Returns | task_id, status, title |

```python
@mcp.tool()
async def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Create a new task for the user."""
    # Implementation creates todo in database
    return {"task_id": id, "status": "created", "title": title}
```

### Tool: list_tasks
| Field | Value |
|-------|-------|
| Purpose | Retrieve tasks from the list |
| Parameters | user_id (string, required), status (string, optional: "all", "pending", "completed") |
| Returns | Array of task objects |

```python
@mcp.tool()
async def list_tasks(user_id: str, status: str = "all") -> list:
    """List tasks for the user with optional status filter."""
    return [{"id": 1, "title": "...", "completed": False}, ...]
```

### Tool: complete_task
| Field | Value |
|-------|-------|
| Purpose | Mark a task as complete |
| Parameters | user_id (string, required), task_id (integer, required) |
| Returns | task_id, status, title |

```python
@mcp.tool()
async def complete_task(user_id: str, task_id: int) -> dict:
    """Mark a task as completed."""
    return {"task_id": task_id, "status": "completed", "title": "..."}
```

### Tool: delete_task
| Field | Value |
|-------|-------|
| Purpose | Delete a task |
| Parameters | user_id (string, required), task_id (integer, required) |
| Returns | task_id, status |

```python
@mcp.tool()
async def delete_task(user_id: str, task_id: int) -> dict:
    """Delete a task."""
    return {"task_id": task_id, "status": "deleted"}
```

### Tool: update_task
| Field | Value |
|-------|-------|
| Purpose | Update a task's title or description |
| Parameters | user_id (string, required), task_id (integer, required), title (string, optional), description (string, optional) |
| Returns | task_id, status, title |

```python
@mcp.tool()
async def update_task(user_id: str, task_id: int, title: str = None, description: str = None) -> dict:
    """Update a task's details."""
    return {"task_id": task_id, "status": "updated", "title": "..."}
```

### Tool: get_task_summary
| Field | Value |
|-------|-------|
| Purpose | Get comprehensive task summary and statistics |
| Parameters | user_id (string, required) |
| Returns | summary object with total_tasks, completed_tasks, pending_tasks, completion_rate, task previews |

```python
@mcp.tool()
async def get_task_summary(user_id: str) -> dict:
    """Get comprehensive task summary and statistics."""
    return {
        "summary": {
            "total_tasks": 10,
            "completed_tasks": 7,
            "pending_tasks": 3,
            "completion_rate": 70.0
        },
        "pending_tasks_preview": ["Task 1", "Task 2"],
        "completed_tasks_preview": ["Task 3", "Task 4"],
        "status": "success"
    }
```

### Tool: get_productivity_insights
| Field | Value |
|-------|-------|
| Purpose | Get AI-friendly productivity insights and suggestions based on task patterns |
| Parameters | user_id (string, required) |
| Returns | insights array, suggestions array, metrics object, actionable_tasks list |

```python
@mcp.tool()
async def get_productivity_insights(user_id: str) -> dict:
    """Get productivity insights and suggestions based on task patterns."""
    return {
        "insights": ["Excellent productivity! You've completed 80% of your tasks."],
        "suggestions": ["Keep up the great work! Consider setting more challenging goals."],
        "metrics": {
            "total_tasks": 10,
            "completed_tasks": 8,
            "pending_tasks": 2,
            "completion_rate": 80.0
        },
        "actionable_tasks": [{"id": 1, "title": "Buy groceries"}],
        "status": "success"
    }
```

## MCP Server Setup
```python
from mcp.server import Server
from mcp.server.stdio import stdio_server

mcp = Server("todo-mcp-server")

# Register all tools...

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await mcp.run(read_stream, write_stream)
```

## File Structure
```
backend/
├── mcp_server.py      # MCP server implementation
├── mcp_tools.py       # Tool implementations (database operations)
└── mcp_config.json    # MCP server configuration
```

**Dependencies:** `mcp` (Official MCP SDK)
