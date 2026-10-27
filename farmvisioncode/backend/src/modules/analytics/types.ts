export type AnalyticsRangePreset = "24h" | "7d" | "30d" | "custom";

export type AnalyticsFarmOption = {
  id: string;
  name: string;
};

export type AnalyticsDeviceOption = {
  id: string;
  name: string;
  source: "HARDWARE" | "SIMULATOR";
  isEnabled: boolean;
  farm: AnalyticsFarmOption;
};

export type AnalyticsPoint = {
  bucketStart: string;
  temperatureMeanC: number | null;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  temperatureSampleCount: number;
  humidityMeanPercent: number | null;
  humidityMinPercent: number | null;
  humidityMaxPercent: number | null;
  humiditySampleCount: number;
  feedWeightDecreaseGrams: number | null;
  feedWeightIntervalCount: number;
  feedWeightIncreaseIntervalCount: number;
  feedLevelMeanPercent: number | null;
  feedLevelDropPercentagePoints: number | null;
  feedLevelIntervalCount: number;
  feedLevelIncreaseIntervalCount: number;
  waterLevelMeanPercent: number | null;
  waterLevelDropPercentagePoints: number | null;
  waterLevelIntervalCount: number;
  waterLevelIncreaseIntervalCount: number;
};

export type AnalyticsResponse = {
  generatedAt: string;
  range: {
    preset: AnalyticsRangePreset;
    start: string;
    end: string;
    bucketSeconds: number;
  };
  selectedFarmId: string | null;
  device: AnalyticsDeviceOption | null;
  farms: AnalyticsFarmOption[];
  devices: AnalyticsDeviceOption[];
  points: AnalyticsPoint[];
  readingCount: number;
  selectionRequired: boolean;
};
