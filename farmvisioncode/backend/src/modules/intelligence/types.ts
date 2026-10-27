import type { AnalyticsDeviceOption, AnalyticsFarmOption } from "../analytics/types";

export type IntelligenceRangePreset = "7d" | "30d";
export type IntelligenceSource = "HARDWARE" | "SIMULATOR";

export type IntelligenceReading = {
  observedAt: Date | string;
  receivedAt: Date | string;
  source: IntelligenceSource;
  temperatureC: number | null;
  humidityPercent: number | null;
  feedLevelPercent: number | null;
  waterLevelPercent: number | null;
  feedWeightGrams: number | null;
};

export type ForecastStatus =
  | "ESTIMATED"
  | "INSUFFICIENT_DATA"
  | "NO_DECLINE"
  | "NO_SUSTAINED_DECLINE"
  | "RESET_AFFECTED"
  | "AT_ZERO";

export type DepletionForecast = {
  status: ForecastStatus;
  currentLevelPercent: number | null;
  dailyDeclinePercentagePoints: number | null;
  daysUntilZero: number | null;
  estimatedZeroAt: string | null;
  asOf: string | null;
  calculationStart: string | null;
  source: IntelligenceSource | null;
  sampleCount: number;
  declineIntervalCount: number;
  resetIntervalCount: number;
  coverageHours: number | null;
  formulaVersion: "directional-depletion-v1";
  confidence: "NOT_CALIBRATED";
  limitations: string[];
};

export type ObservedMassChange = {
  observedDecreaseGrams: number | null;
  sampleCount: number;
  declineIntervalCount: number;
  resetIntervalCount: number;
  firstObservedAt: string | null;
  lastObservedAt: string | null;
  source: IntelligenceSource | null;
  confidence: "NOT_CALIBRATED";
  limitation: string;
};

export type FeedIntelligence = {
  level: DepletionForecast;
  observedWeightChange: ObservedMassChange;
};

export type WaterIntelligence = {
  level: DepletionForecast;
};

export type ActiveRiskSignal = {
  id: string;
  alertType: "FEED_LOW" | "WATER_LOW" | "HIGH_TEMPERATURE";
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED";
  title: string;
  observedValue: number;
  thresholdValue: number;
  unit: string;
  observedAt: string;
  source: IntelligenceSource;
  ruleVersion: null;
  provenanceNote: string;
};

export type RiskAssessment = {
  status: "NOT_CONFIGURED" | "NO_SIGNALS" | "RATED";
  score: number | null;
  policyVersion: string | null;
  signals: ActiveRiskSignal[];
  explanation: string;
};

export type PerformanceDimensionInput = {
  id: string;
  score: number | null;
};

export type FarmPerformanceAssessment = {
  status: "NOT_CONFIGURED" | "INSUFFICIENT_COVERAGE" | "PARTIAL" | "RATED";
  score: number | null;
  policyVersion: string | null;
  coveragePercent: number;
  explanation: string;
};

export type IntelligenceEvidence = {
  metric: "feedLevelPercent" | "waterLevelPercent";
  currentValue: number;
  currentUnit: "%";
  dailyDeclinePercentagePoints: number;
  rateUnit: "percentage points/day";
  observedAt: string;
  source: IntelligenceSource;
  periodStart: string;
  periodEnd: string;
  sampleCount: number;
  declineIntervalCount: number;
  resetIntervalCount: number;
  formulaVersion: DepletionForecast["formulaVersion"];
  confidence: DepletionForecast["confidence"];
  limitations: string[];
};

export type IntelligenceReviewPrompt = {
  id: "FEED_TREND_REVIEW" | "WATER_TREND_REVIEW";
  status: "PROPOSED";
  persisted: false;
  title: string;
  reason: string;
  suggestedAction: string;
  evidence: IntelligenceEvidence;
};

export type IntelligenceAnalysis = {
  feed: FeedIntelligence;
  water: WaterIntelligence;
  risk: RiskAssessment;
  performance: FarmPerformanceAssessment;
  recommendations: IntelligenceReviewPrompt[];
};

export type LatestIntelligenceObservation = {
  observedAt: string;
  receivedAt: string;
  source: IntelligenceSource;
  temperatureC: number | null;
  humidityPercent: number | null;
  feedLevelPercent: number | null;
  waterLevelPercent: number | null;
  feedWeightGrams: number | null;
};

export type IntelligenceResponse = {
  generatedAt: string;
  range: {
    preset: IntelligenceRangePreset;
    start: string;
    end: string;
  };
  selectedFarmId: string | null;
  device: AnalyticsDeviceOption | null;
  farms: AnalyticsFarmOption[];
  devices: AnalyticsDeviceOption[];
  latestObservation: LatestIntelligenceObservation | null;
  analysis: IntelligenceAnalysis | null;
  readingCount: number;
  selectionRequired: boolean;
};
