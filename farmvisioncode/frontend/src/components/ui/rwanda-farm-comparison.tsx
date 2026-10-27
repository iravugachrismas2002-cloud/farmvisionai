"use client";

import { FARM_COMPARISON_BENCHMARKS } from "@/components/ui/rwanda-intelligence-data";

type FarmComparisonEngineProps = {
  farmSoilMoisture?: number;
  farmTemperature?: number;
  farmWaterLevel?: number;
  farmFeedLevel?: number;
  className?: string;
};

type ComparisonStatus = "above" | "below" | "at";

function getComparisonStatus(
  farmValue: number | undefined,
  benchmarkValue: number | undefined,
): ComparisonStatus {
  if (farmValue === undefined || benchmarkValue === undefined) return "at";
  if (farmValue > benchmarkValue + 2) return "above";
  if (farmValue < benchmarkValue - 2) return "below";
  return "at";
}

function getStatusColor(status: ComparisonStatus): string {
  switch (status) {
    case "above":
      return "text-success";
    case "below":
      return "text-destructive";
    case "at":
      return "text-muted-foreground";
  }
}

function getStatusLabel(status: ComparisonStatus): string {
  switch (status) {
    case "above":
      return "Above Average";
    case "below":
      return "Below Average";
    case "at":
      return "At Average";
  }
}

export function FarmComparisonEngine({
  farmSoilMoisture = 35,
  farmTemperature = 26,
  farmWaterLevel = 70,
  farmFeedLevel = 75,
  className,
}: FarmComparisonEngineProps) {
  const benchmarks = [
    {
      id: "district",
      ...FARM_COMPARISON_BENCHMARKS.district,
    },
    {
      id: "province",
      ...FARM_COMPARISON_BENCHMARKS.province,
    },
    {
      id: "national",
      ...FARM_COMPARISON_BENCHMARKS.national,
    },
  ];

  const metrics = [
    {
      id: "soilMoisture",
      label: "Soil Moisture",
      unit: "%",
      farmValue: farmSoilMoisture,
    },
    {
      id: "temperature",
      label: "Temperature",
      unit: "°C",
      farmValue: farmTemperature,
    },
    {
      id: "waterLevel",
      label: "Water Level",
      unit: "%",
      farmValue: farmWaterLevel,
    },
    {
      id: "feedLevel",
      label: "Feed Level",
      unit: "%",
      farmValue: farmFeedLevel,
    },
  ];

  return (
    <div
      className={`rwanda-comparison-engine rounded-lg border bg-card p-5 shadow-sm ${className || ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">
          Farm Comparison Engine
        </h3>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Benchmark Comparison
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Compare your farm metrics against district, provincial, and national averages.
      </p>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Metric
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your Farm
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                District Avg
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Provincial Avg
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                National Avg
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {metrics.map((metric) => {
              const districtStatus = getComparisonStatus(
                metric.farmValue,
                FARM_COMPARISON_BENCHMARKS.district[
                  metric.id as keyof typeof FARM_COMPARISON_BENCHMARKS.district
                ] as number,
              );
              const provinceStatus = getComparisonStatus(
                metric.farmValue,
                FARM_COMPARISON_BENCHMARKS.province[
                  metric.id as keyof typeof FARM_COMPARISON_BENCHMARKS.province
                ] as number,
              );
              const nationalStatus = getComparisonStatus(
                metric.farmValue,
                FARM_COMPARISON_BENCHMARKS.national[
                  metric.id as keyof typeof FARM_COMPARISON_BENCHMARKS.national
                ] as number,
              );

              return (
                <tr key={metric.id} className="hover:bg-accent transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-foreground">
                    {metric.label}
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-foreground">
                    {metric.farmValue}{" "}
                    <span className="text-[10px] text-muted-foreground">
                      {metric.unit}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-muted-foreground">
                    {FARM_COMPARISON_BENCHMARKS.district[
                      metric.id as keyof typeof FARM_COMPARISON_BENCHMARKS.district
                    ]}{" "}
                    <span className="text-[10px] text-muted-foreground">
                      {metric.unit}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-muted-foreground">
                    {FARM_COMPARISON_BENCHMARKS.province[
                      metric.id as keyof typeof FARM_COMPARISON_BENCHMARKS.province
                    ]}{" "}
                    <span className="text-[10px] text-muted-foreground">
                      {metric.unit}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-muted-foreground">
                    {FARM_COMPARISON_BENCHMARKS.national[
                      metric.id as keyof typeof FARM_COMPARISON_BENCHMARKS.national
                    ]}{" "}
                    <span className="text-[10px] text-muted-foreground">
                      {metric.unit}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <span
                      className={`font-bold ${getStatusColor(districtStatus)}`}
                    >
                      {getStatusLabel(districtStatus)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="text-success">🟢 Above Average</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-muted-foreground">⚪ At Average</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-destructive">🔴 Below Average</span>
        </span>
      </div>
    </div>
  );
}
