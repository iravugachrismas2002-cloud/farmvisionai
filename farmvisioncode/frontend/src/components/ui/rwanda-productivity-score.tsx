"use client";

type AgriculturalProductivityScoreProps = {
  className?: string;
};

type ProductivityMetric = {
  label: string;
  value: number;
  max: number;
  weight: number;
  color: string;
};

const PRODUCTIVITY_METRICS: ProductivityMetric[] = [
  { label: "Sensor Availability", value: 95, max: 100, weight: 0.2, color: "text-success" },
  { label: "Actuator Efficiency", value: 88, max: 100, weight: 0.15, color: "text-info" },
  { label: "Water Usage Efficiency", value: 82, max: 100, weight: 0.2, color: "text-info" },
  { label: "System Uptime", value: 99, max: 100, weight: 0.15, color: "text-success" },
  { label: "Crop Conditions", value: 78, max: 100, weight: 0.15, color: "text-warning" },
  { label: "Alert Resolution", value: 85, max: 100, weight: 0.15, color: "text-success" },
];

function calculateProductivityScore(): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const metric of PRODUCTIVITY_METRICS) {
    weightedSum += (metric.value / metric.max) * metric.weight * 100;
    totalWeight += metric.weight;
  }
  return Math.round(weightedSum / totalWeight);
}

export function AgriculturalProductivityScore({
  className,
}: AgriculturalProductivityScoreProps) {
  const score = calculateProductivityScore();
  const scoreColor =
    score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
  const performanceLabel =
    score >= 80 ? "Good" : score >= 60 ? "Fair" : "Needs Improvement";

  return (
    <div
      className={`rwanda-productivity-score rounded-lg border bg-card p-5 shadow-sm ${className || ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">
          Agricultural Productivity Score
        </h3>
        <span className={`text-2xl font-bold ${scoreColor}`}>
          {score}/100
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Farm Performance
          </p>
          <p className={`text-lg font-bold ${scoreColor}`}>
            {performanceLabel}
          </p>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, score)}%`,
              backgroundColor:
                score >= 80
                  ? "hsl(var(--success))"
                  : score >= 60
                  ? "hsl(var(--warning))"
                  : "hsl(var(--destructive))",
            }}
          />
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRODUCTIVITY_METRICS.map((metric) => {
          const percentage = Math.round(
            (metric.value / metric.max) * 100,
          );
          return (
            <div
              key={metric.label}
              className="p-3 rounded-lg border bg-background/50"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground font-medium">
                  {metric.label}
                </p>
                <span className={`text-xs font-bold ${metric.color}`}>
                  {percentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: percentage,
                    backgroundColor: `hsl(var(--${metric.color === "text-success" ? "success" : metric.color === "text-warning" ? "warning" : metric.color === "text-info" ? "info" : "destructive"}))`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
