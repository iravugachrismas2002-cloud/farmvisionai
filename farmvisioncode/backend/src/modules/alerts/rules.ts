import type { AlertSeverity, AlertType } from "../../generated/prisma/enums";

export type SensorSnapshot = {
  temperatureC?: number | null;
  feedLevelPercent?: number | null;
  waterLevelPercent?: number | null;
};

export type AlertThresholds = {
  feedLowWarningPercent: number;
  feedLowCriticalPercent: number;
  waterLowWarningPercent: number;
  waterLowCriticalPercent: number;
  highTemperatureWarningC: number;
  highTemperatureCriticalC: number;
};

export const DEFAULT_ALERT_THRESHOLDS: Readonly<AlertThresholds> = {
  feedLowWarningPercent: 20,
  feedLowCriticalPercent: 10,
  waterLowWarningPercent: 20,
  waterLowCriticalPercent: 10,
  highTemperatureWarningC: 32,
  highTemperatureCriticalC: 35,
};

export type AlertEvaluation = {
  type: AlertType;
  severity: AlertSeverity;
  active: boolean;
  title: string;
  reason: string;
  suggestedAction: string;
  observedValue: number;
  thresholdValue: number;
  unit: string;
};

export function evaluateThreshold(
  type: AlertType,
  value: number | null | undefined,
  warningThreshold: number,
  criticalThreshold: number,
  direction: "LOW" | "HIGH",
  title: string,
  unit: string,
  suggestedAction: string,
): AlertEvaluation | null {
  if (value === null || value === undefined) return null;

  const critical = direction === "LOW" ? value <= criticalThreshold : value >= criticalThreshold;
  const warning = direction === "LOW" ? value <= warningThreshold : value >= warningThreshold;
  const active = warning;
  const severity: AlertSeverity = critical ? "CRITICAL" : warning ? "WARNING" : "INFO";
  const thresholdValue = critical ? criticalThreshold : warningThreshold;
  const directionText = direction === "LOW" ? "at or below" : "at or above";
  const reason = active
    ? `${title} is ${value}${unit}, ${directionText} the configured ${severity.toLowerCase()} threshold of ${thresholdValue}${unit}.`
    : `${title} is ${value}${unit}, within the configured prototype range.`;

  return {
    type,
    severity,
    active,
    title,
    reason,
    suggestedAction,
    observedValue: value,
    thresholdValue,
    unit,
  };
}

export function evaluateSensorAlerts(
  snapshot: SensorSnapshot,
  thresholds: Readonly<AlertThresholds> = DEFAULT_ALERT_THRESHOLDS,
): AlertEvaluation[] {
  const evaluations = [
    evaluateThreshold(
      "FEED_LOW",
      snapshot.feedLevelPercent,
      thresholds.feedLowWarningPercent,
      thresholds.feedLowCriticalPercent,
      "LOW",
      "Feed level",
      "%",
      "Check the feeder and replenish feed if appropriate.",
    ),
    evaluateThreshold(
      "WATER_LOW",
      snapshot.waterLevelPercent,
      thresholds.waterLowWarningPercent,
      thresholds.waterLowCriticalPercent,
      "LOW",
      "Water level",
      "%",
      "Check the water supply and refill it if appropriate.",
    ),
    evaluateThreshold(
      "HIGH_TEMPERATURE",
      snapshot.temperatureC,
      thresholds.highTemperatureWarningC,
      thresholds.highTemperatureCriticalC,
      "HIGH",
      "Temperature",
      "°C",
      "Inspect the environment and follow the farm's approved heat-response procedure.",
    ),
  ];

  return evaluations.filter((evaluation): evaluation is AlertEvaluation => evaluation !== null);
}
