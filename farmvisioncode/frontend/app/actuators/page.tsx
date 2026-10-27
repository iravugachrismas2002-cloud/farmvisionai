"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ShellHeader } from "@/components/ui/shell-header";
import { ShellSidebar } from "@/components/ui/shell-sidebar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActuatorCard } from "@/components/ui/actuator-card";
import { ActuatorConfirmDialog } from "@/components/ui/actuator-confirm-dialog";
import { Esp32StatusCard } from "@/components/ui/esp32-status-card";
import { SafetyInterlockAlert } from "@/components/ui/safety-interlock-alert";
import { AuditTrailList } from "@/components/ui/audit-trail-list";
import { CommandProgressIndicator } from "@/components/ui/command-progress-indicator";
import { ActuatorStateBadge } from "@/components/ui/actuator-state-badge";

type Actuator = {
  id: string;
  name: string;
  type: "PUMP" | "FAN" | "LIGHT" | "VALVE" | "MOTOR" | "HEATER";
  controllerId: string;
  state: "OFF" | "PENDING" | "RUNNING" | "STOPPING" | "ERROR" | "OFFLINE";
  runtimeMinutes?: number;
  progressPercent?: number;
  lastCommand?: string;
  lastCommandAgo?: string;
  interlockReason?: string;
};

type Esp32Controller = {
  deviceId: string;
  name: string;
  location: string;
  firmware: string;
  signalPercent: number;
  lastHeartbeatAgoSeconds: number;
  powerSource: string;
};

type AuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  actuator?: string;
  controller?: string;
  confirmed?: boolean;
  confirmedAt?: string;
};

const SECTIONS = [
  {
    id: "mission-control",
    label: "Mission Control",
    icon: "🏠",
    items: [
      { id: "mc-home", href: "/dashboard", label: "Dashboard", icon: "🏠", permissionStatus: "available" as const },
    ],
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

const MOCK_CONTROLLER: Esp32Controller = {
  deviceId: "ESP32-FARM-001",
  name: "Main Controller",
  location: "Greenhouse A",
  firmware: "v1.0.0",
  signalPercent: 92,
  lastHeartbeatAgoSeconds: 2,
  powerSource: "External Power",
};

const MOCK_ACTUATORS: Actuator[] = [
  {
    id: "pump-001",
    name: "Water Pump",
    type: "PUMP",
    controllerId: "ESP32-FARM-001",
    state: "RUNNING",
    runtimeMinutes: 12,
    lastCommand: "START",
    lastCommandAgo: "12 min ago",
  },
  {
    id: "fan-001",
    name: "Ventilation Fan",
    type: "FAN",
    controllerId: "ESP32-FARM-001",
    state: "OFF",
    lastCommand: "STOP",
    lastCommandAgo: "4 h ago",
  },
  {
    id: "light-001",
    name: "Lighting System",
    type: "LIGHT",
    controllerId: "ESP32-FARM-001",
    state: "RUNNING",
    lastCommand: "START",
    lastCommandAgo: "2 h ago",
  },
  {
    id: "valve-001",
    name: "Water Valve",
    type: "VALVE",
    controllerId: "ESP32-FARM-001",
    state: "PENDING",
    progressPercent: 72,
    lastCommand: "OPEN",
    lastCommandAgo: "30 sec ago",
    interlockReason: "Water tank below minimum threshold (12%)",
  },
];

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: "audit-001",
    timestamp: "10:05:11",
    user: "Christmas",
    action: "Started Water Pump",
    actuator: "pump-001",
    controller: "ESP32-FARM-001",
    confirmed: true,
    confirmedAt: "10:05:13",
  },
  {
    id: "audit-002",
    timestamp: "10:07:44",
    user: "ESP32-FARM-001",
    action: "Command Confirmed",
    actuator: "pump-001",
    controller: "ESP32-FARM-001",
    confirmed: true,
    confirmedAt: "10:07:44",
  },
  {
    id: "audit-003",
    timestamp: "10:18:12",
    user: "Christmas",
    action: "Stopped Water Pump",
    actuator: "pump-001",
    controller: "ESP32-FARM-001",
    confirmed: true,
    confirmedAt: "10:18:14",
  },
  {
    id: "audit-004",
    timestamp: "10:18:14",
    user: "ESP32-FARM-001",
    action: "Command Confirmed",
    actuator: "pump-001",
    controller: "ESP32-FARM-001",
    confirmed: true,
    confirmedAt: "10:18:14",
  },
];

export default function ActuatorsPage() {
  const [actuators, setActuators] = useState<Actuator[]>(MOCK_ACTUATORS);
  const [controllerStatus, setControllerStatus] = useState<"ONLINE" | "UNSTABLE" | "OFFLINE" | "UNKNOWN">("ONLINE");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmActuator, setConfirmActuator] = useState<Actuator | null>(null);
  const [commandStage, setCommandStage] = useState<"idle" | "sent" | "acknowledged" | "executing" | "confirmed" | "error" | "timeout">("idle");
  const [commandMessage, setCommandMessage] = useState("");
  const [activePath, setActivePath] = useState("/actuators");

  const handleToggleActuator = useCallback((actuator: Actuator, desiredState: "RUNNING" | "OFF") => {
    const isStarting = desiredState === "RUNNING";
    setConfirmActuator(actuator);
    setConfirmOpen(true);
    setCommandStage("sent");
    setCommandMessage(
      isStarting
        ? `Command sent to ${actuator.controllerId}. Waiting for ESP32 acknowledgment...`
        : `Stop command sent to ${actuator.controllerId}. Waiting for ESP32 acknowledgment...`
    );
  }, []);

  const handleConfirm = useCallback(() => {
    if (!confirmActuator) return;
    setCommandStage("acknowledged");
    setCommandMessage("ESP32 acknowledged command. Executing on controller...");
    setTimeout(() => {
      setCommandStage("executing");
      setCommandMessage("Actuator executing command on ESP32 controller...");
      setTimeout(() => {
        setCommandStage("confirmed");
        setCommandMessage("ESP32 confirmed execution. Dashboard updated.");
        setActuators((prev) =>
          prev.map((a) =>
            a.id === confirmActuator!.id
              ? {
                  ...a,
                  state: confirmActuator!.state === "OFF" ? "RUNNING" : "OFF",
                  lastCommand: confirmActuator!.state === "OFF" ? "START" : "STOP",
                  lastCommandAgo: "Just now",
                }
              : a
          )
        );
        setConfirmActuator(null);
        setConfirmOpen(false);
      }, 1500);
    }, 1000);
  }, [confirmActuator]);

  const handleCancel = useCallback(() => {
    setConfirmOpen(false);
    setConfirmActuator(null);
    setCommandStage("idle");
    setCommandMessage("");
  }, []);

  const safetyRules = [
    {
      rule: "Controller Online",
      satisfied: controllerStatus === "ONLINE",
      reason: controllerStatus !== "ONLINE" ? "ESP32 controller is not reachable" : undefined,
    },
    {
      rule: "No Active Fault",
      satisfied: true,
    },
  ];

  return (
    <div className="dashboard-shell">
      <ShellHeader
        title="Actuators"
        subtitle="Hardware control and safety interlocks"
        showSearch={true}
        userProfile={{
          name: "Christmas IRAVUGA",
          email: "chrisirav537@gmail.com",
          profileType: "Farmer",
          systemRole: "Farmer",
          organization: "FarmVision Demo Farm",
          accountStatus: "Verified",
          permissionLevel: "Standard User",
        }}
        onLogout={() => {
          window.location.href = "/api/auth/logout";
        }}
        notificationCount={0}
      />
      <div className="dashboard-wrap">
        <ShellSidebar
          sections={SECTIONS}
          currentPath={activePath}
        />
        <main className="dashboard-main">
          <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Actuators", href: "/actuators" }]} />

          {/* Controller Status Card */}
          <Card className="mb-4">
            <CardHeader title="ESP32 Controller" description="Main farm controller status and heartbeat" />
            <Esp32StatusCard
              deviceId={MOCK_CONTROLLER.deviceId}
              name={MOCK_CONTROLLER.name}
              location={MOCK_CONTROLLER.location}
              firmware={MOCK_CONTROLLER.firmware}
              signalPercent={MOCK_CONTROLLER.signalPercent}
              lastHeartbeatAgoSeconds={MOCK_CONTROLLER.lastHeartbeatAgoSeconds}
              powerSource={MOCK_CONTROLLER.powerSource}
              onHeartbeatUpdate={setControllerStatus}
            />
          </Card>

          {/* Safety Interlocks */}
          <Card className="mb-4">
            <CardHeader title="Safety Interlocks" description="Preconditions that must be met before actuator commands are accepted" />
            <SafetyInterlockAlert
              actuatorName="Selected Actuator"
              canStart={controllerStatus === "ONLINE"}
              blockingReason={controllerStatus !== "ONLINE" ? "Controller is not online" : undefined}
              rules={safetyRules}
            />
          </Card>

          {/* Command Progress */}
          {commandStage !== "idle" && (
            <Card className="mb-4">
              <CardHeader title="Command Progress" description="Real-time command execution status" />
              <CommandProgressIndicator
                stage={commandStage}
                message={commandMessage}
                actuatorName={confirmActuator?.name}
              />
            </Card>
          )}

          {/* Actuator Grid */}
          <div className="dashboard-grid-3">
            {actuators.map((actuator) => (
              <ActuatorCard
                key={actuator.id}
                id={actuator.id}
                name={actuator.name}
                type={actuator.type}
                controllerId={actuator.controllerId}
                state={actuator.state}
                runtimeMinutes={actuator.runtimeMinutes}
                progressPercent={actuator.progressPercent}
                lastCommand={actuator.lastCommand}
                lastCommandAgo={actuator.lastCommandAgo}
                interlockReason={actuator.interlockReason}
                onToggle={(desiredState) => handleToggleActuator(actuator, desiredState)}
                onConfirm={handleConfirm}
              />
            ))}
          </div>

          {/* Audit Trail */}
          <Card>
            <CardHeader title="Audit Trail" description="Every actuator action is logged and verified" />
            <AuditTrailList entries={MOCK_AUDIT} />
          </Card>

          {/* Confirmation Dialog */}
          <ActuatorConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            actuatorName={confirmActuator?.name ?? ""}
            deviceId={confirmActuator?.controllerId ?? ""}
            actuatorType={confirmActuator?.type ?? ""}
            currentState={confirmActuator?.state === "RUNNING" ? "RUNNING" : "OFF"}
            desiredState={confirmActuator ? (confirmActuator.state === "OFF" ? "RUNNING" : "OFF") : "RUNNING"}
            expectedAction={confirmActuator?.state === "OFF" ? "Start Irrigation" : "Stop Irrigation"}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </main>
      </div>
    </div>
  );
}
