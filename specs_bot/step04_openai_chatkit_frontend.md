# Step 04: Frontend Chat UI with OpenAI ChatKit

**Action:** Implement the frontend chat interface using `@openai/chatkit-react` package for a polished chat experience.

**Reasoning:** OpenAI ChatKit provides pre-built React components and hooks for building chat interfaces. This ensures a professional, accessible, and feature-rich chat UI that integrates seamlessly with our backend API.

**Implementation Details:**

## Dependencies

```json
{
  "dependencies": {
    "@openai/chatkit-react": "^1.4.0"
  }
}
```

## Environment Variables

```env
# Required for hosted/production deployment
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key-here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Domain Allowlist Configuration (Required for Production)

Before deploying to production:

1. Deploy frontend to get production URL (e.g., `https://your-app.vercel.app`)
2. Navigate to: https://platform.openai.com/settings/organization/security/domain-allowlist
3. Click "Add domain" and enter your frontend URL
4. Save and copy the domain key to `NEXT_PUBLIC_OPENAI_DOMAIN_KEY`

**Note:** Local development (`localhost`) typically works without domain configuration.

## Chat Page Implementation

```typescript
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChatContainer, useChat } from "@openai/chatkit-react";
import DashboardLayout from "../components/DashboardLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function ChatPage() {
  // State management for conversations and messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auth headers for API calls
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  // Send message to backend (which uses Gemini AI)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: Date.now(),
      conversation_id: activeConversation?.id || 0,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await fetch(`${API_URL}/chat/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: userMessage,
          conversation_id: activeConversation?.id || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add assistant response from Gemini backend
        const assistantMessage: Message = {
          id: Date.now() + 1,
          conversation_id: data.conversation_id,
          role: "assistant",
          content: data.message,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of component
}
```

## UI Components

### Message Bubble
```typescript
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-primary text-white rounded-br-md"
            : "bg-muted/50 text-foreground rounded-bl-md border border-border/50"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? "text-white/70" : "text-muted-foreground"}`}>
          {new Date(message.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
```

### Typing Indicator
```typescript
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border/50">
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
```

### Welcome Message with Suggestions
```typescript
function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
        <RobotIcon className="h-10 w-10 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Welcome to Todo Assistant!</h3>
        <p className="text-muted-foreground max-w-md">
          Powered by OpenAI ChatKit. Try asking me to:
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
        <SuggestionCard text="Add a task to buy groceries" />
        <SuggestionCard text="Show me my pending tasks" />
        <SuggestionCard text="Give me a summary of my tasks" />
        <SuggestionCard text="How am I doing? Any tips?" />
      </div>
    </div>
  );
}
```

## Features

| Feature | Description |
|---------|-------------|
| Conversation Management | Create, list, select, and delete conversations |
| Message History | Persistent message history from database |
| Optimistic Updates | Messages appear instantly before server confirmation |
| Typing Indicator | Visual feedback while AI is generating response |
| Auto-scroll | Automatically scrolls to newest messages |
| Responsive Design | Works on desktop and mobile |
| Error Handling | Graceful error messages for failed requests |

## Architecture

```
Frontend (Next.js + OpenAI ChatKit)
         │
         ▼
    Backend API (FastAPI)
         │
         ▼
    AI Agent (Google Gemini)
         │
         ▼
    MCP Tools (Task Management)
         │
         ▼
    Database (SQLite/PostgreSQL)
```

## File Structure

```
frontend/todo_ui/
├── app/
│   ├── chat/
│   │   └── page.tsx          # Main chat page with ChatKit
│   ├── components/
│   │   └── DashboardLayout.tsx
│   └── layout.tsx
├── package.json              # Includes @openai/chatkit-react
└── .env.local               # Environment variables
```

**Dependencies:** `@openai/chatkit-react`, `next`, `react`
