import "server-only";
import { FarmVisionRole } from "../../generated/prisma/enums";
import { getPrismaClient } from "../../server/db/prisma";
import { aggregateReadings } from "./aggregation";
import { resolveAnalyticsRange } from "./range";
import type { AnalyticsQuery } from "./schema";

const MAX_READINGS_PER_QUERY = 20_000;

export class AnalyticsRoleRequiredError extends Error {
  constructor() {
    super("A Farmer role is required to view historical analytics.");
    this.name = "AnalyticsRoleRequiredError";
  }
}

export class AnalyticsNotFoundError extends Error {
  constructor() {
    super("The requested farm or device is not available to this account.");
    this.name = "AnalyticsNotFoundError";
  }
}

export class AnalyticsDensityError extends Error {
  constructor() {
    super("This device has more than 20,000 readings in the selected range. Choose a shorter range.");
    this.name = "AnalyticsDensityError";
  }
}

async function requireFarmerRole(ownerId: string) {
  const assignment = await getPrismaClient().userRole.findUnique({
    where: { userId_role: { userId: ownerId, role: FarmVisionRole.FARMER } },
    select: { userId: true },
  });
  if (!assignment) throw new AnalyticsRoleRequiredError();
}

export async function listAnalyticsChoicesForOwner(ownerId: string) {
  await requireFarmerRole(ownerId);
  const db = getPrismaClient();
  const [farms, devices] = await Promise.all([
    db.farm.findMany({
      where: { ownerId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.device.findMany({
      where: { farm: { ownerId } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        source: true,
        isEnabled: true,
        farm: { select: { id: true, name: true } },
      },
    }),
  ]);
  return { farms, devices };
}

export async function getHistoricalAnalyticsForOwner(
  ownerId: string,
  query: AnalyticsQuery,
  now = new Date(),
) {
  const range = resolveAnalyticsRange(query, now);
  const choices = await listAnalyticsChoicesForOwner(ownerId);

  if (query.farmId && !choices.farms.some((farm) => farm.id === query.farmId)) {
    throw new AnalyticsNotFoundError();
  }

  const devicesForFarm = query.farmId
    ? choices.devices.filter((device) => device.farm.id === query.farmId)
    : choices.devices;
  const device = query.deviceId
    ? devicesForFarm.find((candidate) => candidate.id === query.deviceId) ?? null
    : null;
  if (query.deviceId && !device) throw new AnalyticsNotFoundError();

  const common = {
    generatedAt: now.toISOString(),
    range: {
      preset: range.preset,
      start: range.start.toISOString(),
      end: range.end.toISOString(),
      bucketSeconds: range.bucketSeconds,
    },
    selectedFarmId: query.farmId ?? device?.farm.id ?? null,
    device,
    farms: choices.farms,
    devices: choices.devices,
  };

  if (!device) {
    return {
      ...common,
      points: [],
      readingCount: 0,
      selectionRequired: choices.devices.length > 0,
    };
  }

  const readings = await getPrismaClient().sensorReading.findMany({
    where: {
      deviceId: device.id,
      observedAt: { gte: range.start, lt: range.end },
    },
    orderBy: [{ observedAt: "asc" }, { receivedAt: "asc" }, { id: "asc" }],
    take: MAX_READINGS_PER_QUERY + 1,
    select: {
      id: true,
      observedAt: true,
      receivedAt: true,
      temperatureC: true,
      humidityPercent: true,
      feedLevelPercent: true,
      waterLevelPercent: true,
      feedWeightGrams: true,
    },
  });

  if (readings.length > MAX_READINGS_PER_QUERY) throw new AnalyticsDensityError();

  return {
    ...common,
    points: aggregateReadings(readings, range),
    readingCount: readings.length,
    selectionRequired: false,
  };
}
