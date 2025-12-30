
# Step 05: Build ChatKit-based Frontend UI

**Action:** Create chat interface in `frontend/todo_ui/app/chat/` using OpenAI ChatKit.

**Reasoning:** OpenAI ChatKit provides pre-built React components for chat interfaces, reducing development time and ensuring a polished user experience.

**Implementation Details:**

## File Structure

```
frontend/todo_ui/app/
├── chat/
│   └── page.tsx           # Main chat page
├── components/
│   ├── ChatInterface.tsx  # Chat wrapper component
│   ├── MessageList.tsx    # Message display component
│   ├── MessageInput.tsx   # Input component
│   └── ConversationList.tsx # Sidebar with conversations
```

## ChatKit Setup

### Installation
```bash
npm install @openai/chatkit-react
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key-here  # For production
```

## Main Chat Page (app/chat/page.tsx)

```tsx
"use client";

import { useState, useEffect } from "react";
import { ChatInterface } from "../components/ChatInterface";
import { ConversationList } from "../components/ConversationList";
import { Sidebar } from "../components/Sidebar";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // Fetch conversations on load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <ConversationList
        conversations={conversations}
        activeId={activeConversation?.id}
        onSelect={setActiveConversation}
        onNewChat={handleNewChat}
      />
      <ChatInterface
        messages={messages}
        conversationId={activeConversation?.id}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
```

## Chat Interface Component

```tsx
interface ChatInterfaceProps {
  messages: Message[];
  conversationId: number | null;
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatInterface({ messages, conversationId, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSendMessage(input);
      setInput("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Todo Assistant</h2>
        <p className="text-gray-400 text-sm">Ask me to manage your tasks</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <WelcomeMessage />
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message... (e.g., 'Add buy groceries to my tasks')"
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

## API Integration

```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function sendMessage(message: string, conversationId?: number): Promise<ChatResponse> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

async function fetchConversations(): Promise<Conversation[]> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/chat/conversations`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}
```

## UI Features

### Welcome Message
Shows suggested prompts for new users:
- "Add a task to buy groceries"
- "Show me my pending tasks"
- "Mark task 1 as complete"

### Message Bubbles
- User messages: Right-aligned, blue background
- Assistant messages: Left-aligned, gray background
- Timestamps shown on hover

### Typing Indicator
Animated dots while waiting for agent response

### Conversation Sidebar
- List of previous conversations
- "New Chat" button
- Delete conversation option

## Sidebar Navigation Update

Add chat link to existing Sidebar component:

```tsx
// In Sidebar.tsx, add to navigation items
{
  name: "AI Chat",
  href: "/chat",
  icon: ChatBubbleIcon,
}
```

**Dependencies:** `@openai/chatkit-react` (optional for advanced features)
