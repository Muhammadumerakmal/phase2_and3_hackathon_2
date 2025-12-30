"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";

interface Todo {
  id: number;
  content: string;
  completed: boolean;
}

export default function AnalyticsPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const pendingTasks = todos.filter((t) => !t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Simulated weekly data for demo
  const weeklyData = [
    { day: "Mon", completed: 3, pending: 2 },
    { day: "Tue", completed: 5, pending: 1 },
    { day: "Wed", completed: 2, pending: 4 },
    { day: "Thu", completed: 6, pending: 2 },
    { day: "Fri", completed: 4, pending: 3 },
    { day: "Sat", completed: 1, pending: 1 },
    { day: "Sun", completed: 2, pending: 0 },
  ];

  const maxValue = Math.max(...weeklyData.map((d) => d.completed + d.pending));

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Track your productivity and task completion trends
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon={<TaskIcon />}
          color="primary"
          isLoading={isLoading}
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon={<CheckIcon />}
          color="success"
          isLoading={isLoading}
        />
        <StatCard
          title="In Progress"
          value={pendingTasks}
          icon={<ClockIcon />}
          color="warning"
          isLoading={isLoading}
        />
        <StatCard
          title="Completion Rate"
          value={completionRate}
          suffix="%"
          icon={<TrendIcon />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Weekly Overview</h3>
              <p className="text-sm text-muted-foreground">Tasks completed vs pending</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-muted-foreground">Pending</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-4 h-64">
            {weeklyData.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col gap-1 h-52">
                  <div
                    className="w-full bg-warning/80 rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${(data.pending / maxValue) * 100}%`,
                    }}
                  />
                  <div
                    className="w-full bg-success rounded-b-lg transition-all duration-500"
                    style={{
                      height: `${(data.completed / maxValue) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Score */}
        <div className="space-y-6">
          {/* Circular Progress */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h3 className="text-lg font-semibold mb-6">Productivity Score</h3>
            <div className="flex justify-center">
              <div className="relative h-40 w-40">
                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/30"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${completionRate * 2.51} 251`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{completionRate}</span>
                  <span className="text-sm text-muted-foreground">percent</span>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {completionRate >= 80
                  ? "Excellent work! Keep it up!"
                  : completionRate >= 50
                  ? "Good progress! You're on track."
                  : "Room for improvement. Stay focused!"}
              </p>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendUpIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Best Day</p>
                  <p className="text-xs text-muted-foreground">Thursday - 6 tasks</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <StreakIcon className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Current Streak</p>
                  <p className="text-xs text-muted-foreground">5 days productive</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AvgIcon className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Daily Average</p>
                  <p className="text-xs text-muted-foreground">4.2 tasks/day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="mt-6 rounded-2xl border border-border/50 bg-card p-6">
        <h3 className="text-lg font-semibold mb-6">Task Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Completed Tasks</span>
                <span className="text-sm text-muted-foreground">{completedTasks} tasks</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-success to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pending Tasks</span>
                <span className="text-sm text-muted-foreground">{pendingTasks} tasks</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-warning to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pie Chart Visual */}
          <div className="flex items-center justify-center">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="20"
                  className="text-warning/50"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="20"
                  strokeDasharray={`${completionRate * 2.51} 251`}
                  className="text-success"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "purple";
  isLoading?: boolean;
}

function StatCard({ title, value, suffix, icon, color, isLoading }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary shadow-primary/20",
    success: "bg-success/10 text-success shadow-success/20",
    warning: "bg-warning/10 text-warning shadow-warning/20",
    purple: "bg-purple-500/10 text-purple-500 shadow-purple-500/20",
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          {isLoading ? (
            <div className="h-9 w-20 bg-muted rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold">
              {value}
              {suffix && <span className="text-xl text-muted-foreground">{suffix}</span>}
            </p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Icons
function TaskIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function TrendUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function StreakIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function AvgIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
