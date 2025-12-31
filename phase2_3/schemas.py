from typing import Optional, List
from datetime import datetime

from sqlmodel import SQLModel


class Token(SQLModel):
    access_token: str
    token_type: str


class TokenData(SQLModel):
    username: Optional[str] = None


class UserCreate(SQLModel):
    username: str
    email: str
    full_name: Optional[str] = None
    password: str


class UserRead(SQLModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    disabled: bool


class TodoCreate(SQLModel):
    content: str


class TodoRead(SQLModel):
    id: int
    content: str
    completed: bool
    user_id: Optional[int] = None


class TodoUpdate(SQLModel):
    content: str
    completed: bool


# Chat schemas for Phase 3
class ChatRequest(SQLModel):
    message: str
    conversation_id: Optional[int] = None


class ChatResponse(SQLModel):
    conversation_id: int
    message: str
    role: str = "assistant"


class ConversationCreate(SQLModel):
    title: Optional[str] = "New Chat"


class ConversationRead(SQLModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime


class MessageRead(SQLModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime


class ConversationDetail(SQLModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageRead] = []
