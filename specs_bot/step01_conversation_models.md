# Step 01: Add Conversation Models for Chat History

**Action:** Extend `backend/models.py` to add `Conversation` and `Message` models for persisting chat history.

**Reasoning:** Phase 3 requires stateless chat endpoints that persist conversation state to the database. This enables conversation resumption after server restarts and maintains context across multiple requests.

**Implementation Details:**

## New Models

### Conversation Model
```python
class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: Optional[str] = Field(default="New Chat")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Message Model
```python
class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    role: str = Field(...)  # "user" | "assistant" | "system"
    content: str = Field(...)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    tool_calls: Optional[str] = Field(default=None)  # JSON string of tool calls
```

## Schema Additions (schemas.py)
```python
class ConversationCreate(SQLModel):
    title: Optional[str] = "New Chat"

class ConversationRead(SQLModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime

class MessageCreate(SQLModel):
    content: str

class MessageRead(SQLModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime
```

**Dependencies:** None - extends existing models.py
