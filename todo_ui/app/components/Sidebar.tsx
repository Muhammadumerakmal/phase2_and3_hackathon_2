"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, onLogout }) => {
  const pathname = usePathname();

  const navItems = [
    { icon: <DashboardIcon />, label: "Dashboard", href: "/", color: "primary" },
    { icon: <ChatIcon />, label: "AI Chat", href: "/chat", color: "secondary" },
    { icon: <TasksIcon />, label: "All Tasks", href: "/tasks", color: "success" },
    { icon: <CalendarIcon />, label: "Calendar", href: "/calendar", color: "warning" },
    { icon: <AnalyticsIcon />, label: "Analytics", href: "/analytics", color: "accent" },
    { icon: <SettingsIcon />, label: "Settings", href: "/settings", color: "muted" },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { active: string; icon: string }> = {
      primary: { active: "bg-primary/15 text-primary border-l-primary", icon: "bg-primary text-white shadow-primary/40" },
      secondary: { active: "bg-secondary/15 text-secondary border-l-secondary", icon: "bg-secondary text-white shadow-secondary/40" },
      success: { active: "bg-success/15 text-success border-l-success", icon: "bg-success text-white shadow-success/40" },
      warning: { active: "bg-warning/15 text-warning border-l-warning", icon: "bg-warning text-black shadow-warning/40" },
      accent: { active: "bg-accent/15 text-accent border-l-accent", icon: "bg-accent text-white shadow-accent/40" },
      muted: { active: "bg-muted/30 text-foreground border-l-muted-foreground", icon: "bg-muted text-foreground shadow-none" },
    };
    return colors[color] || colors.primary;
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-sidebar/95 backdrop-blur-xl border-r border-border/30 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      {/* Logo Section */}
      <div className="relative flex h-16 items-center justify-between px-4 border-b border-border/30">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-cyan-400 to-secondary shadow-lg shadow-primary/30">
              <LogoIcon className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-primary to-secondary rounded-xl blur opacity-30 -z-10" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold gradient-text">TaskFlow</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Powered</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border/50 shadow-lg hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 hover:scale-110"
      >
        <ChevronIcon className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
      </button>

      {/* Navigation */}
      <nav className="relative flex flex-col gap-1.5 p-3 mt-4">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const colorClasses = getColorClasses(item.color);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300 border-l-4 ${
                isActive
                  ? `${colorClasses.active} border-l-4`
                  : "text-muted-foreground hover:bg-card/80 hover:text-foreground border-l-transparent hover:border-l-border"
              } ${isCollapsed ? "justify-center border-l-0" : ""}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 ${
                  isActive
                    ? `${colorClasses.icon} shadow-lg`
                    : "bg-muted/50 group-hover:bg-muted group-hover:scale-105"
                }`}
              >
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="font-medium animate-fade-in">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border/30 bg-gradient-to-t from-sidebar to-transparent">
        {/* User Profile */}
        <div
          className={`flex items-center gap-3 rounded-xl p-3 mb-2 bg-gradient-to-r from-card/80 to-card/40 border border-border/30 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary via-cyan-400 to-secondary flex items-center justify-center text-white font-semibold shadow-lg">
              U
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-sidebar shadow-lg shadow-success/50" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="font-medium text-sm truncate">User</p>
              <p className="text-xs text-success truncate flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Online
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 w-full rounded-xl px-3 py-3 text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 group ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/30 group-hover:bg-accent/20 transition-all duration-300">
            <LogoutIcon className="h-5 w-5" />
          </div>
          {!isCollapsed && <span className="font-medium animate-fade-in">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

// Icons
function LogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function TasksIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function AnalyticsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export default Sidebar;
