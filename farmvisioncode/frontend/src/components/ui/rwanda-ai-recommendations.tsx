"use client";

import { AI_RECOMMENDATION_TEMPLATES } from "@/components/ui/rwanda-intelligence-data";

type AIRecommendationsProps = {
  className?: string;
};

export function AIRecommendations({
  className,
}: AIRecommendationsProps) {
  return (
    <div
      className={`rwanda-ai-recommendations rounded-lg border bg-card p-5 shadow-sm ${className || ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg text-info" aria-hidden="true">
            🤖
          </span>
          <h3 className="font-bold text-lg text-foreground">
            AI Recommendations
          </h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Sensor + Agricultural Context
        </span>
      </div>

      <div className="space-y-3">
        {AI_RECOMMENDATION_TEMPLATES.map((rec, index) => {
          const severityColor =
            rec.severity === "critical"
              ? "text-destructive"
              : rec.severity === "warning"
              ? "text-warning"
              : "text-info";
          const severityIcon =
            rec.severity === "critical"
              ? "🔴"
              : rec.severity === "warning"
              ? "🟡"
              : "🔵";

          return (
            <div key={index} className="p-3 rounded-lg border bg-background/50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{severityIcon}</span>
                  <p className="text-sm font-medium text-foreground">
                    {rec.device}
                  </p>
                </div>
                <span className={`text-[10px] font-bold ${severityColor} uppercase tracking-wider`}>
                  {rec.severity}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {rec.metric}:{" "}
                <span className="font-medium text-foreground">
                  {rec.currentValue}{rec.unit}
                </span>{" "}
                (threshold: {rec.threshold}{rec.unit})
              </p>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-[10px] text-muted-foreground">
                  💡
                </span>
                <p className="text-sm text-muted-foreground">
                  {rec.recommendation}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-1.5 rounded-md border border-success bg-success text-success-foreground text-xs font-bold hover:bg-success/90 transition-colors"
                  onClick={() => {}}
                >
                  {rec.action}
                </button>
                <span className="text-[10px] text-muted-foreground">
                  Impact: {rec.impact}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg border bg-blue-50/20 border-blue-100/50">
        <p className="text-xs text-blue-800 font-medium mb-1">
          How AI Recommendations Work
        </p>
        <p className="text-xs text-blue-700">
          AI combines real-time ESP32 sensor data with Rwanda agricultural
          benchmarks (NISR/MINAGRI) to generate context-aware recommendations
          for each device on your farm.
        </p>
      </div>
    </div>
  );
}
