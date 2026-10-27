"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Home,
  Leaf,
  Palette,
  Cpu,
  BarChart3,
  Bot,
  Settings,
  Shield,
  Users,
  FileText,
} from "lucide-react";
import { ShellHeader } from "@/components/ui/shell-header";
import { ShellSidebar } from "@/components/ui/shell-sidebar";

type UserProfile = {
  name: string;
  email: string;
  profileType: string;
  systemRole: string;
  organization: string;
  accountStatus: string;
  permissionLevel: string;
  avatar?: string;
};

const SIDEBAR_SECTIONS = [
  {
    id: "mission-control",
    label: "Mission Control",
    icon: "Home",
    items: [
      { id: "mc-home", href: "/dashboard", label: "Dashboard", permissionStatus: "available" as const },
    ],
  },
  {
    id: "livestock",
    label: "LIVESTOCK",
    icon: "Palette",
    items: [
      { id: "livestock-dashboard", href: "/livestock", label: "Dashboard", permissionStatus: "available" as const },
      { id: "livestock-animals", href: "/livestock/animals", label: "Animals", permissionStatus: "available" as const },
      { id: "livestock-barns", href: "/livestock/barns", label: "Barns", permissionStatus: "available" as const },
      { id: "livestock-feed", href: "/livestock/feed", label: "Feed", permissionStatus: "available" as const },
      { id: "livestock-water", href: "/livestock/water", label: "Water", permissionStatus: "available" as const },
      { id: "livestock-environment", href: "/livestock/environment", label: "Environment", permissionStatus: "available" as const },
      { id: "livestock-automation", href: "/livestock/automation", label: "Automation", permissionStatus: "available" as const },
      { id: "livestock-analytics", href: "/livestock/analytics", label: "Analytics", permissionStatus: "available" as const },
    ],
  },
  {
    id: "fields",
    label: "FIELDS",
    icon: "Leaf",
    items: [
      { id: "fields-dashboard", href: "/fields", label: "Dashboard", permissionStatus: "available" as const },
      { id: "fields-list", href: "/fields/fields", label: "Fields", permissionStatus: "available" as const },
      { id: "fields-crops", href: "/fields/crops", label: "Crops", permissionStatus: "available" as const },
      { id: "fields-irrigation", href: "/fields/irrigation", label: "Irrigation", permissionStatus: "available" as const },
      { id: "fields-soil", href: "/fields/soil", label: "Soil", permissionStatus: "available" as const },
      { id: "fields-weather", href: "/fields/weather", label: "Weather", permissionStatus: "available" as const },
      { id: "fields-automation", href: "/fields/automation", label: "Automation", permissionStatus: "available" as const },
      { id: "fields-analytics", href: "/fields/analytics", label: "Analytics", permissionStatus: "available" as const },
    ],
  },
  {
    id: "infrastructure",
    label: "INFRASTRUCTURE",
    icon: "Cpu",
    items: [
      { id: "infra-esp32", href: "/infrastructure/esp32", label: "ESP32 Controllers", permissionStatus: "available" as const },
      { id: "infra-sensors", href: "/infrastructure/sensors", label: "Sensors", permissionStatus: "available" as const },
      { id: "infra-actuators", href: "/infrastructure/actuators", label: "Actuators", permissionStatus: "available" as const },
      { id: "infra-health", href: "/infrastructure/health", label: "Device Health", permissionStatus: "available" as const },
    ],
  },
  {
    id: "reporting",
    label: "REPORTING",
    icon: "BarChart3",
    items: [
      { id: "reporting-reports", href: "/reporting/reports", label: "Reports", permissionStatus: "available" as const },
      { id: "reporting-trends", href: "/reporting/trends", label: "Trends", permissionStatus: "available" as const },
      { id: "reporting-productivity", href: "/reporting/productivity", label: "Productivity", permissionStatus: "available" as const },
    ],
  },
  {
    id: "administration",
    label: "ADMINISTRATION",
    icon: "Settings",
    items: [
      { id: "admin-users", href: "/admin/users", label: "Users", permissionStatus: "restricted" as const, requiredRole: "Administrator" },
      { id: "admin-roles", href: "/admin/roles", label: "Roles", permissionStatus: "restricted" as const, requiredRole: "Administrator" },
      { id: "admin-settings", href: "/admin/settings", label: "Settings", permissionStatus: "restricted" as const, requiredRole: "Administrator" },
    ],
  },
] as const;

const userProfile = {
  name: "Christmas IRAVUGA",
  email: "chrisirav537@gmail.com",
  profileType: "Farmer",
  systemRole: "Farmer",
  organization: "FarmVision Demo Farm",
  accountStatus: "Verified",
  permissionLevel: "Standard User",
};

const soilMoistureData = [
  { name: "Mon", value: 45 },
  { name: "Tue", value: 52 },
  { name: "Wed", value: 48 },
  { name: "Thu", value: 61 },
  { name: "Fri", value: 55 },
  { name: "Sat", value: 63 },
  { name: "Sun", value: 59 },
];

const livestockHealthData = [
  { name: "Healthy", value: 1190, color: "#10B981" },
  { name: "Observation", value: 42, color: "#F59E0B" },
  { name: "Critical", value: 18, color: "#EF4444" },
];

const sensorData = [
  { name: "Online", value: 34 },
  { name: "Warning", value: 3 },
  { name: "Offline", value: 1 },
];

const irrigationData = [
  { name: "Mon", value: 120 },
  { name: "Tue", value: 95 },
  { name: "Wed", value: 140 },
  { name: "Thu", value: 110 },
  { name: "Fri", value: 130 },
  { name: "Sat", value: 160 },
  { name: "Sun", value: 180 },
];

const KPI_CARDS = [
  {
    label: "Active Sensors",
    value: "34",
    trend: "+12%",
    trendType: "positive" as const,
    icon: "📡",
    color: "text-emerald-400",
  },
  {
    label: "Total Farms",
    value: "12",
    trend: "+2",
    trendType: "positive" as const,
    icon: "🌾",
    color: "text-blue-400",
  },
  {
    label: "Device Uptime",
    value: "97%",
    trend: "+0.5%",
    trendType: "positive" as const,
    icon: "⚙",
    color: "text-blue-400",
  },
  {
    label: "Active Alerts",
    value: "5",
    trend: "Critical",
    trendType: "negative" as const,
    icon: "🚨",
    color: "text-red-400",
  },
];

export default function DashboardPage() {
  const [activePath, setActivePath] = useState("/dashboard");

  const roleColorClass = {
    farmer: "text-emerald-400",
    agronomist: "text-blue-400",
    veterinarian: "text-amber-400",
    technician: "text-amber-400",
    "farm manager": "text-emerald-400",
    manager: "text-emerald-400",
    admin: "text-red-400",
    "super admin": "text-red-400",
  }[userProfile.systemRole.toLowerCase()] ?? "text-slate-400";

  return (
    <div className="dashboard-shell">
      <ShellHeader
        title="FarmVision AI"
        subtitle="Mission Control — Livestock & Fields Operations"
        showSearch={true}
        userProfile={userProfile}
        onLogout={() => {
          window.location.href = "/api/auth/logout";
        }}
        notificationCount={3}
      />
      <div className="dashboard-wrap">
        <ShellSidebar
          sections={SIDEBAR_SECTIONS}
          currentPath={activePath}
        />
        <main className="dashboard-main">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" aria-hidden="true"></span>
                Good Morning, Christmas
              </div>
              <h1 className="hero-title">
                Monitor crops, livestock, sensors and field operations from one place.
              </h1>
              <p className="hero-subtitle">
                Your FarmVision AI dashboard provides real-time insights into livestock health,
                field conditions, and equipment status across your operation.
              </p>
            </div>
          </section>

          {/* KPI Cards */}
          <div className="kpi-grid">
            {KPI_CARDS.map((card) => (
              <div key={card.label} className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-label">{card.label}</div>
                  <span className={`kpi-trend ${card.trendType}`}>{card.trend}</span>
                </div>
                <div className="kpi-value">{card.value}</div>
                <div className="kpi-subtitle">{card.icon}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="dashboard-grid-4 mb-24">
            <div className="chart-card">
              <div className="card-header">
                <h3 className="card-title">Soil Moisture Trend</h3>
              </div>
              <div className="card-body" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={soilMoistureData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94A3B8" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3 className="card-title">Livestock Health</h3>
              </div>
              <div className="card-body" style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PieChart width={200} height={200}>
                  <Pie
                    data={livestockHealthData}
                    cx="100"
                    cy="100"
                    outerRadius={80}
                    fill="#8884d8"
                    labelLine={false}
                    label={{ position: "inside", fill: "#fff", fontSize: 12 }}
                  >
                    {livestockHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3 className="card-title">Sensor Status</h3>
              </div>
              <div className="card-body" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94A3B8" }} />
                    <YAxis dataKey="value" tick={{ fontSize: 12, fill: "#94A3B8" }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3 className="card-title">Irrigation Activity</h3>
              </div>
              <div className="card-body" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={irrigationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94A3B8" }} />
                    <YAxis dataKey="value" tick={{ fontSize: 12, fill: "#94A3B8" }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={{ fill: "#F59E0B", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Alerts & System Health */}
          <div className="dashboard-grid-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Alerts</h3>
              </div>
              <div className="card-body">
                <div className="alert-list">
                  <div className="alert-item warning">
                    <span className="alert-severity-dot warning" />
                    <div className="alert-content">
                      <p className="alert-title">Low Water Level - Tank 1</p>
                      <p className="alert-reason">Water level dropped below 20% threshold in North Field A</p>
                      <div className="alert-meta">
                        <span className="alert-chip warning">Warning</span>
                        <span>• ESP32-F-003</span>
                        <span>• 14 min ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="alert-item critical">
                    <span className="alert-severity-dot critical" />
                    <div className="alert-content">
                      <p className="alert-title">High Temperature - Barn B</p>
                      <p className="alert-reason">Barn temperature exceeded 32°C threshold</p>
                      <div className="alert-meta">
                        <span className="alert-chip critical">Critical</span>
                        <span>• ESP32-LS-002</span>
                        <span>• 45 min ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="alert-item info">
                    <span className="alert-severity-dot info" />
                    <div className="alert-content">
                      <p className="alert-title">Feed Level Low</p>
                      <p className="alert-reason">Barn C feed silo is at 15% capacity</p>
                      <div className="alert-meta">
                        <span className="alert-chip info">Info</span>
                        <span>• ESP32-LS-003</span>
                        <span>• 2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">System Health</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">ESP32 Controllers</span>
                    <span className="text-sm font-mono text-emerald-400">18 Online</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Soil Sensors</span>
                    <span className="text-sm font-mono text-emerald-400">24 Online</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "88%" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Actuators</span>
                    <span className="text-sm font-mono text-emerald-400">28 Active</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "95%" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Database Sync</span>
                    <span className="text-sm font-mono text-emerald-400">Connected</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
