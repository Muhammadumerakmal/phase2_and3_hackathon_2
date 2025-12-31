# Todo AI Chatbot - Phase 3

AI-powered chatbot interface for managing todos through natural language using MCP (Model Context Protocol) server architecture.

## Architecture

```
Frontend (Next.js)  →  FastAPI Server  →  Gemini Agent  →  MCP Server  →  PostgreSQL
     │                      │                  │                │              │
   Chat UI            Chat Router       Gemini 2.0 Flash    Todo Tools      Database
```

## Features

- Natural language task management
- Conversational AI interface powered by Google Gemini
- Stateless server with persistent conversations
- MCP tools for CRUD operations
- User authentication with JWT

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16 + React 19 |
| Backend | Python FastAPI |
| AI Framework | Google Gemini API (function calling) |
| MCP Server | Official MCP SDK |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | JWT (python-jose) |

## Project Structure

```
phase2_app/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Database models (User, Todo, Conversation, Message)
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database configuration
│   ├── auth.py              # JWT authentication
│   ├── agent.py             # OpenAI Agent implementation
│   ├── mcp_server.py        # MCP Server with todo tools
│   └── routers/
│       ├── todos.py         # Todo CRUD endpoints
│       ├── users.py         # User endpoints
│       ├── auth.py          # Auth endpoints
│       └── chat.py          # Chat endpoints (Phase 3)
├── frontend/todo_ui/
│   └── app/
│       ├── chat/page.tsx    # AI Chat interface
│       ├── components/      # React components
│       └── auth/            # Login/Register pages
└── specs/
    └── phase3/              # Phase 3 specifications
```

## Setup Instructions

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL (or Neon account)
- Google Gemini API key (get one at https://aistudio.google.com/apikey)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -e .
# or: uv sync

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL
# - BETTER_AUTH_SECRET (used for JWT token)
# - GOOGLE_API_KEY (your Gemini API key)

# Run server
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend/todo_ui

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

```env
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_SECRET=your-jwt-secret
GOOGLE_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
```

## API Endpoints

### Chat Endpoints (Phase 3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/` | Send message to AI assistant |
| GET | `/chat/conversations` | List user's conversations |
| GET | `/chat/conversations/{id}` | Get conversation with messages |
| DELETE | `/chat/conversations/{id}` | Delete conversation |

### Example Chat Request

```json
POST /chat/
{
  "message": "Add buy groceries to my tasks",
  "conversation_id": null  // null for new conversation
}
```

### Response

```json
{
  "conversation_id": 1,
  "message": "I've added 'buy groceries' to your tasks!",
  "role": "assistant"
}
```

## MCP Tools

The AI agent has access to these tools:

| Tool | Purpose |
|------|---------|
| `add_task` | Create a new task |
| `list_tasks` | List tasks (all/pending/completed) |
| `complete_task` | Mark task as complete |
| `delete_task` | Delete a task |
| `update_task` | Update task title/status |

## Usage Examples

Natural language commands the AI understands:

- "Add buy milk to my tasks"
- "Show me my pending tasks"
- "What tasks do I have?"
- "Mark task 1 as complete"
- "I finished buying groceries"
- "Delete task 2"
- "Update task 3 to 'buy organic milk'"

## Development

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend/todo_ui
npm test
```

### Database Migrations

The application auto-creates tables on startup. For manual migrations:

```python
from database import create_db_and_tables
create_db_and_tables()
```

## Deployment

### Vercel (Frontend)

1. Connect repository to Vercel
2. Set environment variables
3. Configure domain allowlist at OpenAI (if using ChatKit)

### Backend (Any Python host)

1. Set environment variables
2. Run: `uvicorn main:app --host 0.0.0.0 --port 8000`

## License

MIT