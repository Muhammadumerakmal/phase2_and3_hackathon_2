"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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

function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  activeConversation
}: {
  messages: Message[],
  isLoading: boolean,
  onSendMessage: (content: string) => void,
  activeConversation: Conversation | null
}) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 bg-card/50 rounded-2xl border border-border/50 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-border/50">
        <h2 className="text-xl font-semibold gradient-text">Todo Assistant</h2>
        <p className="text-sm text-muted-foreground">
          AI-powered task management
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message... (e.g., 'Add buy groceries to my tasks')"
            disabled={isLoading}
            className="flex-1 bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-11"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="h-11 w-11 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Icons
function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth/login");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [router]);

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth/login");
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/auth/login");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      localStorage.removeItem("access_token");
      router.push("/auth/login");
      return false;
    }
  }, [router]);

  const fetchConversations = useCallback(async () => {
    const isValid = await validateToken();
    if (!isValid) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers,
      });
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/auth/login");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [getAuthHeaders, validateToken, router]);

  const fetchMessages = useCallback(async (conversationId: number) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`${API_URL}/chat/conversations/${conversationId}`, {
        headers,
      });
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/auth/login");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [getAuthHeaders, router]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation, fetchMessages]);

  const handleNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
  };

  const handleDeleteConversation = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`${API_URL}/chat/conversations/${conversationId}`, {
        method: "DELETE",
        headers,
      });
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/auth/login");
        return;
      }
      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (activeConversation?.id === conversationId) {
          setActiveConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: Date.now(),
      conversation_id: activeConversation?.id || 0,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    // Create temporary assistant message that will be streamed
    const tempAssistantId = Date.now() + 1;
    const tempAssistantMessage: Message = {
      id: tempAssistantId,
      conversation_id: activeConversation?.id || 0,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempAssistantMessage]);
    setIsLoading(true);

    try {
      // Try streaming endpoint first
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: content,
          conversation_id: activeConversation?.id || null,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/auth/login");
        return;
      }

      if (!response.ok || !response.body) {
        // Fallback to regular endpoint
        throw new Error("Streaming not available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let conversationId = activeConversation?.id;
      let currentContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "start") {
                conversationId = data.conversation_id;
                if (!activeConversation) {
                  const newConv: Conversation = {
                    id: conversationId,
                    user_id: 0,
                    title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };
                  setActiveConversation(newConv);
                  setConversations(prev => [newConv, ...prev]);
                }
              } else if (data.type === "content") {
                currentContent += data.content;
                setMessages(prev => prev.map(msg =>
                  msg.id === tempAssistantId
                    ? { ...msg, content: currentContent }
                    : msg
                ));
              } else if (data.type === "done") {
                setMessages(prev => prev.map(msg =>
                  msg.id === tempAssistantId
                    ? { ...msg, conversation_id: conversationId || msg.conversation_id }
                    : msg
                ));
              } else if (data.type === "error") {
                throw new Error(data.error || "Stream error");
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming failed, falling back:", error);
      // Fallback to regular endpoint
      try {
        const response = await fetch(`${API_URL}/chat/`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: content,
            conversation_id: activeConversation?.id || null,
          }),
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          router.push("/auth/login");
          return;
        }

        if (response.ok) {
          const data = await response.json();

          if (!activeConversation) {
            const newConv: Conversation = {
              id: data.conversation_id || Date.now(),
              user_id: 0,
              title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setActiveConversation(newConv);
            setConversations(prev => [newConv, ...prev]);
          }

          setMessages(prev => prev.map(msg =>
            msg.id === tempAssistantId
              ? { ...msg, content: data.message, conversation_id: data.conversation_id }
              : msg
          ));
        } else {
          throw new Error("Failed to send message");
        }
      } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
        setMessages(prev => prev.map(msg =>
          msg.id === tempAssistantId
            ? { ...msg, content: "Sorry, I couldn't connect to the server." }
            : msg
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 bg-card/50 rounded-2xl border border-border/50 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary/30"
            >
              <PlusIcon className="h-5 w-5" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No conversations yet.
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeConversation?.id === conv.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <ChatBubbleIcon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          activeConversation={activeConversation}
        />
      </div>
    </DashboardLayout>
  );
}

// Subcomponents

function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
        <RobotIcon className="h-10 w-10 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Welcome to Todo Assistant!</h3>
        <p className="text-muted-foreground max-w-md">
          I can help you manage your tasks through natural conversation.
          Try saying something like <span className="font-medium">"Add buy groceries to my tasks"</span> or <span className="font-medium">"Show me my pending tasks"</span>.
        </p>
      </div>
    </div>
  );
}

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
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mt-4">
      <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3 border border-border/50">
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// Icons (inline SVG)
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChatBubbleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function RobotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}
