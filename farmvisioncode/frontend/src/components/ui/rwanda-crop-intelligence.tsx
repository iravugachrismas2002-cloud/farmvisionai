"use client";

import { RWANDA_CROPS } from "@/components/ui/rwanda-intelligence-data";

type CropIntelligenceCardProps = {
  className?: string;
};

export function CropIntelligenceCenter({
  className,
}: CropIntelligenceCardProps) {
  return (
    <div
      className={`rwanda-crop-intelligence rounded-lg border bg-card p-5 shadow-sm ${className || ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg text-success" aria-hidden="true">
            🌱
          </span>
          <h3 className="font-bold text-lg text-foreground">
            Crop Intelligence Center
          </h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {RWANDA_CROPS.length} Rwanda Crops
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Crop
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Field Status
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Yield Potential
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Water Need
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Disease Risk
              </th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Market Relevance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {RWANDA_CROPS.map((crop) => {
              const riskColor =
                crop.diseaseRisk === "High"
                  ? "text-destructive"
                  : crop.diseaseRisk === "Medium"
                  ? "text-warning"
                  : "text-success";
              const waterColor =
                crop.waterNeed === "Very High"
                  ? "text-destructive"
                  : crop.waterNeed === "High"
                  ? "text-warning"
                  : crop.waterNeed === "Medium"
                  ? "text-info"
                  : "text-success";
              const marketColor =
                crop.marketRelevance === "Very High"
                  ? "text-success"
                  : crop.marketRelevance === "High"
                  ? "text-info"
                  : "text-muted-foreground";

              return (
                <tr key={crop.name} className="hover:bg-accent transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-foreground">
                    {crop.name}
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    {crop.fieldStatus}
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-foreground">
                    {crop.yieldPotential}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <span className={`font-medium ${waterColor}`}>
                      {crop.waterNeed}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <span className={`font-medium ${riskColor}`}>
                      {crop.diseaseRisk}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <span className={`font-medium ${marketColor}`}>
                      {crop.marketRelevance}
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
          <span className="text-success">🟢 Low Risk</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-warning">🟡 Medium Risk</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-destructive">🔴 High Risk</span>
        </span>
      </div>
    </div>
  );
}
