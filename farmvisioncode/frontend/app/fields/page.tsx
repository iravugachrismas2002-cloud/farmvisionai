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

const FIELDS_ITEMS = [
  { id: "fields-dashboard", href: "/fields", label: "Dashboard", icon: "🏠", description: "Field operations overview", permissionStatus: "available" as const },
  { id: "fields-list", href: "/fields/fields", label: "Fields", icon: "🌱", description: "Manage farm fields and zones", permissionStatus: "available" as const },
  { id: "fields-crops", href: "/fields/crops", label: "Crops", icon: "🌽", description: "Crop types, stages, yield potential", permissionStatus: "available" as const },
  { id: "fields-irrigation", href: "/fields/irrigation", label: "Irrigation", icon: "🚿", description: "Control irrigation systems", permissionStatus: "available" as const },
  { id: "fields-soil", href: "/fields/soil", label: "Soil", icon: "🪨", description: "Soil moisture, nutrients, pH", permissionStatus: "available" as const },
  { id: "fields-weather", href: "/fields/weather", label: "Weather", icon: "☁️", description: "Weather monitoring and forecasts", permissionStatus: "available" as const },
  { id: "fields-automation", href: "/fields/automation", label: "Automation", icon: "🚜", description: "Field automation systems", permissionStatus: "available" as const },
  { id: "fields-analytics", href: "/fields/analytics", label: "Analytics", icon: "📈", description: "Field reports and yield predictions", permissionStatus: "available" as const },
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
    items: [
      { id: "livestock-dashboard", href: "/livestock", label: "Dashboard", icon: "🏠", permissionStatus: "available" as const },
      { id: "livestock-animals", href: "/livestock/animals", label: "Animals", icon: "🐄", permissionStatus: "available" as const },
      { id: "livestock-barns", href: "/livestock/barns", label: "Barns", icon: "🏠", permissionStatus: "available" as const },
      { id: "livestock-feed", href: "/livestock/feed", label: "Feed", icon: "🌾", permissionStatus: "available" as const },
      { id: "livestock-water", href: "/livestock/water", label: "Water", icon: "💧", permissionStatus: "available" as const },
      { id: "livestock-environment", href: "/livestock/environment", label: "Environment", icon: "🌡️", permissionStatus: "available" as const },
      { id: "livestock-automation", href: "/livestock/automation", label: "Automation", icon: "🤖", permissionStatus: "available" as const },
      { id: "livestock-analytics", href: "/livestock/analytics", label: "Analytics", icon: "📊", permissionStatus: "available" as const },
    ],
  },
  {
    id: "fields",
    label: "FIELDS",
    icon: "🌱",
    items: FIELDS_ITEMS,
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

export default function FieldsPage() {
  const [activePath, setActivePath] = useState("/fields");

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
        title="Field Operations Center"
        subtitle="Fields, crops, irrigation, soil, weather, and field automation"
        showSearch={true}
        userProfile={userProfile}
        onLogout={() => {
          window.location.href = "/api/auth/logout";
        }}
        notificationCount={1}
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Fields</p>
                  <p className="text-2xl font-bold text-foreground">14</p>
                </div>
                <span className="text-xl text-info" aria-hidden="true">🌱</span>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Healthy</p>
                  <p className="text-2xl font-bold text-success">12</p>
                </div>
                <span className="text-xl text-success" aria-hidden="true">✅</span>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Warning</p>
                  <p className="text-2xl font-bold text-warning">2</p>
                </div>
                <span className="text-xl text-warning" aria-hidden="true">⚠️</span>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Critical</p>
                  <p className="text-2xl font-bold text-destructive">0</p>
                </div>
                <span className="text-xl text-success" aria-hidden="true">🟢</span>
              </div>
            </div>
          </div>

          {/* Soil Moisture & Irrigation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-foreground">Average Soil Moisture</h3>
                <span className="text-xs font-bold text-info uppercase tracking-wider">61%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-info" style={{ width: "61%" }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Optimal range: 40-70%. 2 fields below threshold.
              </p>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-foreground">Irrigation Systems</h3>
                <span className="text-xs font-bold text-success uppercase tracking-wider">Online</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-success" style={{ width: "100%" }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                7 active irrigation zones across 14 fields
              </p>
            </div>
          </div>

          {/* Field ESP32 Controllers */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Field ESP32 Controllers</h3>
              <span className="text-xs font-bold text-success uppercase tracking-wider">7 Online</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { id: "field-1", name: "Field A-1", deviceId: "ESP32-F-001", crop: "Maize", signal: 94 },
                { id: "field-2", name: "Field A-2", deviceId: "ESP32-F-002", crop: "Beans", signal: 87 },
                { id: "field-3", name: "Field B-1", deviceId: "ESP32-F-003", crop: "Irish Potato", signal: 91 },
                { id: "field-4", name: "Field B-2", deviceId: "ESP32-F-004", crop: "Cassava", signal: 84 },
                { id: "field-5", name: "Field C-1", deviceId: "ESP32-F-005", crop: "Banana", signal: 89 },
                { id: "field-6", name: "Field C-2", deviceId: "ESP32-F-006", crop: "Coffee", signal: 76 },
                { id: "field-7", name: "Field D-1", deviceId: "ESP32-F-007", crop: "Tea", signal: 93 },
              ].map((device) => (
                <div key={device.id} className="p-3 rounded-lg border bg-background/50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-foreground">{device.name}</p>
                    <span className={`text-xs font-bold ${device.signal > 80 ? "text-success" : device.signal > 60 ? "text-warning" : "text-destructive"}`}>
                      🟢 {device.signal}%
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">{device.deviceId}</p>
                  <p className="text-xs text-muted-foreground">{device.crop}</p>
                  <p className="text-xs font-bold text-success">Online</p>
                </div>
              ))}
            </div>
          </div>

          {/* Field List */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">All Fields</h3>
              <Button variant="secondary" size="sm">
                Add Field
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Field</th>
                    <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Crop</th>
                    <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                    <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Moisture</th>
                    <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Controller</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { id: "f-1", name: "North Field A", crop: "Maize", size: "4.2 ha", moisture: "61%", status: "Healthy", controller: "ESP32-F-001" },
                    { id: "f-2", name: "North Field B", crop: "Beans", size: "3.1 ha", moisture: "42%", status: "Healthy", controller: "ESP32-F-002" },
                    { id: "f-3", name: "West Field C", crop: "Irish Potato", size: "5.5 ha", moisture: "34%", status: "Warning", controller: "ESP32-F-003" },
                    { id: "f-4", name: "West Field D", crop: "Cassava", size: "6.8 ha", moisture: "58%", status: "Healthy", controller: "ESP32-F-004" },
                    { id: "f-5", name: "East Field E", crop: "Banana", size: "7.2 ha", moisture: "72%", status: "Warning", controller: "ESP32-F-005" },
                    { id: "f-6", name: "East Field F", crop: "Coffee", size: "3.9 ha", moisture: "45%", status: "Healthy", controller: "ESP32-F-006" },
                    { id: "f-7", name: "South Field G", crop: "Tea", size: "8.1 ha", moisture: "67%", status: "Healthy", controller: "ESP32-F-007" },
                  ].map((field) => {
                    const statusColor = field.status === "Healthy" ? "text-success" : field.status === "Warning" ? "text-warning" : "text-destructive";
                    return (
                      <tr key={field.id} className="hover:bg-accent transition-colors">
                        <td className="px-3 py-3 text-sm font-medium text-foreground">{field.name}</td>
                        <td className="px-3 py-3 text-sm text-foreground">{field.crop}</td>
                        <td className="px-3 py-3 text-sm font-mono text-muted-foreground">{field.size}</td>
                        <td className="px-3 py-3 text-sm font-mono text-muted-foreground">{field.moisture}</td>
                        <td className="px-3 py-3 text-sm">
                          <span className={`font-bold ${statusColor}`}>{field.status}</span>
                        </td>
                        <td className="px-3 py-3 text-sm font-mono text-muted-foreground">{field.controller}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
