"use client";

import Link from "next/link";
import { useState } from "react";
import { ShellHeader } from "@/components/ui/shell-header";
import { ShellSidebar } from "@/components/ui/shell-sidebar";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActuatorStateBadge } from "@/components/ui/actuator-state-badge";

type UserProfile = {
  name: string;
  email: string;
  profileType: string;
  systemRole: string;
  organization: string;
  accountStatus: string;
  permissionLevel: string;
};

const LIVESTOCK_ITEMS = [
  { id: "livestock-dashboard", href: "/livestock", label: "Dashboard", icon: "🏠", description: "Livestock operations overview", permissionStatus: "available" as const },
  { id: "livestock-animals", href: "/livestock/animals", label: "Animals", icon: "🐄", description: "Individual animal records", permissionStatus: "available" as const },
  { id: "livestock-barns", href: "/livestock/barns", label: "Barns", icon: "🏠", description: "Barn structures and capacity", permissionStatus: "available" as const },
  { id: "livestock-feed", href: "/livestock/feed", label: "Feed", icon: "🌾", description: "Feed levels and schedules", permissionStatus: "available" as const },
  { id: "livestock-water", href: "/livestock/water", label: "Water", icon: "💧", description: "Water levels and watering", permissionStatus: "available" as const },
  { id: "livestock-environment", href: "/livestock/environment", label: "Environment", icon: "🌡️", description: "Temperature, humidity, ammonia", permissionStatus: "available" as const },
  { id: "livestock-automation", href: "/livestock/automation", label: "Automation", icon: "🤖", description: "Feeder, fan, water pump", permissionStatus: "available" as const },
  { id: "livestock-analytics", href: "/livestock/analytics", label: "Analytics", icon: "📊", description: "Livestock reports", permissionStatus: "available" as const },
] as const;

const SECTIONS = [
  {
    id: "mission-control",
    label: "Mission Control",
    icon: "🏠",
    items: [{ id: "mc-home", href: "/dashboard", label: "Dashboard", icon: "🏠", permissionStatus: "available" as const }],
  },
  {
    id: "livestock",
    label: "LIVESTOCK",
    icon: "🐄",
    items: LIVESTOCK_ITEMS,
  },
  {
    id: "fields",
    label: "FIELDS",
    icon: "🌱",
    items: [
      { id: "fields-dashboard", href: "/fields", label: "Dashboard", icon: "🏠", permissionStatus: "available" as const },
      { id: "fields-list", href: "/fields/fields", label: "Fields", icon: "🌱", permissionStatus: "available" as const },
      { id: "fields-crops", href: "/fields/crops", label: "Crops", icon: "🌽", permissionStatus: "available" as const },
      { id: "fields-irrigation", href: "/fields/irrigation", label: "Irrigation", icon: "🚿", permissionStatus: "available" as const },
      { id: "fields-soil", href: "/fields/soil", label: "Soil", icon: "🪨", permissionStatus: "available" as const },
      { id: "fields-weather", href: "/fields/weather", label: "Weather", icon: "☁️", permissionStatus: "available" as const },
      { id: "fields-automation", href: "/fields/automation", label: "Automation", icon: "🚜", permissionStatus: "available" as const },
      { id: "fields-analytics", href: "/fields/analytics", label: "Analytics", icon: "📈", permissionStatus: "available" as const },
    ],
  },
  {
    id: "infrastructure",
    label: "INFRASTRUCTURE",
    icon: "📡",
    items: [
      { id: "infra-esp32", href: "/infrastructure/esp32", label: "ESP32 Controllers", icon: "⚙", permissionStatus: "available" as const },
      { id: "infra-sensors", href: "/infrastructure/sensors", label: "Sensors", icon: "📡", permissionStatus: "available" as const },
      { id: "infra-actuators", href: "/infrastructure/actuators", label: "Actuators", icon: "🔧", permissionStatus: "available" as const },
      { id: "infra-health", href: "/infrastructure/health", label: "Device Health", icon: "💓", permissionStatus: "available" as const },
    ],
  },
  {
    id: "reporting",
    label: "REPORTING",
    icon: "📊",
    items: [
      { id: "reporting-reports", href: "/reporting/reports", label: "Reports", icon: "📋", permissionStatus: "available" as const },
      { id: "reporting-trends", href: "/reporting/trends", label: "Trends", icon: "📉", permissionStatus: "available" as const },
      { id: "reporting-productivity", href: "/reporting/productivity", label: "Productivity", icon: "📊", permissionStatus: "available" as const },
    ],
  },
  {
    id: "administration",
    label: "ADMINISTRATION",
    icon: "⚙",
    items: [
      { id: "admin-users", href: "/admin/users", label: "Users", icon: "👥", permissionStatus: "restricted" as const, requiredRole: "Administrator" },
      { id: "admin-roles", href: "/admin/roles", label: "Roles", icon: "🔐", permissionStatus: "restricted" as const, requiredRole: "Administrator" },
      { id: "admin-settings", href: "/admin/settings", label: "Settings", icon: "⚙", permissionStatus: "restricted" as const, requiredRole: "Administrator" },
    ],
  },
] as const;

export default function LivestockPage() {
  const [activePath, setActivePath] = useState("/livestock");

  const userProfile = {
    name: "Christmas IRAVUGA",
    email: "chrisirav537@gmail.com",
    profileType: "Farmer",
    systemRole: "Farmer",
    organization: "FarmVision Demo Farm",
    accountStatus: "Verified",
    permissionLevel: "Standard User",
  };

  const roleColorClass = {
    farmer: "text-success",
    agronomist: "text-info",
    veterinarian: "text-warning",
    technician: "text-warning",
    "farm manager": "text-primary",
    manager: "text-primary",
    admin: "text-destructive",
    "super admin": "text-destructive",
  }[userProfile.systemRole.toLowerCase()] ?? "text-muted-foreground";

  return (
    <div className="dashboard-shell">
      <ShellHeader
        title="Livestock Operations Center"
        subtitle="Animal health, barns, feed, water, environment, and automation"
        showSearch={true}
        userProfile={userProfile}
        onLogout={() => {
          window.location.href = "/api/auth/logout";
        }}
        notificationCount={2}
      />
      <div className="dashboard-wrap">
        <ShellSidebar
          sections={SECTIONS}
          currentPath={activePath}
        />
        <main className="dashboard-main">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Animals</p>
                  <p className="text-2xl font-bold text-foreground">1,250</p>
                </div>
                <span className="text-xl text-success" aria-hidden="true">🐄</span>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Healthy</p>
                  <p className="text-2xl font-bold text-success">1,190</p>
                </div>
                <span className="text-xl text-success" aria-hidden="true">✅</span>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Under Observation</p>
                  <p className="text-2xl font-bold text-warning">42</p>
                </div>
                <span className="text-xl text-warning" aria-hidden="true">⚠️</span>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Critical</p>
                  <p className="text-2xl font-bold text-destructive">18</p>
                </div>
                <span className="text-xl text-destructive" aria-hidden="true">🚨</span>
              </div>
            </div>
          </div>

          {/* Feed & Water Levels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-foreground">Feed Level</h3>
                <span className="text-xs font-bold text-info uppercase tracking-wider">78%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-info" style={{ width: "78%" }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Sufficient for 5.2 days at current consumption rate
              </p>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-foreground">Water Level</h3>
                <span className="text-xs font-bold text-success uppercase tracking-wider">92%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-success" style={{ width: "92%" }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Sufficient for 12.4 days at current consumption rate
              </p>
            </div>
          </div>

          {/* Barn Conditions */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-foreground">Barn Conditions</h3>
              <span className="text-xs font-bold text-success uppercase tracking-wider">Normal</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">🌡️</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Temperature</p>
                  <p className="text-sm font-bold text-foreground">22.5°C</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">💧</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Humidity</p>
                  <p className="text-sm font-bold text-foreground">58%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">🫁</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Ammonia</p>
                  <p className="text-sm font-bold text-success">12 ppm</p>
                </div>
              </div>
            </div>
          </div>

          {/* ESP32 Controllers for Livestock */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">ESP32 Controllers — Livestock</h3>
              <span className="text-xs font-bold text-success uppercase tracking-wider">3 Online</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "barn-a", name: "Barn A", deviceId: "ESP32-LS-001", location: "Dairy Barn", signal: 94 },
                { id: "barn-b", name: "Barn B", deviceId: "ESP32-LS-002", location: "Beef Barn", signal: 88 },
                { id: "barn-c", name: "Barn C", deviceId: "ESP32-LS-003", location: "Calf Barn", signal: 91 },
              ].map((device) => (
                <div key={device.id} className="p-3 rounded-lg border bg-background/50">
                  <p className="text-xs font-medium text-foreground">{device.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{device.deviceId}</p>
                  <p className="text-xs text-muted-foreground">{device.location}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs font-bold ${device.signal > 80 ? "text-success" : device.signal > 60 ? "text-warning" : "text-destructive"}`}>
                      🟢 {device.signal}%
                    </span>
                    <span className="text-xs font-bold text-success">Online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button variant="primary" className="w-full">
                🐄 Add Animal
              </Button>
              <Button variant="secondary" className="w-full">
                🌾 Order Feed
              </Button>
              <Button variant="secondary" className="w-full">
                💧 Check Water
              </Button>
              <Button variant="secondary" className="w-full">
                🤖 Run Automation
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
