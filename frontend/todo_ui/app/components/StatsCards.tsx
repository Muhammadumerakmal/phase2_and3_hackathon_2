"use client";

import React, { useEffect, useState } from "react";

interface StatsCardsProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalTasks,
  completedTasks,
  pendingTasks,
}) => {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: <TotalIcon />,
      gradient: "from-primary via-cyan-400 to-teal-400",
      iconBg: "bg-gradient-to-br from-primary to-cyan-500",
      glow: "shadow-primary/40",
      accent: "bg-primary",
      cardClass: "stat-card-primary",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: <CompletedIcon />,
      gradient: "from-success via-emerald-400 to-teal-400",
      iconBg: "bg-gradient-to-br from-success to-emerald-400",
      glow: "shadow-success/40",
      accent: "bg-success",
      cardClass: "stat-card-success",
    },
    {
      label: "In Progress",
      value: pendingTasks,
      icon: <PendingIcon />,
      gradient: "from-warning via-orange-400 to-accent",
      iconBg: "bg-gradient-to-br from-warning to-orange-500",
      glow: "shadow-warning/40",
      accent: "bg-warning",
      cardClass: "stat-card-warning",
    },
    {
      label: "Completion Rate",
      value: completionRate,
      suffix: "%",
      icon: <RateIcon />,
      gradient: "from-secondary via-violet-400 to-purple-500",
      iconBg: "bg-gradient-to-br from-secondary to-violet-500",
      glow: "shadow-secondary/40",
      accent: "bg-secondary",
      isPercentage: true,
      cardClass: "stat-card-secondary",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </div>
  );
};

interface StatCardProps {
  stat: {
    label: string;
    value: number;
    suffix?: string;
    icon: React.ReactNode;
    gradient: string;
    iconBg: string;
    glow: string;
    accent: string;
    isPercentage?: boolean;
    cardClass: string;
  };
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ stat, index }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const stepValue = stat.value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(stat.value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(stepValue * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [stat.value]);

  return (
    <div
      className={`stat-card ${stat.cardClass} group`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Decorative background elements */}
      <div
        className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-all duration-500`}
      />
      <div
        className={`absolute bottom-0 left-0 h-20 w-20 rounded-full bg-gradient-to-tr ${stat.gradient} opacity-5 blur-xl`}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide">
            {stat.label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span
              key={displayValue}
              className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
            >
              {displayValue}
            </span>
            {stat.suffix && (
              <span className="text-xl font-semibold text-muted-foreground">
                {stat.suffix}
              </span>
            )}
          </div>

          {/* Progress bar for percentage */}
          {stat.isPercentage && (
            <div className="mt-4 h-2 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out relative overflow-hidden`}
                style={{ width: `${displayValue}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          )}

          {/* Mini stat indicator */}
          {!stat.isPercentage && (
            <div className="mt-4 flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${stat.accent} animate-pulse`} />
              <span className="text-xs text-muted-foreground">
                {stat.value === 0 ? "No tasks" : stat.value === 1 ? "1 task" : `${stat.value} tasks`}
              </span>
            </div>
          )}
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.iconBg} shadow-lg ${stat.glow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
        >
          {stat.icon}
        </div>
      </div>

      {/* Hover shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  );
};

// Icons
function TotalIcon() {
  return (
    <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

function CompletedIcon() {
  return (
    <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function RateIcon() {
  return (
    <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  );
}

export default StatsCards;
