"use client";

import React, { useState } from "react";
import TodoItem from "./TodoItem";

interface Todo {
  id: number;
  content: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

type FilterType = "all" | "active" | "completed";

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggle,
  onDelete,
  isLoading = false,
}) => {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const pendingTodos = filteredTodos.filter((todo) => !todo.completed);
  const completedTodos = filteredTodos.filter((todo) => todo.completed);

  const filterConfig = {
    all: { label: "All", color: "primary", icon: <AllIcon className="h-4 w-4" /> },
    active: { label: "Active", color: "warning", icon: <ActiveIcon className="h-4 w-4" /> },
    completed: { label: "Done", color: "success", icon: <DoneIcon className="h-4 w-4" /> },
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      {/* Header with Filter */}
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-gradient-to-r from-card to-card/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-500 shadow-lg shadow-primary/30">
            <TaskIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Tasks</h3>
            <p className="text-xs text-muted-foreground">{todos.length} total</p>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/30">
          {(["all", "active", "completed"] as FilterType[]).map((f) => {
            const config = filterConfig[f];
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? `bg-${config.color} text-white shadow-lg shadow-${config.color}/30`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                style={{
                  background: isActive
                    ? f === "all" ? "linear-gradient(135deg, #14B8A6, #06B6D4)"
                    : f === "active" ? "linear-gradient(135deg, #F59E0B, #F97316)"
                    : "linear-gradient(135deg, #22C55E, #14B8A6)"
                    : undefined
                }}
              >
                {config.icon}
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {filteredTodos.length > 0 ? (
          <div className="space-y-5">
            {/* Active Tasks */}
            {pendingTodos.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                    <span className="text-xs font-semibold text-warning uppercase tracking-wider">
                      In Progress ({pendingTodos.length})
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {pendingTodos.map((todo, index) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTodos.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
                    <CompletedIcon className="h-4 w-4 text-success" />
                    <span className="text-xs font-semibold text-success uppercase tracking-wider">
                      Completed ({completedTodos.length})
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {completedTodos.map((todo, index) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full" />
              <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-primary via-cyan-400 to-secondary flex items-center justify-center shadow-xl shadow-primary/30">
                <EmptyIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              {filter === "all"
                ? "No tasks yet"
                : filter === "active"
                ? "No active tasks"
                : "No completed tasks"}
            </h3>
            <p className="text-muted-foreground max-w-[280px] text-sm">
              {filter === "all"
                ? "Start by adding your first task above. Stay organized and productive!"
                : filter === "active"
                ? "All caught up! Create a new task or check your completed ones."
                : "Complete some tasks to see them here!"}
            </p>
          </div>
        )}
      </div>

      {/* Footer Progress */}
      {todos.length > 0 && (
        <div className="border-t border-border/30 bg-gradient-to-r from-muted/20 to-muted/10 px-5 py-4">
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-2">
              <ProgressIcon className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground font-medium">Overall Progress</span>
            </div>
            <span className="font-bold text-lg gradient-text">
              {Math.round(
                (todos.filter((t) => t.completed).length / todos.length) * 100
              )}%
            </span>
          </div>
          <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-cyan-400 to-success rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{
                width: `${
                  (todos.filter((t) => t.completed).length / todos.length) * 100
                }%`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{todos.filter((t) => t.completed).length} completed</span>
            <span>{todos.filter((t) => !t.completed).length} remaining</span>
          </div>
        </div>
      )}
    </div>
  );
};

function TaskIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function AllIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ActiveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function DoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CompletedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function EmptyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function ProgressIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  );
}

export default TodoList;
