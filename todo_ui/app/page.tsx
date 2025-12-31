"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import StatsCards from "./components/StatsCards";
import TodoList from "./components/TodoList";
import AddTodo from "./components/AddTodo";

interface Todo {
  id: number;
  content: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  const getAuthHeaders = useCallback((token: string) => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchTodos = useCallback(
    async (token: string) => {
      try {
        setIsLoading(true);
        const response = await fetch("http://127.0.0.1:8000/todos", {
          headers: getAuthHeaders(token),
        });
        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthHeaders, router]
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetchTodos(token);
  }, [router, fetchTodos]);

  const addTodo = async (content: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      setIsAddingTodo(true);
      const response = await fetch("http://127.0.0.1:8000/todos", {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ content, completed: false }),
      });
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newTodo = await response.json();
      setTodos((prevTodos) => [...prevTodos, newTodo]);
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setIsAddingTodo(false);
    }
  };

  const toggleTodo = async (id: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      const todoToToggle = todos.find((todo) => todo.id === id);
      if (!todoToToggle) return;

      const updatedTodo = { ...todoToToggle, completed: !todoToToggle.completed };

      const response = await fetch(`http://127.0.0.1:8000/todos/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(updatedTodo),
      });

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/todos/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/auth/login");
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.filter((t) => !t.completed).length;
  const totalCount = todos.length;

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Background decorations */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-success/5 rounded-full blur-3xl" />
        </div>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">
                  {getGreeting()}! <span className="wave">👋</span>
                </h1>
                <p className="text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Notification bell */}
                <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200">
                  <BellIcon className="h-5 w-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="mb-8">
            <StatsCards
              totalTasks={totalCount}
              completedTasks={completedCount}
              pendingTasks={pendingCount}
            />
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tasks Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Todo */}
              <AddTodo onAdd={addTodo} isLoading={isAddingTodo} />

              {/* Todo List */}
              <TodoList
                todos={todos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                isLoading={isLoading}
              />
            </div>

            {/* Right Sidebar - Activity & Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted transition-all duration-200 text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <PlusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Add Task</p>
                      <p className="text-xs text-muted-foreground">Create a new task</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted transition-all duration-200 text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                      <CheckAllIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Complete All</p>
                      <p className="text-xs text-muted-foreground">Mark all as done</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted transition-all duration-200 text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
                      <FilterIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Filter Tasks</p>
                      <p className="text-xs text-muted-foreground">Sort by priority</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Activity Card */}
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                {todos.length > 0 ? (
                  <div className="space-y-3">
                    {todos.slice(-4).reverse().map((todo, index) => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-3 text-sm"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${
                            todo.completed ? "bg-success" : "bg-primary"
                          }`}
                        />
                        <p
                          className={`flex-1 truncate ${
                            todo.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {todo.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>

              {/* Productivity Tip */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <LightbulbIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Pro Tip</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Break down large tasks into smaller, manageable chunks to boost your productivity and maintain momentum.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Icons
function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CheckAllIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L7 17l-5-5" />
      <path d="M22 10l-7.5 7.5L13 16" />
    </svg>
  );
}

function FilterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function LightbulbIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}
