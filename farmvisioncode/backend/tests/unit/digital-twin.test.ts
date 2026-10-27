import { describe, expect, it } from "vitest";
import { buildDigitalTwinBaseline } from "@/modules/digital-twin/baseline";
import { twinScenarioSchema } from "@/modules/digital-twin/schema";
import { simulateDigitalTwin } from "@/modules/digital-twin/simulation";
import type { AnalyticsDeviceOption, AnalyticsPoint, AnalyticsResponse } from "@/modules/analytics/types";
import type { DepletionForecast, IntelligenceResponse, LatestIntelligenceObservation } from "@/modules/intelligence/types";

const farm = { id: "farm-1", name: "North field" };
const device: AnalyticsDeviceOption = {
  id: "device-1",
  name: "Barn sensor",
  source: "SIMULATOR",
  isEnabled: true,
  farm,
};
const rangeStart = "2026-10-01T00:00:00.000Z";
const rangeEnd = "2026-10-08T00:00:00.000Z";

function forecast(overrides: Partial<DepletionForecast> = {}): DepletionForecast {
  return {
    status: "ESTIMATED",
    currentLevelPercent: 80,
    dailyDeclinePercentagePoints: 5,
    daysUntilZero: 16,
    estimatedZeroAt: "2026-10-24T00:00:00.000Z",
    asOf: "2026-10-08T00:00:00.000Z",
    calculationStart: "2026-10-01T00:00:00.000Z",
    source: "SIMULATOR",
    sampleCount: 8,
    declineIntervalCount: 5,
    resetIntervalCount: 0,
    coverageHours: 168,
    formulaVersion: "directional-depletion-v1",
    confidence: "NOT_CALIBRATED",
    limitations: ["Uncalibrated directional calculation."],
    ...overrides,
  };
}

function observation(overrides: Partial<LatestIntelligenceObservation> = {}): LatestIntelligenceObservation {
  return {
    observedAt: rangeEnd,
    receivedAt: rangeEnd,
    source: "SIMULATOR",
    temperatureC: 30,
    humidityPercent: 50,
    feedLevelPercent: 80,
    waterLevelPercent: 60,
    feedWeightGrams: 900,
    ...overrides,
  };
}

function analyticsPoint(overrides: Partial<AnalyticsPoint> = {}): AnalyticsPoint {
  return {
    bucketStart: rangeStart,
    temperatureMeanC: null,
    temperatureMinC: null,
    temperatureMaxC: null,
    temperatureSampleCount: 0,
    humidityMeanPercent: null,
    humidityMinPercent: null,
    humidityMaxPercent: null,
    humiditySampleCount: 0,
    feedWeightDecreaseGrams: null,
    feedWeightIntervalCount: 0,
    feedWeightIncreaseIntervalCount: 0,
    feedLevelMeanPercent: null,
    feedLevelDropPercentagePoints: null,
    feedLevelIntervalCount: 0,
    feedLevelIncreaseIntervalCount: 0,
    waterLevelMeanPercent: null,
    waterLevelDropPercentagePoints: null,
    waterLevelIntervalCount: 0,
    waterLevelIncreaseIntervalCount: 0,
    ...overrides,
  };
}

function intelligence(overrides: Partial<IntelligenceResponse> = {}): IntelligenceResponse {
  return {
    generatedAt: rangeEnd,
    range: { preset: "7d", start: rangeStart, end: rangeEnd },
    selectedFarmId: farm.id,
    device,
    farms: [farm],
    devices: [device],
    latestObservation: observation(),
    analysis: {
      feed: {
        level: forecast(),
        observedWeightChange: {
          observedDecreaseGrams: 100,
          sampleCount: 5,
          declineIntervalCount: 2,
          resetIntervalCount: 1,
          firstObservedAt: rangeStart,
          lastObservedAt: rangeEnd,
          source: "SIMULATOR",
          confidence: "NOT_CALIBRATED",
          limitation: "Not confirmed animal intake.",
        },
      },
      water: { level: forecast({ currentLevelPercent: 60, dailyDeclinePercentagePoints: 3 }) },
      risk: { status: "NOT_CONFIGURED", score: null, policyVersion: null, signals: [], explanation: "No risk policy configured." },
      performance: { status: "NOT_CONFIGURED", score: null, policyVersion: null, coveragePercent: 0, explanation: "No performance policy configured." },
      recommendations: [],
    },
    readingCount: 8,
    selectionRequired: false,
    ...overrides,
  };
}

function analytics(overrides: Partial<AnalyticsResponse> = {}): AnalyticsResponse {
  return {
    generatedAt: rangeEnd,
    range: { preset: "7d", start: rangeStart, end: rangeEnd, bucketSeconds: 21_600 },
    selectedFarmId: farm.id,
    device,
    farms: [farm],
    devices: [device],
    points: [analyticsPoint()],
    readingCount: 8,
    selectionRequired: false,
    ...overrides,
  };
}

describe("Digital Twin baseline and simulation", () => {
  it("combines the matching Phase 4 history and Phase 5 observation without merging their units", () => {
    const twinBaseline = buildDigitalTwinBaseline({
      intelligence: intelligence(),
      analytics: analytics({
        points: [
          analyticsPoint({
            temperatureMeanC: 28,
            temperatureMinC: 27,
            temperatureMaxC: 29,
            temperatureSampleCount: 2,
            humidityMeanPercent: 50,
            humidityMinPercent: 48,
            humidityMaxPercent: 52,
            humiditySampleCount: 2,
            feedLevelDropPercentagePoints: 4,
            feedLevelIntervalCount: 2,
            feedLevelIncreaseIntervalCount: 1,
          }),
          analyticsPoint({
            bucketStart: "2026-10-01T06:00:00.000Z",
            temperatureMeanC: 32,
            temperatureMinC: 32,
            temperatureMaxC: 32,
            temperatureSampleCount: 1,
            humidityMeanPercent: 40,
            humidityMinPercent: 40,
            humidityMaxPercent: 40,
            humiditySampleCount: 1,
            feedWeightDecreaseGrams: 100,
            feedWeightIntervalCount: 1,
            waterLevelDropPercentagePoints: 3,
            waterLevelIntervalCount: 1,
          }),
        ],
      }),
    });

    expect(twinBaseline.status).toBe("READY");
    expect(twinBaseline.observed?.feedLevelPercent).toBe(80);
    expect(twinBaseline.observed?.source).toBe("SIMULATOR");
    expect(twinBaseline.forecasts.feed?.dailyDeclinePercentagePoints).toBe(5);
    expect(twinBaseline.history).toMatchObject({
      readingCount: 8,
      bucketCount: 2,
      temperature: { meanC: 29.333333333333332, minC: 27, maxC: 32, sampleCount: 3 },
      humidity: { meanPercent: 46.666666666666664, sampleCount: 3 },
      feedWeight: { observedDecreaseGrams: 100, intervalCount: 1 },
      feedLevel: { observedDecreasePercentagePoints: 4, intervalCount: 2, increaseIntervalCount: 1 },
      waterLevel: { observedDecreasePercentagePoints: 3, intervalCount: 1 },
    });
  });

  it("rejects mismatched analytics/intelligence selections without exposing the other selection's history", () => {
    const otherDevice: AnalyticsDeviceOption = { ...device, id: "device-2", name: "Other barn" };
    const result = buildDigitalTwinBaseline({
      intelligence: intelligence(),
      analytics: analytics({ device: otherDevice, devices: [otherDevice], points: [analyticsPoint({ temperatureMeanC: 35, temperatureSampleCount: 1 })] }),
    });
    expect(result.status).toBe("INPUT_MISMATCH");
    expect(result.device).toBeNull();
    expect(result.history.readingCount).toBe(0);
    expect(result.history.temperature.meanC).toBeNull();
  });

  it("projects from Phase 5 directional rates and holds environment values as assumptions", () => {
    const base = buildDigitalTwinBaseline({ intelligence: intelligence(), analytics: analytics() });
    const before = JSON.stringify(base);
    const result = simulateDigitalTwin(base, twinScenarioSchema.parse({ horizonDays: 2 }));

    expect(result.kind).toBe("SIMULATION");
    expect(result.horizonEnd).toBe("2026-10-10T00:00:00.000Z");
    expect(result.feedLevel).toMatchObject({ startPercent: 80, startBasis: "OBSERVED_BASELINE", dailyDrawdownPercentagePoints: 5, rateBasis: "DIRECTIONAL_TREND", projectedPercent: 70, changeFromObservedPercentagePoints: -10 });
    expect(result.waterLevel.projectedPercent).toBe(54);
    expect(result.temperature).toMatchObject({ value: 30, basis: "BASELINE_HELD", unit: "°C" });
    expect(result.humidity).toMatchObject({ value: 50, basis: "BASELINE_HELD", unit: "%" });
    expect(result.feedWeight).toMatchObject({ status: "NOT_SIMULATED", observedGrams: 900 });
    expect(result.riskComparisons.every(({ change }) => change === "UNCHANGED")).toBe(true);
    expect(JSON.stringify(base)).toBe(before);
  });

  it("uses explicit scenario assumptions, clamps simulated resource levels, and identifies newly projected risk", () => {
    const base = buildDigitalTwinBaseline({ intelligence: intelligence(), analytics: analytics() });
    const result = simulateDigitalTwin(base, twinScenarioSchema.parse({
      horizonDays: 3,
      feedStartLevelAssumptionPercent: 20,
      feedDailyDrawdownAssumptionPercentagePoints: 10,
      waterStartLevelAssumptionPercent: 15,
      waterDailyDrawdownAssumptionPercentagePoints: 10,
      temperatureAtHorizonAssumptionC: 36,
      humidityAtHorizonAssumptionPercent: 90,
    }));

    expect(result.feedLevel).toMatchObject({ startBasis: "USER_ASSUMPTION", rateBasis: "USER_ASSUMPTION", projectedPercent: 0 });
    expect(result.waterLevel.projectedPercent).toBe(0);
    expect(result.temperature).toMatchObject({ value: 36, basis: "USER_ASSUMPTION" });
    expect(result.humidity.value).toBe(90);
    expect(result.projectedRisk.find(({ alertType }) => alertType === "FEED_LOW")?.level).toBe("CRITICAL");
    expect(result.projectedRisk.find(({ alertType }) => alertType === "HIGH_TEMPERATURE")?.level).toBe("CRITICAL");
    expect(result.riskComparisons.find(({ alertType }) => alertType === "FEED_LOW")?.change).toBe("INCREASED");
  });

  it("keeps missing observations and unavailable historical rates missing rather than assuming zero", () => {
    const noObservation = observation({
      temperatureC: null,
      humidityPercent: null,
      feedLevelPercent: null,
      waterLevelPercent: null,
      feedWeightGrams: null,
    });
    const emptyForecast = forecast({ status: "INSUFFICIENT_DATA", currentLevelPercent: null, dailyDeclinePercentagePoints: null });
    const base = buildDigitalTwinBaseline({
      intelligence: intelligence({
        latestObservation: noObservation,
        analysis: { ...intelligence().analysis!, feed: { ...intelligence().analysis!.feed, level: emptyForecast }, water: { level: emptyForecast } },
      }),
      analytics: analytics({ readingCount: 0, points: [] }),
    });
    const result = simulateDigitalTwin(base, twinScenarioSchema.parse({ horizonDays: 7 }));

    expect(base.status).toBe("READY");
    expect(result.feedLevel.projectedPercent).toBeNull();
    expect(result.waterLevel.projectedPercent).toBeNull();
    expect(result.temperature.value).toBeNull();
    expect(result.baselineRisk.every(({ level }) => level === "UNAVAILABLE")).toBe(true);
    expect(result.projectedRisk.every(({ level }) => level === "UNAVAILABLE")).toBe(true);
  });

  it("allows an assumption-driven simulation without an observed baseline but keeps comparisons unavailable", () => {
    const base = buildDigitalTwinBaseline({
      intelligence: intelligence({ latestObservation: null }),
      analytics: analytics({ readingCount: 0, points: [] }),
    });
    const result = simulateDigitalTwin(base, twinScenarioSchema.parse({
      horizonDays: 5,
      feedStartLevelAssumptionPercent: 40,
      feedDailyDrawdownAssumptionPercentagePoints: 4,
      waterStartLevelAssumptionPercent: 60,
      waterDailyDrawdownAssumptionPercentagePoints: 2,
      temperatureAtHorizonAssumptionC: 37,
    }));

    expect(base.status).toBe("NO_OBSERVATION");
    expect(result.feedLevel.projectedPercent).toBe(20);
    expect(result.feedLevel.startBasis).toBe("USER_ASSUMPTION");
    expect(result.temperature.value).toBe(37);
    expect(result.baselineRisk.find(({ alertType }) => alertType === "HIGH_TEMPERATURE")?.level).toBe("UNAVAILABLE");
    expect(result.riskComparisons.find(({ alertType }) => alertType === "HIGH_TEMPERATURE")?.change).toBe("UNAVAILABLE");
  });

  it("does not infer a rate from reset-affected Phase 5 forecasts", () => {
    const base = buildDigitalTwinBaseline({
      intelligence: intelligence({
        analysis: { ...intelligence().analysis!, feed: { ...intelligence().analysis!.feed, level: forecast({ status: "RESET_AFFECTED" }) } },
      }),
      analytics: analytics(),
    });
    const result = simulateDigitalTwin(base, twinScenarioSchema.parse({ horizonDays: 2 }));
    expect(result.feedLevel.dailyDrawdownPercentagePoints).toBeNull();
    expect(result.feedLevel.rateBasis).toBe("UNAVAILABLE");
    expect(result.feedLevel.projectedPercent).toBeNull();
  });

  it("rejects out-of-range assumptions and unknown scenario properties", () => {
    expect(twinScenarioSchema.safeParse({ horizonDays: 31 }).success).toBe(false);
    expect(twinScenarioSchema.safeParse({ feedStartLevelAssumptionPercent: 101 }).success).toBe(false);
    expect(twinScenarioSchema.safeParse({ temperatureAtHorizonAssumptionC: 86 }).success).toBe(false);
    expect(twinScenarioSchema.safeParse({ humidityAtHorizonAssumptionPercent: 101 }).success).toBe(false);
    expect(twinScenarioSchema.safeParse({ inventedRiskScore: 99 }).success).toBe(false);
  });
});
