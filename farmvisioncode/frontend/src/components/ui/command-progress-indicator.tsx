"use client";

import { ReactNode } from "react";

type CommandStage =
  | "idle"
  | "sent"
  | "acknowledged"
  | "executing"
  | "confirmed"
  | "error"
  | "timeout";

type CommandProgressIndicatorProps = {
  stage: CommandStage;
  message?: string;
  actuatorName?: string;
  className?: string;
};

const STAGE_DATA: Record<CommandStage, { variant: "success" | "warning" | "destructive" | "info" | "secondary"; label: string; icon: string }> = {
  idle: { variant: "secondary", label: "Idle", icon: "⭘" },
  sent: { variant: "info", label: "Command Sent", icon: "📤" },
  acknowledged: { variant: "info", label: "Acknowledged", icon: "✅" },
  executing: { variant: "warning", label: "Executing", icon: "⚙" },
  confirmed: { variant: "success", label: "Confirmed", icon: "✅" },
  error: { variant: "destructive", label: "Error", icon: "❌" },
  timeout: { variant: "destructive", label: "Timeout", icon: "⏱" },
};

export function CommandProgressIndicator({
  stage,
  message,
  actuatorName,
  className,
}: CommandProgressIndicatorProps) {
  const data = STAGE_DATA[stage];

  return (
    <div className={`command-progress rounded-lg border p-4 ${className || ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-${data.variant}`}>{data.icon}</span>
        <span className="font-medium text-foreground">{data.label}</span>
        {actuatorName && (
          <span className="ml-auto text-xs font-mono text-muted-foreground">{actuatorName}</span>
        )}
      </div>
      {message && (
        <p className="text-sm text-muted-foreground leading-tight">{message}</p>
      )}
      <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width:
              stage === "confirmed"
                ? 100
                : stage === "executing"
                  ? 75
                  : stage === "acknowledged"
                    ? 50
                    : stage === "sent"
                      ? 25
                      : stage === "error" || stage === "timeout"
                        ? 0
                        : 0,
            background: stage === "confirmed"
              ? "hsl(var(--success))"
              : stage === "error" || stage === "timeout"
                ? "hsl(var(--destructive))"
                : "hsl(var(--primary))",
          }}
        />
      </div>
    </div>
  );
}
