---
title: Todo AI Chatbot API
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
sdk_version: "3.13"
app_file: Dockerfile
pinned: false
---

# Todo AI Chatbot API

AI-powered todo management with natural language interface - Phase 3 with OpenAI SDK and OpenRouter.

## Features

- FastAPI-based REST API
- PostgreSQL/SQLite database with SQLModel
- User authentication (JWT)
- AI-powered chat interface using OpenRouter
- Todo management with natural language commands
- MCP (Model Context Protocol) tools integration

## Deployment

This space is deployed on HuggingFace Spaces with Docker.

## Environment Variables

Configure these in your HuggingFace Space settings:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon, Supabase, etc.) |
| `SECRET_KEY` | Yes | JWT secret key for authentication |
| `OPEN_ROUTER_KEY` | Yes | OpenRouter API key for AI features |
| `OPENROUTER_MODEL` | No | Model to use (default: openai/gpt-4o-mini) |
| `BETTER_AUTH_URL` | No | Your frontend URL for CORS |

### Example DATABASE_URL (Neon PostgreSQL):
```
postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### Get OpenRouter Key:
1. Go to https://openrouter.ai/keys
2. Create an API key
3. Add credits to your account

## API Endpoints

- `GET /` - Health check
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /todos` - List todos
- `POST /todos` - Create todo
- `PUT /todos/{id}` - Update todo
- `DELETE /todos/{id}` - Delete todo
- `POST /chat` - AI chat with todo management

## Running Locally

```bash
# Clone and setup
cd phase2_3

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r pyproject.toml

# Create .env file with your credentials
cp .env.example .env
# Edit .env with your API keys

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Integration

Your Next.js frontend should call this API at:
```
https://your-hf-space-name.hf.space
```

Update the API URL in your frontend code.
