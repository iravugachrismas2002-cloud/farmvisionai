"use client";

import { ReactNode } from "react";

type AuditTrailEntry = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  actuator?: string;
  controller?: string;
  confirmed?: boolean;
  confirmedAt?: string;
  confirmedBy?: string;
  severity?: "info" | "warning" | "error";
};

type AuditTrailListProps = {
  entries: AuditTrailEntry[];
  className?: string;
};

const ACTION_ICONS: Record<string, string> = {
  start: "▶",
  stop: "⏹",
  confirm: "✅",
  error: "❌",
  fault: "⚠",
};

const ACTION_COLORS: Record<string, string> = {
  start: "success",
  stop: "secondary",
  confirm: "success",
  error: "destructive",
  fault: "warning",
};

export function AuditTrailList({
  entries,
  className,
}: AuditTrailListProps) {
  if (entries.length === 0) {
    return (
      <div className={`audit-trail rounded-lg border bg-card p-4 ${className || ""}`}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-muted-foreground opacity-50">📋</span>
          <p className="text-sm text-muted-foreground mt-2">No audit events recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`audit-trail rounded-lg border bg-card p-4 ${className || ""}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actuator</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => {
              const actionKey = entry.action.toLowerCase().split(" ")[0];
              const icon = ACTION_ICONS[actionKey] ?? "•";
              const colorClass = ACTION_COLORS[actionKey] ?? "muted-foreground";

              return (
                <tr key={entry.id} className="hover:bg-accent transition-colors">
                  <td className="px-3 py-2 text-sm font-mono text-muted-foreground">
                    {entry.timestamp}
                  </td>
                  <td className="px-3 py-2 text-sm text-foreground">{entry.user}</td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`flex items-center gap-1.5 ${colorClass === "muted-foreground" ? "text-muted-foreground" : ""}`}>
                      <span>{icon}</span>
                      <span className={`font-medium ${colorClass === "muted-foreground" ? "" : colorClass}`}>
                        {entry.action}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm font-mono text-muted-foreground">
                    {entry.actuator ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {entry.confirmed ? (
                      <span className="flex items-center gap-1 text-xs text-success">
                        ✅ Confirmed
                        {entry.confirmedAt && <span className="ml-1 opacity-60">({entry.confirmedAt})</span>}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-warning">
                        ⏳ Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
