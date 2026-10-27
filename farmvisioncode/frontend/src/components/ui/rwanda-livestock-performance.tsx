"use client";

import { RWANDA_LIVESTOCK } from "@/components/ui/rwanda-intelligence-data";

type LivestockPerformanceCardProps = {
  className?: string;
};

export function LivestockPerformanceCenter({
  className,
}: LivestockPerformanceCardProps) {
  return (
    <div
      className={`rwanda-livestock-center rounded-lg border bg-card p-5 shadow-sm ${className || ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg text-info" aria-hidden="true">
            🐄
          </span>
          <h3 className="font-bold text-lg text-foreground">
            Livestock Performance Center
          </h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {RWANDA_LIVESTOCK.length} Animal Types
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Animal
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Count
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Health Status
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Feed Levels
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Water Availability
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Alerts
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {RWANDA_LIVESTOCK.map((livestock) => {
              const healthColor =
                livestock.healthStatus === "Good"
                  ? "text-success"
                  : livestock.healthStatus === "Watch"
                  ? "text-warning"
                  : "text-destructive";
              const alertColor =
                livestock.alerts === 0
                  ? "text-success"
                  : livestock.alerts <= 2
                  ? "text-warning"
                  : "text-destructive";

              return (
                <tr key={livestock.name} className="hover:bg-accent transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-foreground">
                    {livestock.name}
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-foreground">
                    {livestock.animalCount}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <span className={`font-medium ${healthColor}`}>
                      {livestock.healthStatus}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    {livestock.feedLevels}
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    {livestock.waterAvailability}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <span className={`font-bold ${alertColor}`}>
                      {livestock.alerts}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="text-success">🟢 Good</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-warning">🟡 Watch</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-destructive">🔴 Critical</span>
        </span>
      </div>
    </div>
  );
}
