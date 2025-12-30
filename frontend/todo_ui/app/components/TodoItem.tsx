"use client";

import React, { useState } from "react";

interface Todo {
  id: number;
  content: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  index?: number;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(todo.id), 300);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
        isDeleting
          ? "opacity-0 scale-95 -translate-x-4"
          : "opacity-100 scale-100 translate-x-0"
      } ${
        todo.completed
          ? "bg-card/40 border-success/20"
          : "bg-card/80 border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
          todo.completed
            ? "bg-gradient-to-b from-success to-teal-400"
            : isHovered
            ? "bg-gradient-to-b from-primary to-cyan-400"
            : "bg-transparent"
        }`}
      />

      <div className="flex items-center gap-4 p-4 pl-5">
        {/* Custom Checkbox */}
        <div className="relative">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="sr-only peer"
            id={`todo-${todo.id}`}
          />
          <label
            htmlFor={`todo-${todo.id}`}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-2 transition-all duration-300 ${
              todo.completed
                ? "bg-gradient-to-br from-success to-teal-400 border-success shadow-lg shadow-success/40"
                : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10 hover:shadow-md hover:shadow-primary/20"
            }`}
          >
            <CheckIcon
              className={`h-4 w-4 text-white transition-all duration-300 ${
                todo.completed ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
            />
          </label>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-base font-medium transition-all duration-300 ${
              todo.completed
                ? "text-muted-foreground/60 line-through"
                : "text-foreground"
            }`}
          >
            {todo.content}
          </p>
          {todo.completed && (
            <span className="text-xs text-success/70 flex items-center gap-1 mt-0.5">
              <CheckCircleIcon className="h-3 w-3" />
              Completed
            </span>
          )}
        </div>

        {/* Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
            todo.completed
              ? "bg-success/10 text-success"
              : "bg-warning/10 text-warning"
          }`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              todo.completed ? "bg-success" : "bg-warning animate-pulse"
            }`}
          />
          {todo.completed ? "Done" : "Active"}
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 ${
            isHovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2"
          } text-muted-foreground hover:text-accent hover:bg-accent/10`}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Completion shine effect */}
      {todo.completed && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-success/5 to-transparent" />
        </div>
      )}

      {/* Hover gradient effect */}
      {!todo.completed && isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
        </div>
      )}
    </div>
  );
};

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

export default TodoItem;
