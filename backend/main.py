import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables
from routers import todos, users, auth, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="Todo AI Chatbot API",
    description="AI-powered todo management with natural language interface",
    version="3.0.0",
    lifespan=lifespan
)

# Configure CORS for development
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todos.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
