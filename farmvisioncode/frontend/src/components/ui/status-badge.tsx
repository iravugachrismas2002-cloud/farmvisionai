"use client";

import { memo, ReactNode } from "react";

type StatusBadgeProps = {
  status: "online" | "offline" | "warning" | "info" | "critical" | "maintenance" | "active" | "acknowledged" | "resolved" | "draft" | "published" | "archived";
  showIcon?: boolean;
  className?: string;
};

const statusData: Record<StatusBadgeProps["status"], { variant: "success" | "warning" | "destructive" | "info" | "secondary"; text: string; icon: string }> = {
  online: { variant: "success", text: "Online", icon: "🟢" },
  offline: { variant: "destructive", text: "Offline", icon: "🔴" },
  warning: { variant: "warning", text: "Warning", icon: "🟡" },
  info: { variant: "info", text: "Info", icon: "🔵" },
  critical: { variant: "destructive", text: "Critical", icon: "🔴" },
  maintenance: { variant: "info", text: "Maintenance", icon: "🔵" },
  active: { variant: "success", text: "Active", icon: "🟢" },
  acknowledged: { variant: "info", text: "Acknowledged", icon: "🟡" },
  resolved: { variant: "success", text: "Resolved", icon: "🟢" },
  draft: { variant: "warning", text: "Draft", icon: "🟡" },
  published: { variant: "success", text: "Published", icon: "🟢" },
  archived: { variant: "secondary", text: "Archived", icon: "⚫" },
};

const StatusBadgeComponent = ({ status, showIcon = true, className }: StatusBadgeProps) => {
  const data = statusData[status];

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
      {data.text}
    </span>
  );
};

export const StatusBadge = memo(StatusBadgeComponent);
