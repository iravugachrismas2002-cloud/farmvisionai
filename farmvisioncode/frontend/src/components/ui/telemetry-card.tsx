"use client";

import { ReactNode } from "react";

type TelemetryCardProps = {
  label: string;
  value: number | null;
  unit: string;
  minimum: number | null;
  maximum: number | null;
  trend: "up" | "down" | "stable" | "unavailable";
  source: "hardware" | "simulator";
  observedAt: string;
  status: "normal" | "warning" | "critical" | "unavailable";
};

export function TelemetryCard({
  label,
  value,
  unit,
  minimum,
  maximum,
  trend,
  source,
  observedAt,
  status,
}: TelemetryCardProps) {
  const statusStyles: Record<TelemetryCardProps["status"], { bg: string; color: string; border?: string }> = {
    normal: { bg: "#065f46", color: "#dcfce7" },
    warning: { bg: "#78350f", color: "#fef3c7" },
    critical: { bg: "#7f1d1d", color: "#fee2e2" },
    unavailable: { bg: "#6b7280", color: "#e5e7eb", border: "#9ca3af" },
  };

  const data = statusStyles[status] || statusStyles.unavailable;
  const trendIcon = trend === "up" ? "📈" : trend === "down" ? "📉" : "→";

  return (
    <div
      className={`rounded-lg bg-card p-5 border ${data.border ? `border-${data.border}` : ""} ${data.bg === "#6b7280" ? "border" : ""} transition-colors`}
      style={{
        background: data.bg,
        color: data.color,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold">{value !== null ? `${value}${unit}` : "N/A"}</p>
        </div>
        <div className="self-center">
          <span className="text-lg font-medium">{trendIcon}</span>
          <p className="text-xs text-muted-foreground">{observedAt ? new Date(observedAt).toLocaleTimeString() : "—"}</p>
        </div>
      </div>
      {minimum !== null && maximum !== null && (
        <div className="mt-3 text-xs text-muted-foreground">
          <span>{minimum}{unit} min</span>
          <span>{maximum}{unit} max</span>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span>{source}</span>
        <span className="ml-2">{status}</span>
      </div>
    </div>
  );
}