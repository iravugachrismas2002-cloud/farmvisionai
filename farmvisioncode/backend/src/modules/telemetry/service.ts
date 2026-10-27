import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getPrismaClient } from "../../server/db/prisma";
import { synchronizeAlertsForTelemetry } from "../alerts/service";
import { DeviceCredentialError, hashDeviceToken } from "../devices/service";
import type { TelemetryPayload } from "./schema";

const FUTURE_CLOCK_TOLERANCE_MS = 5 * 60 * 1000;

function tokenMatches(token: string, storedHash: string): boolean {
  const suppliedHash = Buffer.from(hashDeviceToken(token), "hex");
  const savedHash = Buffer.from(storedHash, "hex");
  return suppliedHash.length === savedHash.length && timingSafeEqual(suppliedHash, savedHash);
}

export class TelemetryTimestampError extends Error {
  constructor() {
    super("The device timestamp is too far in the future.");
    this.name = "TelemetryTimestampError";
  }
}

export async function acceptTelemetry(
  payload: TelemetryPayload,
  token: string,
  now = new Date(),
  options: { demoMode?: boolean } = {},
) {
  const observedAt = new Date(payload.timestamp);
  if (observedAt.getTime() > now.getTime() + FUTURE_CLOCK_TOLERANCE_MS) {
    throw new TelemetryTimestampError();
  }

  const db = getPrismaClient();

  // Demo mode: allow telemetry without device credential validation
  let device: { id: string; source: string; isEnabled: boolean; credentialHash?: string } | null = null;
  if (options.demoMode && options.demoMode === true) {
    device = await db.device.findUnique({
      where: { publicId: payload.deviceId },
      select: { id: true, source: true, isEnabled: true },
    });
    if (!device) {
      throw new DeviceCredentialError();
    }
  } else {
    device = await db.device.findUnique({
      where: { publicId: payload.deviceId },
      select: { id: true, credentialHash: true, source: true, isEnabled: true },
    });
    if (!device || !device.isEnabled || !device.credentialHash || !tokenMatches(token, device.credentialHash)) {
      throw new DeviceCredentialError();
    }
  }

  const readings = {
    temperatureC: payload.temperatureC ?? null,
    humidityPercent: payload.humidityPercent ?? null,
    feedLevelPercent: payload.feedLevelPercent ?? null,
    waterLevelPercent: payload.waterLevelPercent ?? null,
    feedWeightGrams: payload.feedWeightGrams ?? null,
  };
  const receivedAt = now;

  try {
    // Short write transaction: hold the device row lock only for the critical writes.
    // Alert synchronization runs after commit so it never blocks telemetry ingestion.
    const result = await db.$transaction(async (tx) => {
      // Demo mode: allow telemetry without device credential validation
      if (options.demoMode && options.demoMode === true) {
        device = await db.device.findUnique({
          where: { publicId: payload.deviceId },
          select: { id: true, source: true, isEnabled: true },
        });
        if (!device) {
          throw new DeviceCredentialError();
        }
      } else {
        if (!device || !device.isEnabled || !device.credentialHash || !tokenMatches(token, device.credentialHash)) {
          throw new DeviceCredentialError();
        }
      }

      // Serialize work for one device so concurrent telemetry cannot reorder readings.
      await tx.$queryRaw`SELECT "id" FROM "Device" WHERE "id" = ${device.id}::uuid FOR UPDATE`;
      const currentDevice = await tx.device.findUnique({
        where: { id: device.id },
        select: { id: true, isEnabled: true, source: true, credentialHash: true },
      });

      if (
        !currentDevice ||
        !currentDevice.isEnabled ||
        (!options.demoMode || options.demoMode !== true) && (!currentDevice.credentialHash || !tokenMatches(token, currentDevice.credentialHash))
      ) {
        throw new DeviceCredentialError();
      }

      const reading = await tx.sensorReading.create({
        data: {
          deviceId: currentDevice.id,
          messageId: payload.messageId,
          observedAt,
          receivedAt,
          source: currentDevice.source,
          ...readings,
        },
        select: { id: true, messageId: true, observedAt: true, receivedAt: true, source: true },
      });

      const latestStateUpdated = await tx.$executeRaw`
        INSERT INTO "DeviceState" (
          "deviceId", "observedAt", "source", "temperatureC", "humidityPercent",
          "feedLevelPercent", "waterLevelPercent", "feedWeightGrams", "updatedAt"
        ) VALUES (
          ${currentDevice.id}::uuid, ${observedAt}, ${currentDevice.source}::"DeviceSource",
          ${readings.temperatureC}, ${readings.humidityPercent}, ${readings.feedLevelPercent},
          ${readings.waterLevelPercent}, ${readings.feedWeightGrams}, CURRENT_TIMESTAMP
        )
        ON CONFLICT ("deviceId") DO UPDATE SET
          "observedAt" = EXCLUDED."observedAt",
          "source" = EXCLUDED."source",
          "temperatureC" = EXCLUDED."temperatureC",
          "humidityPercent" = EXCLUDED."humidityPercent",
          "feedLevelPercent" = EXCLUDED."feedLevelPercent",
          "waterLevelPercent" = EXCLUDED."waterLevelPercent",
          "feedWeightGrams" = EXCLUDED."feedWeightGrams",
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "DeviceState"."observedAt" <= EXCLUDED."observedAt"
      `;

      await tx.device.updateMany({
        where: {
          id: currentDevice.id,
          OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: receivedAt } }],
        },
        data: { lastSeenAt: receivedAt },
      });

      return { reading, currentDevice, observedAt, receivedAt, readings };
    });

    // Alert synchronization runs outside the transaction so it never blocks telemetry ingestion.
    // Alerts are eventually consistent (typically sub-second delay) but ingestion is not serialized by alert logic.
    void synchronizeAlertsForTelemetry(
      // Use a fresh non-transaction client for alert work.
      getPrismaClient() as unknown as Parameters<typeof synchronizeAlertsForTelemetry>[0],
      result.currentDevice.id,
      result.observedAt,
      result.receivedAt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result.currentDevice as any).source,
      result.readings,
    ).catch((error) => {
      // Alert failures must not fail telemetry ingestion. Log and continue.
      console.error("Alert synchronization failed for telemetry:", error);
    });

    return { duplicate: false, reading: result.reading };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const existing = await db.sensorReading.findUnique({
        where: { deviceId_messageId: { deviceId: device?.id, messageId: payload.messageId } },
        select: { id: true, messageId: true, observedAt: true, receivedAt: true, source: true },
      });
      if (existing) return { duplicate: true, reading: existing };
    }
    throw error;
  }
}
