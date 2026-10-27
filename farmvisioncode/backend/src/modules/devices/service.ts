import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { FarmVisionRole } from "../../generated/prisma/enums";
import { getPrismaClient } from "../../server/db/prisma";
import type { RegisterDeviceInput } from "../telemetry/schema";

export class DeviceAccessError extends Error {
  constructor(message = "The requested farm or device is not available to this account.") {
    super(message);
    this.name = "DeviceAccessError";
  }
}

export class DeviceCredentialError extends Error {
  constructor() {
    super("Device credentials are invalid or the device is disabled.");
    this.name = "DeviceCredentialError";
  }
}

export function hashDeviceToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function listDevicesForOwner(ownerId: string) {
  const db = getPrismaClient();
  const farmRole = await db.userRole.findFirst({
    where: {
      userId: ownerId,
      role: { in: [FarmVisionRole.FARMER, FarmVisionRole.ADMINISTRATOR] },
    },
    select: { userId: true },
  });
  if (!farmRole) throw new DeviceAccessError("A Farmer role is required to manage devices.");

  return db.device.findMany({
    where: { farm: { ownerId } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      publicId: true,
      name: true,
      source: true,
      isEnabled: true,
      createdAt: true,
      lastSeenAt: true,
      farm: { select: { id: true, name: true } },
      latestState: {
        select: {
          observedAt: true,
          source: true,
          temperatureC: true,
          humidityPercent: true,
          feedLevelPercent: true,
          waterLevelPercent: true,
          feedWeightGrams: true,
        },
      },
    },
  });
}

export async function registerDeviceForOwner(ownerId: string, input: RegisterDeviceInput) {
  const db = getPrismaClient();
  const token = randomBytes(32).toString("base64url");
  const publicId = `fv_${randomBytes(12).toString("base64url")}`;

  const device = await db.$transaction(async (tx) => {
    const farmRole = await tx.userRole.findFirst({
      where: {
        userId: ownerId,
        role: { in: [FarmVisionRole.FARMER, FarmVisionRole.ADMINISTRATOR] },
      },
      select: { userId: true },
    });
    if (!farmRole) throw new DeviceAccessError("A Farmer role is required to register devices.");

    const farm = await tx.farm.findFirst({
      where: { id: input.farmId, ownerId },
      select: { id: true },
    });
    if (!farm) throw new DeviceAccessError();

    return tx.device.create({
      data: {
        farmId: farm.id,
        publicId,
        name: input.name,
        credentialHash: hashDeviceToken(token),
        source: input.source,
      },
      select: {
        id: true,
        publicId: true,
        name: true,
        source: true,
        isEnabled: true,
        createdAt: true,
        farm: { select: { id: true, name: true } },
      },
    });
  });

  return { device, token };
}

export async function revokeDeviceForOwner(ownerId: string, deviceRecordId: string) {
  const db = getPrismaClient();
  const farmRole = await db.userRole.findFirst({
    where: {
      userId: ownerId,
      role: { in: [FarmVisionRole.FARMER, FarmVisionRole.ADMINISTRATOR] },
    },
    select: { userId: true },
  });
  if (!farmRole) throw new DeviceAccessError("A Farmer role is required to manage devices.");

  const result = await db.device.updateMany({
    where: { id: deviceRecordId, farm: { ownerId }, isEnabled: true },
    data: { isEnabled: false },
  });
  return result.count === 1;
}
