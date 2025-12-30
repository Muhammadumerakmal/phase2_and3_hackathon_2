# Step 07: Phase 3 Architecture Overview

**Action:** Document the complete Phase 3 architecture and component interactions.

**Reasoning:** Clear architecture documentation ensures all components integrate correctly and developers understand the system flow.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PHASE 3 ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐         ┌────────────────────────────────────────────────┐   │
│  │              │         │              FastAPI Server                     │   │
│  │   Frontend   │         │  ┌────────────────────────────────────────┐    │   │
│  │   (Next.js   │  HTTP   │  │           Chat Router                  │    │   │
│  │   + ChatKit) │ ◄─────► │  │  POST /chat                            │    │   │
│  │              │         │  │  GET  /chat/conversations              │    │   │
│  └──────────────┘         │  │  GET  /chat/conversations/{id}         │    │   │
│                           │  └──────────────┬─────────────────────────┘    │   │
│                           │                 │                               │   │
│                           │                 ▼                               │   │
│                           │  ┌────────────────────────────────────────┐    │   │
│                           │  │         OpenAI Agent                    │    │   │
│                           │  │  - Natural language understanding       │    │   │
│                           │  │  - Tool selection & invocation          │    │   │
│                           │  │  - Response generation                  │    │   │
│                           │  └──────────────┬─────────────────────────┘    │   │
│                           │                 │                               │   │
│                           │                 ▼ MCP Protocol                  │   │
│                           │  ┌────────────────────────────────────────┐    │   │
│                           │  │          MCP Server                     │    │   │
│                           │  │  Tools:                                 │    │   │
│                           │  │  - add_task(user_id, title, desc)       │    │   │
│                           │  │  - list_tasks(user_id, status)          │    │   │
│                           │  │  - complete_task(user_id, task_id)      │    │   │
│                           │  │  - delete_task(user_id, task_id)        │    │   │
│                           │  │  - update_task(user_id, task_id, ...)   │    │   │
│                           │  └──────────────┬─────────────────────────┘    │   │
│                           │                 │                               │   │
│                           └─────────────────┼───────────────────────────────┘   │
│                                             │                                    │
│                                             ▼                                    │
│                           ┌─────────────────────────────────────────────────┐   │
│                           │         Neon PostgreSQL Database                 │   │
│                           │  Tables:                                         │   │
│                           │  - user (existing)                               │   │
│                           │  - todo (existing)                               │   │
│                           │  - conversation (new)                            │   │
│                           │  - message (new)                                 │   │
│                           └─────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Chat Request Flow

```
User Input: "Add buy milk to my tasks"
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. Frontend sends POST /chat                                     │
│    { message: "Add buy milk to my tasks", conversation_id: 1 }  │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Chat Router authenticates user (JWT token)                    │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Load conversation history from database                       │
│    SELECT * FROM message WHERE conversation_id = 1               │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Store user message in database                                │
│    INSERT INTO message (role='user', content='...', conv_id=1)  │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Run OpenAI Agent with history + new message                   │
│    Agent analyzes: "User wants to add a task"                   │
│    Agent decides: Use add_task tool                             │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Agent calls MCP tool: add_task                                │
│    { user_id: "123", title: "buy milk" }                        │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. MCP Server creates todo in database                           │
│    INSERT INTO todo (content='buy milk', user_id=123)           │
│    Returns: { task_id: 5, status: "created", title: "buy milk" }│
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Agent generates response                                      │
│    "I've added 'buy milk' to your tasks!"                       │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. Store assistant message in database                           │
│    INSERT INTO message (role='assistant', content='...', ...)   │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. Return response to frontend                                  │
│     { conversation_id: 1, message: "I've added...", role: "..." }│
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| Frontend (ChatKit) | UI, user input, message display, conversation management |
| Chat Router | Authentication, conversation persistence, agent orchestration |
| OpenAI Agent | Natural language understanding, tool selection, response generation |
| MCP Server | Task CRUD operations, database interactions |
| Database | Persistent storage for users, todos, conversations, messages |

## Key Architecture Benefits

| Aspect | Benefit |
|--------|---------|
| MCP Tools | Standardized interface for AI to interact with your app |
| Single Endpoint | Simpler API - AI handles routing to tools |
| Stateless Server | Scalable, resilient, horizontally scalable |
| Tool Abstraction | Easy to add new capabilities without changing agent |

## Security Considerations

1. **Authentication**: All chat endpoints require valid JWT token
2. **Authorization**: Users can only access their own conversations and tasks
3. **Input Validation**: Agent validates tool inputs before execution
4. **Rate Limiting**: Consider adding rate limits to prevent abuse
5. **API Key Security**: OpenAI API key stored in environment variables only
