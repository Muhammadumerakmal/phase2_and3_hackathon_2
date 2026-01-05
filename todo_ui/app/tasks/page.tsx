"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import AddTodo from "../components/AddTodo";

interface Todo {
  id: number;
  content: string;
  completed: boolean;
}

export default function TasksPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const router = useRouter();

  const getAuthHeaders = useCallback((token: string) => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchTodos = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/todos`, {
        headers: getAuthHeaders(token),
      });
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, router]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos, router]);

  const addTodo = async (content: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      setIsAddingTodo(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/todos`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to add");
      const newTodo = await response.json();
      setTodos((prev) => [...prev, newTodo]);
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setIsAddingTodo(false);
    }
  };

  const toggleTodo = async (id: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/todos/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });
      if (!response.ok) throw new Error("Failed to update");
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/todos/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      if (!response.ok) throw new Error("Failed to delete");
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const deleteAllCompleted = async () => {
    const completedTodos = todos.filter((t) => t.completed);
    for (const todo of completedTodos) {
      await deleteTodo(todo.id);
    }
  };

  const markAllComplete = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    const activeTodos = todos.filter((t) => !t.completed);
    for (const todo of activeTodos) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/todos/${todo.id}`, {
          method: "PUT",
          headers: getAuthHeaders(token),
          body: JSON.stringify({ ...todo, completed: true }),
        });
      } catch (error) {
        console.error("Error:", error);
      }
    }
    setTodos((prev) => prev.map((t) => ({ ...t, completed: true })));
  };

  // Filter and sort todos
  let filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  if (searchQuery) {
    filteredTodos = filteredTodos.filter((todo) =>
      todo.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  filteredTodos.sort((a, b) => {
    if (sortBy === "name") return a.content.localeCompare(b.content);
    if (sortBy === "oldest") return a.id - b.id;
    return b.id - a.id; // newest
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">All Tasks</h1>
        <p className="text-muted-foreground">
          Manage and organize all your tasks in one place
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <TaskIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{todos.length}</p>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <ClockIcon className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
            <CheckCircleIcon className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>

      {/* Add Task */}
      <div className="mb-6">
        <AddTodo onAdd={addTodo} isLoading={isAddingTodo} />
      </div>

      {/* Filters and Search */}
      <div className="rounded-2xl border border-border/50 bg-card mb-6">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-primary text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 text-xs opacity-70">
                  ({f === "all" ? todos.length : f === "active" ? activeCount : completedCount})
                </span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-10 px-3 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>

        {/* Bulk Actions */}
        <div className="p-3 border-b border-border/50 flex items-center gap-2 bg-muted/20">
          <button
            onClick={markAllComplete}
            disabled={activeCount === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success hover:bg-success/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            <CheckAllIcon className="h-3.5 w-3.5" />
            Mark All Complete
          </button>
          <button
            onClick={deleteAllCompleted}
            disabled={completedCount === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Clear Completed
          </button>
        </div>

        {/* Task List */}
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 animate-pulse">
                  <div className="h-6 w-6 rounded-lg bg-muted" />
                  <div className="flex-1 h-4 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredTodos.length > 0 ? (
            <div className="space-y-2">
              {filteredTodos.map((todo, index) => (
                <TaskItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                <EmptyIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No tasks found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : filter === "active"
                  ? "All caught up! No active tasks."
                  : filter === "completed"
                  ? "No completed tasks yet."
                  : "Add your first task above."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Task Item Component
interface TaskItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  index: number;
}

function TaskItem({ todo, onToggle, onDelete, index }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(todo.id), 200);
  };

  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
        isDeleting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      } ${
        todo.completed
          ? "bg-muted/20 border-border/30"
          : "bg-card border-border/50 hover:border-primary/30 hover:shadow-md"
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${
          todo.completed
            ? "bg-success border-success"
            : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
        }`}
      >
        {todo.completed && <CheckIcon className="h-4 w-4 text-white" />}
      </button>

      {/* Content */}
      <span
        className={`flex-1 text-sm font-medium transition-all ${
          todo.completed ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {todo.content}
      </span>

      {/* Status Badge */}
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          todo.completed
            ? "bg-success/10 text-success"
            : "bg-warning/10 text-warning"
        }`}
      >
        {todo.completed ? "Done" : "Pending"}
      </span>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

// Icons
function TaskIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckAllIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function EmptyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6v6H9z" />
    </svg>
  );
}
