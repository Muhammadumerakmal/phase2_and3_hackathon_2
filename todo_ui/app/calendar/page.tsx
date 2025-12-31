"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";

interface Todo {
  id: number;
  content: string;
  completed: boolean;
}

export default function CalendarPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();

  const getAuthHeaders = useCallback((token: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), []);

  useEffect(() => {
    const fetchTodos = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      try {
        const response = await fetch("http://127.0.0.1:8000/todos", {
          headers: getAuthHeaders(token),
        });
        if (response.ok) {
          const data = await response.json();
          setTodos(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, [router, getAuthHeaders]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.filter((t) => !t.completed).length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Calendar</h1>
        <p className="text-muted-foreground">
          Plan and organize your tasks by date
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {/* Calendar Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Today
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 border-b border-border/50">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells for days before the 1st */}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="p-3 h-24 border-b border-r border-border/30" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`p-3 h-24 border-b border-r border-border/30 text-left transition-colors hover:bg-muted/50 ${
                      isSelected(day) ? "bg-primary/10" : ""
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        isToday(day)
                          ? "bg-primary text-white"
                          : isSelected(day)
                          ? "bg-primary/20 text-primary"
                          : ""
                      }`}
                    >
                      {day}
                    </span>
                    {/* Task indicators - random for demo */}
                    {day % 3 === 0 && (
                      <div className="mt-1 flex gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <div className="h-1.5 w-1.5 rounded-full bg-success" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Info */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate
                ? selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Select a date"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">{pendingCount} tasks pending</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-sm">{completedCount} tasks completed</span>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : todos.filter((t) => !t.completed).length > 0 ? (
              <div className="space-y-2">
                {todos
                  .filter((t) => !t.completed)
                  .slice(0, 5)
                  .map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-warning" />
                      <span className="text-sm truncate flex-1">{todo.content}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming tasks
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">This Month</p>
                <p className="text-xs text-muted-foreground">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-xl bg-background/50">
                <p className="text-2xl font-bold">{todos.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/50">
                <p className="text-2xl font-bold text-success">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Icons
function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}
