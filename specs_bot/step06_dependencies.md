# Step 06: Update Dependencies and Configuration

**Action:** Update `backend/pyproject.toml` with new dependencies for Phase 3.

**Reasoning:** Phase 3 requires additional Python packages for the MCP server and OpenAI Agents SDK.

**Implementation Details:**

## Backend Dependencies (pyproject.toml)

Add the following dependencies:

```toml
[project]
dependencies = [
    # Existing dependencies...
    "sqlmodel>=0.0.22",
    "fastapi>=0.111.1",
    "uvicorn[standard]>=0.30.1",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-dotenv>=1.0.0",
    "psycopg2-binary>=2.9.9",
    "python-multipart>=0.0.9",

    # Phase 3 - New dependencies
    "mcp>=1.0.0",                    # Official MCP SDK
    "openai-agents>=0.1.0",          # OpenAI Agents SDK
    "openai>=1.0.0",                 # OpenAI API client
    "httpx>=0.27.0",                 # Async HTTP client
]
```

## Environment Variables (.env)

Add new environment variables:

```env
# Existing
BETTER_AUTH_SECRET=your-secret
DATABASE_URL=postgresql://...

# Phase 3 - New variables
OPENAI_API_KEY=sk-...                    # OpenAI API key for agent
OPENAI_MODEL=gpt-4o-mini                 # Model to use for agent
MCP_SERVER_PATH=./mcp_server.py          # Path to MCP server
```

## Frontend Dependencies (package.json)

Optional ChatKit dependency (if using advanced features):

```json
{
  "dependencies": {
    "@openai/chatkit-react": "^0.1.0"
  }
}
```

## Installation Commands

### Backend
```bash
cd backend
uv sync  # or pip install -e .
```

### Frontend
```bash
cd frontend/todo_ui
npm install
```

## Configuration Files

### MCP Server Config (backend/mcp_config.json)

```json
{
  "mcpServers": {
    "todo-server": {
      "command": "python",
      "args": ["mcp_server.py"],
      "cwd": "./backend",
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

**Dependencies:** None - configuration step
