import { evaluateSensorAlerts } from "../alerts/rules";
import type { LatestIntelligenceObservation } from "../intelligence/types";
import { twinScenarioSchema, type TwinScenarioInput } from "./schema";
import type { DigitalTwinBaseline, DigitalTwinSimulation, TwinRiskLevel, TwinRiskProjection, TwinRiskType, TwinScenarioBasis } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const RISK_TYPES: readonly { type: TwinRiskType; title: string; unit: "%" | "°C"; metric: "feedLevelPercent" | "waterLevelPercent" | "temperatureC" }[] = [
  { type: "FEED_LOW", title: "Feed level", unit: "%", metric: "feedLevelPercent" },
  { type: "WATER_LOW", title: "Water level", unit: "%", metric: "waterLevelPercent" },
  { type: "HIGH_TEMPERATURE", title: "Temperature", unit: "°C", metric: "temperatureC" },
];

function validRange(value: number | null | undefined, minimum: number, maximum: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum ? value : null;
}

function observedMetrics(observed: LatestIntelligenceObservation | null) {
  return {
    feedLevelPercent: validRange(observed?.feedLevelPercent, 0, 100),
    waterLevelPercent: validRange(observed?.waterLevelPercent, 0, 100),
    temperatureC: validRange(observed?.temperatureC, -40, 85),
    humidityPercent: validRange(observed?.humidityPercent, 0, 100),
  };
}

function projectLevel(
  observedValue: number | null,
  directionalRate: number | null,
  startAssumption: number | undefined,
  rateAssumption: number | undefined,
  horizonDays: number,
) {
  const startPercent = startAssumption ?? observedValue;
  const startBasis: TwinScenarioBasis = startAssumption !== undefined
    ? "USER_ASSUMPTION"
    : observedValue !== null ? "OBSERVED_BASELINE" : "UNAVAILABLE";
  const rate = rateAssumption ?? directionalRate;
  const rateBasis: TwinScenarioBasis = rateAssumption !== undefined
    ? "USER_ASSUMPTION"
    : directionalRate !== null ? "DIRECTIONAL_TREND" : "UNAVAILABLE";
  const projectedPercent = startPercent !== null && rate !== null
    ? Math.max(0, Math.min(100, startPercent - rate * horizonDays))
    : null;

  return {
    unit: "%" as const,
    startPercent,
    startBasis,
    dailyDrawdownPercentagePoints: rate,
    rateBasis,
    projectedPercent,
    changeFromObservedPercentagePoints: observedValue !== null && projectedPercent !== null
      ? projectedPercent - observedValue
      : null,
  };
}

function projectEnvironment(
  observedValue: number | null,
  assumption: number | undefined,
  unit: "°C" | "%",
): { value: number | null; unit: "°C" | "%"; basis: TwinScenarioBasis } {
  if (assumption !== undefined) return { value: assumption, unit, basis: "USER_ASSUMPTION" };
  if (observedValue !== null) return { value: observedValue, unit, basis: "BASELINE_HELD" };
  return { value: null, unit, basis: "UNAVAILABLE" };
}

function riskLevel(level: string | null): TwinRiskLevel {
  if (!level) return "UNAVAILABLE";
  if (level === "WARNING" || level === "CRITICAL") return level;
  return "NONE";
}

function riskSnapshot(metrics: ReturnType<typeof observedMetrics>, stage: "BASELINE" | "SIMULATION"): TwinRiskProjection[] {
  const evaluations = new Map(evaluateSensorAlerts(metrics).map((evaluation) => [evaluation.type, evaluation]));
  return RISK_TYPES.map(({ type, title, unit, metric }) => {
    const value = metrics[metric];
    const evaluation = evaluations.get(type);
    if (value === null || !evaluation) {
      return { alertType: type, title, level: "UNAVAILABLE", value: null, thresholdValue: null, unit, explanation: null };
    }
    return {
      alertType: type,
      title,
      level: riskLevel(evaluation.active ? evaluation.severity : "NONE"),
      value,
      thresholdValue: evaluation.thresholdValue,
      unit,
      explanation: `${stage === "SIMULATION" ? "Simulated" : "Latest observed"} value: ${evaluation.reason}`,
    };
  });
}

function compareRisk(baseline: TwinRiskProjection, simulated: TwinRiskProjection) {
  const before = baseline.level;
  const after = simulated.level;
  let change: DigitalTwinSimulation["riskComparisons"][number]["change"] = "UNAVAILABLE";
  if (before !== "UNAVAILABLE" && after !== "UNAVAILABLE") {
    const ranks: Record<Exclude<TwinRiskLevel, "UNAVAILABLE">, number> = { NONE: 0, WARNING: 1, CRITICAL: 2 };
    change = ranks[after] > ranks[before] ? "INCREASED" : ranks[after] < ranks[before] ? "DECREASED" : "UNCHANGED";
  }
  return {
    alertType: baseline.alertType,
    title: baseline.title,
    baseline: before,
    simulated: after,
    change,
    baselineValue: baseline.value,
    simulatedValue: simulated.value,
    thresholdValue: simulated.thresholdValue ?? baseline.thresholdValue,
    unit: baseline.unit,
  };
}

function directionalRate(status: string | undefined, rate: number | null | undefined): number | null {
  return status === "ESTIMATED" && typeof rate === "number" && Number.isFinite(rate) && rate >= 0 ? rate : null;
}

export function simulateDigitalTwin(baseline: DigitalTwinBaseline, rawInput: TwinScenarioInput): DigitalTwinSimulation {
  const input = twinScenarioSchema.parse(rawInput);
  const observed = observedMetrics(baseline.observed);
  const feedLevel = projectLevel(
    observed.feedLevelPercent,
    directionalRate(baseline.forecasts.feed?.status, baseline.forecasts.feed?.dailyDeclinePercentagePoints),
    input.feedStartLevelAssumptionPercent,
    input.feedDailyDrawdownAssumptionPercentagePoints,
    input.horizonDays,
  );
  const waterLevel = projectLevel(
    observed.waterLevelPercent,
    directionalRate(baseline.forecasts.water?.status, baseline.forecasts.water?.dailyDeclinePercentagePoints),
    input.waterStartLevelAssumptionPercent,
    input.waterDailyDrawdownAssumptionPercentagePoints,
    input.horizonDays,
  );
  const temperature = projectEnvironment(observed.temperatureC, input.temperatureAtHorizonAssumptionC, "°C");
  const humidity = projectEnvironment(observed.humidityPercent, input.humidityAtHorizonAssumptionPercent, "%");
  const simulatedMetrics = {
    feedLevelPercent: feedLevel.projectedPercent,
    waterLevelPercent: waterLevel.projectedPercent,
    temperatureC: temperature.value,
    humidityPercent: humidity.value,
  };
  const baselineRisk = riskSnapshot(observed, "BASELINE");
  const projectedRisk = riskSnapshot(simulatedMetrics, "SIMULATION");
  const observationTime = baseline.observedAt ? Date.parse(baseline.observedAt) : Number.NaN;
  const horizonEnd = Number.isFinite(observationTime)
    ? new Date(observationTime + input.horizonDays * DAY_MS).toISOString()
    : null;

  return {
    kind: "SIMULATION",
    input,
    horizonEnd,
    feedLevel,
    waterLevel,
    temperature,
    humidity,
    feedWeight: {
      status: "NOT_SIMULATED",
      observedGrams: validRange(baseline.observed?.feedWeightGrams, 0, 5_000_000),
      explanation: "Feed-weight grams remain an observed measurement; this prototype has no calibrated mass-depletion model.",
    },
    baselineRisk,
    projectedRisk,
    riskComparisons: baselineRisk.map((before, index) => compareRisk(before, projectedRisk[index] ?? before)),
    limitations: [
      "All scenario values are simulations, not observations or validated predictions; they are never written to telemetry, device state, alerts, or recommendations.",
      "Feed and water projections use a Phase 5 directional rate only when its evidence gate passed; an entered assumption is clearly identified and is not measured consumption.",
      "Simulated feed and water levels are bounded to 0–100%; water percentages are not litres and feed-weight grams are not simulated.",
      "Environmental scenario values hold the latest observation constant unless an explicit horizon assumption is entered; humidity has no risk rule in the current prototype.",
      "Risk checks reuse the current Phase 3 prototype thresholds, which have not been validated for a species, farm, or sensor calibration.",
    ],
  };
}
