# Step 03: Implement AI Agent with Google Gemini API

**Action:** Create `backend/agent.py` implementing the AI agent using Google Gemini API with function calling that connects to MCP tools.

**Reasoning:** The Google Gemini API provides a powerful framework for building AI agents with function calling capabilities. The agent interprets natural language and invokes appropriate MCP tools to manage tasks, provide summaries, and offer productivity insights.

**Implementation Details:**

## Agent Configuration

```python
from google import genai
from google.genai import types

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

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
"""
```

## Tool Definitions

```python
# Tool definitions for Gemini function calling
TOOLS = [
    types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="add_task",
                description="Create a new task for the user",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "title": types.Schema(type=types.Type.STRING, description="The task title"),
                        "description": types.Schema(type=types.Type.STRING, description="Optional description")
                    },
                    required=["title"]
                )
            ),
            types.FunctionDeclaration(
                name="list_tasks",
                description="Retrieve tasks from the user's list",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "status": types.Schema(
                            type=types.Type.STRING,
                            enum=["all", "pending", "completed"],
                            description="Filter by status"
                        )
                    },
                    required=[]
                )
            ),
            types.FunctionDeclaration(
                name="complete_task",
                description="Mark a task as complete",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "task_id": types.Schema(type=types.Type.INTEGER, description="The task ID")
                    },
                    required=["task_id"]
                )
            ),
            types.FunctionDeclaration(
                name="delete_task",
                description="Delete a task",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "task_id": types.Schema(type=types.Type.INTEGER, description="The task ID")
                    },
                    required=["task_id"]
                )
            ),
            types.FunctionDeclaration(
                name="update_task",
                description="Update a task's title or completion status",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "task_id": types.Schema(type=types.Type.INTEGER, description="The task ID"),
                        "title": types.Schema(type=types.Type.STRING, description="New title"),
                        "completed": types.Schema(type=types.Type.BOOLEAN, description="Completion status")
                    },
                    required=["task_id"]
                )
            ),
            types.FunctionDeclaration(
                name="get_task_summary",
                description="Get task summary and statistics",
                parameters=types.Schema(type=types.Type.OBJECT, properties={}, required=[])
            ),
            types.FunctionDeclaration(
                name="get_productivity_insights",
                description="Get productivity insights and suggestions",
                parameters=types.Schema(type=types.Type.OBJECT, properties={}, required=[])
            )
        ]
    )
]
```

## Agent Runner

```python
async def run_agent(user_id: int, message: str, conversation_history: list) -> str:
    """Run the AI agent with the given message and history."""
    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    # Build contents array with history
    contents = []
    for msg in conversation_history:
        role = "user" if msg.get("role") == "user" else "model"
        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=msg.get("content", ""))])
        )

    # Add new user message
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))

    # Create generation config
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=TOOLS,
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
    )

    # Initial API call
    response = client.models.generate_content(model=model, contents=contents, config=config)

    # Handle function calls in a loop until we get a text response
    while response.candidates and response.candidates[0].content.parts:
        parts = response.candidates[0].content.parts
        function_calls = [p for p in parts if p.function_call]

        if not function_calls:
            # No function calls, return the text response
            text_parts = [p.text for p in parts if hasattr(p, 'text') and p.text]
            return " ".join(text_parts) if text_parts else "I've completed your request."

        # Process function calls and get results
        function_responses = []
        for part in function_calls:
            fc = part.function_call
            result = await execute_tool(fc.name, dict(fc.args) if fc.args else {}, user_id)
            function_responses.append(
                types.Part.from_function_response(name=fc.name, response={"result": result})
            )

        # Add responses and continue conversation
        contents.append(response.candidates[0].content)
        contents.append(types.Content(role="user", parts=function_responses))
        response = client.models.generate_content(model=model, contents=contents, config=config)

    return "I've completed your request."
```

## Agent Behavior Specification

| Behavior | Description |
|----------|-------------|
| Task Creation | When user mentions adding/creating/remembering something, use add_task |
| Task Listing | When user asks to see/show/list tasks, use list_tasks with appropriate filter |
| Task Completion | When user says done/complete/finished, use complete_task |
| Task Deletion | When user says delete/remove/cancel, use delete_task |
| Task Update | When user says change/update/rename, use update_task |
| Task Summary | When user asks for summary/overview/statistics/report, use get_task_summary |
| Productivity Insights | When user asks for insights/suggestions/tips or "how am I doing", use get_productivity_insights |
| Confirmation | Always confirm actions with friendly response |
| Error Handling | Gracefully handle task not found and other errors |

## Example Conversations

**User:** "Add buy milk to my tasks"
**Agent:** [Calls add_task with title="Buy milk"]
**Response:** "I've added 'Buy milk' to your tasks!"

**User:** "What do I need to do?"
**Agent:** [Calls list_tasks with status="pending"]
**Response:** "Here are your pending tasks:\n1. Buy milk\n2. Call mom\n3. Finish report"

**User:** "I finished buying milk"
**Agent:** [Calls complete_task for "Buy milk"]
**Response:** "Great job! I've marked 'Buy milk' as completed."

**User:** "Give me a summary of my tasks"
**Agent:** [Calls get_task_summary]
**Response:** "Here's your task summary:\n- Total tasks: 10\n- Completed: 7 (70%)\n- Pending: 3\n\nPending tasks: Buy groceries, Call dentist, Finish report"

**User:** "How am I doing? Any tips?"
**Agent:** [Calls get_productivity_insights]
**Response:** "Great progress! You've completed 70% of your tasks.\n\nSuggestions:\n- Try to tackle a few more pending tasks to boost your completion rate\n- Focus on completing one task at a time to build momentum"

**Dependencies:** `google-genai` (Google Generative AI SDK)
