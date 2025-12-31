"use client";

import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailReminders, setEmailReminders] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your TaskFlow experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="p-5 border-b border-border/50">
              <h3 className="text-lg font-semibold">Profile</h3>
              <p className="text-sm text-muted-foreground">Manage your account details</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  U
                </div>
                <div className="flex-1">
                  <p className="font-medium">User</p>
                  <p className="text-sm text-muted-foreground">user@example.com</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">
                  Change Avatar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <input
                    type="text"
                    defaultValue="User"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    defaultValue="user@example.com"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="p-5 border-b border-border/50">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">Configure how you receive updates</p>
            </div>
            <div className="p-5 space-y-4">
              <ToggleSetting
                title="Push Notifications"
                description="Receive notifications for task reminders"
                enabled={notifications}
                onToggle={() => setNotifications(!notifications)}
              />
              <ToggleSetting
                title="Email Reminders"
                description="Get daily email summaries of your tasks"
                enabled={emailReminders}
                onToggle={() => setEmailReminders(!emailReminders)}
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="p-5 border-b border-border/50">
              <h3 className="text-lg font-semibold">Appearance</h3>
              <p className="text-sm text-muted-foreground">Customize the look and feel</p>
            </div>
            <div className="p-5 space-y-4">
              <ToggleSetting
                title="Dark Mode"
                description="Use dark theme for the interface"
                enabled={darkMode}
                onToggle={() => setDarkMode(!darkMode)}
              />
              <ToggleSetting
                title="Compact Mode"
                description="Reduce spacing for more content"
                enabled={compactMode}
                onToggle={() => setCompactMode(!compactMode)}
              />
              <ToggleSetting
                title="Show Completed Tasks"
                description="Display completed tasks in the list"
                enabled={showCompleted}
                onToggle={() => setShowCompleted(!showCompleted)}
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-destructive/30 bg-card">
            <div className="p-5 border-b border-destructive/30">
              <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">Irreversible actions</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete All Tasks</p>
                  <p className="text-sm text-muted-foreground">Remove all tasks permanently</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium transition-colors">
                  Delete All
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted transition-colors text-left">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ExportIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Export Data</p>
                  <p className="text-xs text-muted-foreground">Download your tasks</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted transition-colors text-left">
                <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                  <ImportIcon className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-sm">Import Data</p>
                  <p className="text-xs text-muted-foreground">Upload tasks from file</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted transition-colors text-left">
                <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                  <HelpIcon className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-sm">Help & Support</p>
                  <p className="text-xs text-muted-foreground">Get assistance</p>
                </div>
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <LogoIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold">TaskFlow</p>
                <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered task management for maximum productivity.
            </p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-lg bg-success/10 text-success text-xs font-medium">
                Up to date
              </span>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`w-full h-12 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              saved
                ? "bg-success text-white"
                : "bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-lg hover:shadow-primary/30"
            }`}
          >
            {saved ? (
              <>
                <CheckIcon className="h-5 w-5" />
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Toggle Setting Component
interface ToggleSettingProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleSetting({ title, description, enabled, onToggle }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// Icons
function ExportIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ImportIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function HelpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function LogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
