"use client";

import React, { useState } from "react";

interface AddTodoProps {
  onAdd: (content: string) => void;
  isLoading?: boolean;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd, isLoading = false }) => {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isLoading) {
      onAdd(content);
      setContent("");
    }
  };

  return (
    <div
      className={`relative rounded-2xl border bg-card/80 backdrop-blur-sm p-1.5 transition-all duration-400 ${
        isFocused
          ? "border-primary/50 shadow-xl shadow-primary/20"
          : "border-border/50 hover:border-border"
      }`}
    >
      {/* Animated gradient border effect when focused */}
      {isFocused && (
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-cyan-400 to-secondary opacity-30 blur-sm -z-10 animate-pulse" />
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3 p-3">
        {/* Icon */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-400 ${
            isFocused
              ? "bg-gradient-to-br from-primary to-cyan-500 text-white shadow-lg shadow-primary/40 scale-105"
              : "bg-muted/50 text-muted-foreground"
          }`}
        >
          <PlusIcon className="h-6 w-6" />
        </div>

        {/* Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What needs to be done?"
            disabled={isLoading}
            className="w-full h-12 bg-transparent border-none text-base font-medium placeholder:text-muted-foreground/70 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {/* Floating label effect */}
          {content && (
            <span className="absolute -top-2 left-0 text-[10px] font-semibold text-primary uppercase tracking-wider animate-fade-in flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-primary" />
              New Task
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className={`group flex items-center gap-2 h-12 px-6 rounded-xl font-semibold text-sm transition-all duration-400 ${
            content.trim()
              ? "bg-gradient-to-r from-primary via-cyan-500 to-teal-500 text-white shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.03] active:scale-[0.98]"
              : "bg-muted/50 text-muted-foreground cursor-not-allowed"
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="h-5 w-5 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <span>Add Task</span>
              <ArrowIcon
                className={`h-4 w-4 transition-all duration-300 ${
                  content.trim() ? "translate-x-0 opacity-100 group-hover:translate-x-1" : "-translate-x-2 opacity-0"
                }`}
              />
            </>
          )}
        </button>
      </form>

      {/* Quick suggestions */}
      {isFocused && !content && (
        <div className="px-4 pb-4 flex items-center gap-2 animate-fade-in">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <SparklesIcon className="h-3.5 w-3.5 text-secondary" />
            Quick add:
          </span>
          {["Review code", "Team meeting", "Write docs", "Fix bug"].map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setContent(suggestion)}
              className="px-3 py-1.5 text-xs rounded-lg bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function LoadingSpinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

export default AddTodo;
