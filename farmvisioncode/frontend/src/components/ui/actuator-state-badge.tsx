"use client";

import { memo, ReactNode } from "react";

export type ActuatorState =
  | "OFF"
  | "PENDING"
  | "RUNNING"
  | "STOPPING"
  | "ERROR"
  | "OFFLINE";

type ActuatorStateBadgeProps = {
  state: ActuatorState;
  showIcon?: boolean;
  className?: string;
  message?: string;
};

const STATE_DATA: Record<ActuatorState, { variant: "success" | "warning" | "destructive" | "info" | "secondary"; label: string; icon: string }> = {
  OFF: { variant: "secondary", label: "Off", icon: "⭘" },
  PENDING: { variant: "info", label: "Pending", icon: "⏳" },
  RUNNING: { variant: "success", label: "Running", icon: "▶" },
  STOPPING: { variant: "warning", label: "Stopping", icon: "⏸" },
  ERROR: { variant: "destructive", label: "Error", icon: "❌" },
  OFFLINE: { variant: "destructive", label: "Offline", icon: "🔌" },
};

const ActuatorStateBadgeComponent = ({ state, showIcon = true, className, message }: ActuatorStateBadgeProps) => {
  const data = STATE_DATA[state];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border gap-1 ${className || ""}`}
      style={{
        background: `hsl(var(--${data.variant}) / 0.1)`,
        border: `1px solid hsl(var(--${data.variant}) / 0.3)`,
        color: `hsl(var(--${data.variant}))`,
      }}
    >
      {showIcon && <span>{data.icon}</span>}
      <span>{data.label}</span>
      {message && (
        <span className="ml-2 text-[10px] opacity-70">{message}</span>
      )}
    </span>
  );
};

export const ActuatorStateBadge = memo(ActuatorStateBadgeComponent);

export function ActuatorStateColor(state: ActuatorState): string {
  return STATE_DATA[state]?.variant ?? "secondary";
}

export function ActuatorStateLabel(state: ActuatorState): string {
  return STATE_DATA[state]?.label ?? state;
}

export function ActuatorStateIcon(state: ActuatorState): string {
  return STATE_DATA[state]?.icon ?? "";
}
