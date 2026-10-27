"use client";

import { ReactNode } from "react";

type KpiCardProps = {
  label: string;
  value: number | null;
  change?: number;
  trend?: "up" | "down" | "stable";
  status?: "healthy" | "info" | "warning" | "critical" | "unavailable";
  loading?: boolean;
  description?: string;
};

export function KpiCard({
  label,
  value,
  change,
  trend = "stable",
  status = "healthy",
  loading = false,
  description,
}: KpiCardProps) {
  const statusStyles: Record<NonNullable<KpiCardProps["status"]>, { bg: string; border: string; icon: string; color: string }> = {
    healthy: { bg: "#14532d", border: "#22c55e", icon: "🟢", color: "#dcfce7" },
    info: { bg: "#0c4a6e", border: "#0ea5e9", icon: "ℹ️", color: "#e0f2fe" },
    warning: { bg: "#78350f", border: "#f59e0b", icon: "⚠️", color: "#fef3c7" },
    critical: { bg: "#7f1d1d", border: "#ef4444", icon: "⚠️", color: "#fee2e2" },
    unavailable: { bg: "#6b7280", border: "#9ca3af", icon: "❓", color: "#e5e7eb" },
  };

  const data = (statusStyles as Record<string, { bg: string; border: string; icon: string; color: string }>)[status] ?? statusStyles.unavailable;
  const trendIcon = trend === "up" ? "📈" : trend === "down" ? "📉" : "→";

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm min-h-[140px] flex flex-col justify-between">
      <div className="flex flex-col items-start">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold">{value !== null ? value.toLocaleString() : "N/A"}</p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-lg font-medium">{data.icon}</span>
        <span className="text-sm text-muted-foreground">{trendIcon}</span>
        {change !== undefined && (
          <span className="text-sm">
            {change > 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}