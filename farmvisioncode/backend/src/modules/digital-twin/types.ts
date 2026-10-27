import type { AlertEvaluation } from "../alerts/rules";
import type { AnalyticsDeviceOption, AnalyticsFarmOption, AnalyticsResponse } from "../analytics/types";
import type { ActiveRiskSignal, DepletionForecast, IntelligenceResponse, LatestIntelligenceObservation } from "../intelligence/types";
import type { TwinScenarioInput } from "./schema";

export type TwinRange = "7d" | "30d";
export type TwinRiskType = ActiveRiskSignal["alertType"];
export type TwinRiskLevel = "UNAVAILABLE" | "NONE" | "WARNING" | "CRITICAL";
export type TwinRiskChange = "UNAVAILABLE" | "UNCHANGED" | "INCREASED" | "DECREASED";
export type TwinValueBasis = "OBSERVED_BASELINE" | "DIRECTIONAL_TREND" | "USER_ASSUMPTION" | "BASELINE_HELD" | "UNAVAILABLE";

export type TwinHistoryContext = {
  readingCount: number;
  bucketCount: number;
  temperature: { meanC: number | null; minC: number | null; maxC: number | null; sampleCount: number };
  humidity: { meanPercent: number | null; minPercent: number | null; maxPercent: number | null; sampleCount: number };
  feedWeight: { observedDecreaseGrams: number | null; intervalCount: number; increaseIntervalCount: number };
  feedLevel: { observedDecreasePercentagePoints: number | null; intervalCount: number; increaseIntervalCount: number };
  waterLevel: { observedDecreasePercentagePoints: number | null; intervalCount: number; increaseIntervalCount: number };
};

export type DigitalTwinBaseline = {
  status: "READY" | "NO_SELECTION" | "NO_OBSERVATION" | "INPUT_MISMATCH";
  selectedFarm: AnalyticsFarmOption | null;
  device: AnalyticsDeviceOption | null;
  range: { preset: TwinRange | null; start: string | null; end: string | null };
  observedAt: string | null;
  source: LatestIntelligenceObservation["source"] | null;
  observed: LatestIntelligenceObservation | null;
  forecasts: { feed: DepletionForecast | null; water: DepletionForecast | null };
  history: TwinHistoryContext;
  persistedAlerts: ActiveRiskSignal[];
};

export type TwinScenarioBasis = TwinValueBasis;

export type TwinResourceProjection = {
  unit: "%";
  startPercent: number | null;
  startBasis: TwinScenarioBasis;
  dailyDrawdownPercentagePoints: number | null;
  rateBasis: TwinScenarioBasis;
  projectedPercent: number | null;
  changeFromObservedPercentagePoints: number | null;
};

export type TwinEnvironmentalProjection = {
  value: number | null;
  unit: "°C" | "%";
  basis: TwinScenarioBasis;
};

export type TwinRiskProjection = {
  alertType: TwinRiskType;
  title: string;
  level: TwinRiskLevel;
  value: number | null;
  thresholdValue: number | null;
  unit: AlertEvaluation["unit"];
  explanation: string | null;
};

export type TwinRiskComparison = {
  alertType: TwinRiskType;
  title: string;
  baseline: TwinRiskLevel;
  simulated: TwinRiskLevel;
  change: TwinRiskChange;
  baselineValue: number | null;
  simulatedValue: number | null;
  thresholdValue: number | null;
  unit: AlertEvaluation["unit"];
};

export type DigitalTwinSimulation = {
  kind: "SIMULATION";
  input: TwinScenarioInput;
  horizonEnd: string | null;
  feedLevel: TwinResourceProjection;
  waterLevel: TwinResourceProjection;
  temperature: TwinEnvironmentalProjection;
  humidity: TwinEnvironmentalProjection;
  feedWeight: { status: "NOT_SIMULATED"; observedGrams: number | null; explanation: string };
  baselineRisk: TwinRiskProjection[];
  projectedRisk: TwinRiskProjection[];
  riskComparisons: TwinRiskComparison[];
  limitations: string[];
};

export type DigitalTwinInputs = {
  intelligence: IntelligenceResponse;
  analytics: AnalyticsResponse;
};
