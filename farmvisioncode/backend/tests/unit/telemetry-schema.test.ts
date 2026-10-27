import { describe, expect, it } from "vitest";
import { registerDeviceSchema, telemetryPayloadSchema } from "@/modules/telemetry/schema";

const validTelemetry = {
  schemaVersion: 1,
  deviceId: "fv_AbCdEf123456",
  messageId: "message-0001",
  timestamp: "2026-10-20T10:00:00Z",
  temperatureC: 32,
  humidityPercent: 85,
  feedLevelPercent: 15,
  waterLevelPercent: 20,
  feedWeightGrams: 1200,
};

describe("device registration validation", () => {
  it("accepts an owned-farm reference, non-empty name, and explicit source", () => {
    expect(registerDeviceSchema.safeParse({ farmId: "123e4567-e89b-42d3-a456-426614174000", name: "Feeder 1", source: "HARDWARE" }).success).toBe(true);
  });

  it("rejects malformed farm IDs and unknown source values", () => {
    expect(registerDeviceSchema.safeParse({ farmId: "farm-1", name: "Feeder", source: "UNKNOWN" }).success).toBe(false);
  });
});

describe("telemetry payload validation", () => {
  it("accepts the proposed versioned-by-contract sensor shape with a UTC timestamp", () => {
    expect(telemetryPayloadSchema.safeParse(validTelemetry).success).toBe(true);
  });

  it("requires at least one sensor value", () => {
    const noReadings = {
      schemaVersion: validTelemetry.schemaVersion,
      deviceId: validTelemetry.deviceId,
      messageId: validTelemetry.messageId,
      timestamp: validTelemetry.timestamp,
    };
    expect(telemetryPayloadSchema.safeParse(noReadings).success).toBe(false);
  });

  it("rejects readings outside declared prototype bounds", () => {
    expect(telemetryPayloadSchema.safeParse({ ...validTelemetry, humidityPercent: 101 }).success).toBe(false);
    expect(telemetryPayloadSchema.safeParse({ ...validTelemetry, temperatureC: -41 }).success).toBe(false);
  });

  it("requires explicit timezone information and rejects unexpected fields", () => {
    expect(telemetryPayloadSchema.safeParse({ ...validTelemetry, timestamp: "2026-10-20T10:00:00" }).success).toBe(false);
    expect(telemetryPayloadSchema.safeParse({ ...validTelemetry, command: "open-relay" }).success).toBe(false);
  });

  it("requires a device ID and idempotency message ID", () => {
    expect(telemetryPayloadSchema.safeParse({ ...validTelemetry, deviceId: "other-001" }).success).toBe(false);
    expect(telemetryPayloadSchema.safeParse({ ...validTelemetry, messageId: "" }).success).toBe(false);
    expect(telemetryPayloadSchema.safeParse({ ...validTelemetry, schemaVersion: 2 }).success).toBe(false);
  });
});
