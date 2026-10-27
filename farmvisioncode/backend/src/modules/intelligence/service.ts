import "server-only";
import { getPrismaClient } from "../../server/db/prisma";
import { listAnalyticsChoicesForOwner } from "../analytics/service";
import { resolveAnalyticsRange } from "../analytics/range";
import { buildIntelligenceReviewPrompts } from "./evidence";
import { evaluateFeedIntelligence } from "./feed-engine";
import { scoreFarmPerformance, scoreRiskSignals } from "./scoring";
import { evaluateWaterIntelligence } from "./water-engine";
import type { IntelligenceQuery } from "./schema";
import type { ActiveRiskSignal, IntelligenceReading, IntelligenceResponse, LatestIntelligenceObservation } from "./types";

const MAX_READINGS_PER_QUERY = 20_000;

export class IntelligenceNotFoundError extends Error {
  constructor() {
    super("The requested farm or device is not available to this account.");
    this.name = "IntelligenceNotFoundError";
  }
}

export class IntelligenceDensityError extends Error {
  constructor() {
    super("This device has more than 20,000 readings in the selected period. Choose a shorter range.");
    this.name = "IntelligenceDensityError";
  }
}

export async function getIntelligenceForOwner(
  ownerId: string,
  query: IntelligenceQuery,
  now = new Date(),
): Promise<IntelligenceResponse> {
  const range = resolveAnalyticsRange({ range: query.range }, now);
  const choices = await listAnalyticsChoicesForOwner(ownerId);

  if (query.farmId && !choices.farms.some((farm) => farm.id === query.farmId)) {
    throw new IntelligenceNotFoundError();
  }

  const devicesForFarm = query.farmId
    ? choices.devices.filter((device) => device.farm.id === query.farmId)
    : choices.devices;
  const device = query.deviceId
    ? devicesForFarm.find((candidate) => candidate.id === query.deviceId) ?? null
    : null;
  if (query.deviceId && !device) throw new IntelligenceNotFoundError();

  const common = {
    generatedAt: now.toISOString(),
    range: { preset: range.preset as IntelligenceQuery["range"], start: range.start.toISOString(), end: range.end.toISOString() },
    selectedFarmId: query.farmId ?? device?.farm.id ?? null,
    device,
    farms: choices.farms,
    devices: choices.devices,
    latestObservation: null,
  };

  if (!device) {
    return {
      ...common,
      analysis: null,
      readingCount: 0,
      selectionRequired: choices.devices.length > 0,
    };
  }

  const db = getPrismaClient();
  const readings = await db.sensorReading.findMany({
    where: { deviceId: device.id, observedAt: { gte: range.start, lt: range.end } },
    orderBy: [{ observedAt: "asc" }, { receivedAt: "asc" }, { id: "asc" }],
    take: MAX_READINGS_PER_QUERY + 1,
    select: {
      observedAt: true,
      receivedAt: true,
      source: true,
      temperatureC: true,
      humidityPercent: true,
      feedLevelPercent: true,
      waterLevelPercent: true,
      feedWeightGrams: true,
    },
  });
  if (readings.length > MAX_READINGS_PER_QUERY) throw new IntelligenceDensityError();

  const intelligenceReadings: IntelligenceReading[] = readings;
  const latestReading = readings.at(-1);
  const latestObservation: LatestIntelligenceObservation | null = latestReading
    ? {
        observedAt: latestReading.observedAt.toISOString(),
        receivedAt: latestReading.receivedAt.toISOString(),
        source: latestReading.source,
        temperatureC: latestReading.temperatureC,
        humidityPercent: latestReading.humidityPercent,
        feedLevelPercent: latestReading.feedLevelPercent,
        waterLevelPercent: latestReading.waterLevelPercent,
        feedWeightGrams: latestReading.feedWeightGrams,
      }
    : null;
  const feed = evaluateFeedIntelligence(intelligenceReadings);
  const water = evaluateWaterIntelligence(intelligenceReadings);
  const persistedAlerts = await db.alert.findMany({
    where: { deviceId: device.id, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    orderBy: [{ lastTriggeredAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      type: true,
      severity: true,
      status: true,
      title: true,
      observedValue: true,
      thresholdValue: true,
      unit: true,
      lastTriggeredAt: true,
    },
  });
  const riskSignals: ActiveRiskSignal[] = [];
  for (const alert of persistedAlerts) {
    if (alert.status === "RESOLVED") continue;
    riskSignals.push({
      id: alert.id,
      alertType: alert.type,
      severity: alert.severity,
      status: alert.status,
      title: alert.title,
      observedValue: alert.observedValue,
      thresholdValue: alert.thresholdValue,
      unit: alert.unit,
      observedAt: alert.lastTriggeredAt.toISOString(),
      source: device.source,
      ruleVersion: null,
      provenanceNote: "This signal is from the persisted Phase 3 alert. The originating rule version is not currently stored on Alert.",
    });
  }
  const rangeMetadata = {
    preset: range.preset as IntelligenceQuery["range"],
    start: range.start.toISOString(),
    end: range.end.toISOString(),
  };

  return {
    ...common,
    latestObservation,
    analysis: {
      feed,
      water,
      risk: scoreRiskSignals(riskSignals),
      performance: scoreFarmPerformance([]),
      recommendations: buildIntelligenceReviewPrompts({
        feed: feed.level,
        water: water.level,
        range: rangeMetadata,
      }),
    },
    readingCount: readings.length,
    selectionRequired: false,
  };
}
