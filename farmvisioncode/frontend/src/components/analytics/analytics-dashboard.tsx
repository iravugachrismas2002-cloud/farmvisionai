"use client";

import { useState } from "react";
import { EmptyStateAnalytics } from "@/components/ui/empty-state";

export type AnalyticsReading = {
  temperatureC: number | null;
  humidityPercent: number | null;
  feedLevelPercent: number | null;
  waterLevelPercent: number | null;
  observedAt: string;
};

export type AnalyticsRange = "24h" | "7d" | "30d" | "90d";

export function AnalyticsDashboard({
  readings,
  ranges = ["24h", "7d", "30d"],
  showSkeletons = false,
}: {
  readings?: AnalyticsReading[];
  ranges?: AnalyticsRange[];
  showSkeletons?: boolean;
}) {
  const [selectedRange, setSelectedRange] = useState<AnalyticsRange>("24h");

  const skeletonReading: AnalyticsReading = {
    temperatureC: null,
    humidityPercent: null,
    feedLevelPercent: null,
    waterLevelPercent: null,
    observedAt: new Date().toISOString(),
  };

  const data = showSkeletons
    ? Array.from({ length: 10 }, () => skeletonReading)
    : readings;

  if (!data || data.length === 0) {
    return <EmptyStateAnalytics title="No analytics data" />;
  }

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="grid grid-cols-3 gap-2">
        {ranges.map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`
              rounded-lg border border-${
                selectedRange === range ? "primary" : "transparent"
              } py-2 text-sm font-medium ${
                selectedRange === range
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }
            `}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature Card */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M14.7 6.3a1 1 0 0 1 0 1.4H10.5a1 1 0 0 1 0-1.4h2.5a1 1 0 0 1 1 1.4z" />
            </svg>
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="text-2xl font-medium text-foreground">
                {data[0]?.temperatureC ?? "—"}{data[0]?.temperatureC == null ? "" : "°C"}
              </p>
            </div>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="text-2xl font-medium text-foreground">
                {data[0]?.humidityPercent ?? "—"}{data[0]?.humidityPercent == null ? "" : "%"}
              </p>
            </div>
          </div>
        </div>

        {/* Feed Level Card */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M5 3v4h14V3H5zm0 12h4v4H5v-4zm8-4.59L17.41 9H15.5l2.12 4.35L15 17l-2.53 1.38L9 15l-2.12 1.55L7 11.5l2.53-1.38L4.5 13l2.12-4.35L2.59 9H5v2h2v-2h2v2zM7 18l5-5 5 5M7 13l5-2.01L7 11l5 2.01L7 13zM17 13l5 5 5-5M17 17l5-5 5 5" />
            </svg>
            <div>
              <p className="text-sm text-muted-foreground">Feed Level</p>
              <p className="text-2xl font-medium text-foreground">
                {data[0]?.feedLevelPercent ?? "—"}{data[0]?.feedLevelPercent == null ? "" : "%"}
              </p>
            </div>
          </div>
        </div>

        {/* Water Level Card */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M5 3v4h14V3H5zm0 12h4v4H5v-4zm8-4.59L17.41 9H15.5l2.12 4.35L15 17l-2.53 1.38L9 15l-2.12 1.55L7 11.5l2.53-1.38L4.5 13l2.12-4.35L2.59 9H5v2h2v-2h2v2zM7 18l5-5 5 5M7 13l5-2.01L7 11l5 2.01L7 13zM17 13l5 5 5-5M17 17l5-5 5 5" />
            </svg>
            <div>
              <p className="text-sm text-muted-foreground">Water Level</p>
              <p className="text-2xl font-medium text-foreground">
                {data[0]?.waterLevelPercent ?? "—"}{data[0]?.waterLevelPercent == null ? "" : "%"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground mb-2">
          Recent readings ({selectedRange})
        </p>

        <p className="text-sm text-muted-foreground">
          {showSkeletons
            ? "Loading readings…"
            : `${data.length} readings available for the selected period.`}
        </p>
      </div>
    </div>
  );
}