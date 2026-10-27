import type { AlertSeverity, AlertType, DeviceSource, RecommendationType } from "../../generated/prisma/enums";

export type RecommendationInput = {
  alertType: AlertType;
  severity: AlertSeverity;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  reason: string;
  observedValue: number;
  thresholdValue: number;
  unit: string;
  observedAt: Date;
  generatedAt: Date;
  deviceSource: DeviceSource;
};

export type RecommendationCandidate = {
  type: RecommendationType;
  severity: Exclude<AlertSeverity, "INFO">;
  title: string;
  reason: string;
  suggestedAction: string;
  observedValue: number;
  thresholdValue: number;
  unit: string;
  observedAt: Date;
  deviceSource: DeviceSource;
  ruleVersion: "recommendation-v1";
};

const RECOMMENDATION_RULE_VERSION = "recommendation-v1" as const;

/**
 * Convert a persisted alert finding into one transparent recommendation.
 * This function has no database, notification, or actuator side effects.
 */
export function buildRecommendation(input: RecommendationInput): RecommendationCandidate | null {
  if (input.status === "RESOLVED" || input.severity === "INFO") return null;

  let type: RecommendationType;
  let title: string;
  let suggestedAction: string;

  switch (input.alertType) {
    case "FEED_LOW":
      type = "FEED_CHECK";
      title = "Check feed availability";
      suggestedAction = "Verify the sensor reading and inspect the feeder. If the low level is confirmed, replenish according to the farm's established feeding plan.";
      break;
    case "WATER_LOW":
      type = "WATER_CHECK";
      title = "Check water availability";
      suggestedAction = "Verify the sensor reading and inspect the water supply. If the low level is confirmed, restore access according to the farm's established water plan.";
      break;
    case "HIGH_TEMPERATURE":
      type = "HEAT_RESPONSE";
      title = "Review the farm heat-response plan";
      suggestedAction = "Verify the temperature reading; inspect shade, airflow, and water access, then follow the farm's approved heat-response plan. This recommendation does not activate equipment.";
      break;
  }

  return {
    type,
    severity: input.severity,
    title,
    reason: input.reason,
    suggestedAction,
    observedValue: input.observedValue,
    thresholdValue: input.thresholdValue,
    unit: input.unit,
    observedAt: input.observedAt,
    deviceSource: input.deviceSource,
    ruleVersion: RECOMMENDATION_RULE_VERSION,
  };
}
