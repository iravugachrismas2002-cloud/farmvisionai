"use client";

import {
  NISR_STATISTICS,
  RWANDA_ADOPTION_STATS,
} from "@/components/ui/rwanda-intelligence-data";

type NISRStatisticsCardProps = {
  className?: string;
};

function getStatusColor(status: string): string {
  switch (status) {
    case "Health":
      return "text-success";
    case "Watch":
      return "text-warning";
    default:
      return "text-destructive";
  }
}

export function NISRStatisticsCard({
  className,
}: NISRStatisticsCardProps) {
  const statusColor = getStatusColor(NISR_STATISTICS.nationalAgricultureStatus);
  const statusIcon =
    NISR_STATISTICS.nationalAgricultureStatus === "Health"
      ? "🟢"
      : NISR_STATISTICS.nationalAgricultureStatus === "Watch"
      ? "🟡"
      : "🔴";

  return (
    <div className={`rwanda-nisr-card rounded-lg border bg-card p-5 shadow-sm ${className || ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg text-primary" aria-hidden="true">🇷🇼</span>
          <h3 className="font-bold text-lg text-foreground">{NISR_STATISTICS.title}</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{NISR_STATISTICS.latestNISRUpdate}</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-sm font-medium ${statusColor}`}>{statusIcon}</span>
        <span className="font-medium text-foreground">
          National Agriculture Status:{" "}
          <span className={`font-bold ${statusColor}`}>{NISR_STATISTICS.nationalAgricultureStatus}</span>
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {NISR_STATISTICS.stats.map((stat) => (
          <div key={stat.label} className="p-3 rounded-lg border bg-background/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <p className="text-lg font-bold text-foreground mt-1">{stat.value}</p>
            <p className={`text-xs ${stat.trendColor}`}>{stat.trend}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Farm Adoption Statistics (NISR/MINAGRI)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {RWANDA_ADOPTION_STATS.map((stat) => (
            <div key={stat.label} className="p-2 rounded-lg border bg-background/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.context}</p>
              <p className="text-[10px] text-primary font-medium">{stat.reference}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
