import { NextResponse } from "next/server";

type AlertEventItem = {
  id: string;
  eventType: "TRIGGERED" | "ACKNOWLEDGED" | "RESOLVED" | "ESCALATED" | "SEVERITY_CHANGED";
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  observedValue: number | null;
  thresholdValue: number | null;
  unit: string | null;
  createdAt: string;
  actor: { name: string | null; email: string | null } | null;
};

type Device = {
  id: string;
  publicId: string;
  name: string;
  source: "HARDWARE" | "SIMULATOR";
  farm: { id: string; name: string };
};

type AlertItem = {
  id: string;
  type: "FEED_LOW" | "WATER_LOW" | "HIGH_TEMPERATURE";
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  title: string;
  reason: string;
  suggestedAction: string;
  observedValue: number;
  thresholdValue: number;
  unit: string;
  firstTriggeredAt: string;
  lastTriggeredAt: string;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  device: Device;
  events: AlertEventItem[];
};

export async function GET() {
  try {
    const alerts: AlertItem[] = [
      {
        id: "alert-1",
        type: "HIGH_TEMPERATURE",
        severity: "WARNING",
        status: "OPEN",
        title: "High Temperature Detected",
        reason: "Temperature rose above 30°C threshold",
        suggestedAction: "Check greenhouse ventilation and cooling systems",
        observedValue: 32.5,
        thresholdValue: 30,
        unit: "°C",
        firstTriggeredAt: new Date(Date.now() - 7200000).toISOString(),
        lastTriggeredAt: new Date().toISOString(),
        acknowledgedAt: null,
        resolvedAt: null,
        device: {
          id: "device-1",
          publicId: "dev-abc123",
          name: "Greenhouse Sensor",
          source: "HARDWARE",
          farm: { id: "farm-1", name: "Main Farm" },
        },
        events: [
          {
            id: "evt-1",
            eventType: "TRIGGERED",
            severity: "WARNING",
            message: "Temperature 32.5°C exceeds 30°C threshold",
            observedValue: 32.5,
            thresholdValue: 30,
            unit: "°C",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            actor: null,
          },
        ],
      },
      {
        id: "alert-2",
        type: "WATER_LOW",
        severity: "INFO",
        status: "ACKNOWLEDGED",
        title: "Low Water Level",
        reason: "Water level dropped below 20% threshold",
        suggestedAction: "Refill water tank",
        observedValue: 15,
        thresholdValue: 20,
        unit: "%",
        firstTriggeredAt: new Date(Date.now() - 14400000).toISOString(),
        lastTriggeredAt: new Date(Date.now() - 7200000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 3600000).toISOString(),
        resolvedAt: null,
        device: {
          id: "device-2",
          publicId: "dev-def456",
          name: "Water Level Sensor",
          source: "HARDWARE",
          farm: { id: "farm-1", name: "Main Farm" },
        },
        events: [
          {
            id: "evt-2",
            eventType: "TRIGGERED",
            severity: "INFO",
            message: "Water level 15% below 20% threshold",
            observedValue: 15,
            thresholdValue: 20,
            unit: "%",
            createdAt: new Date(Date.now() - 14400000).toISOString(),
            actor: null,
          },
          {
            id: "evt-3",
            eventType: "ACKNOWLEDGED",
            severity: "INFO",
            message: "Alert acknowledged by farmer",
            observedValue: 15,
            thresholdValue: 20,
            unit: "%",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            actor: { name: "Chris Iravuga", email: "chrisirav537@gmail.com" },
          },
        ],
      },
    ];

    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}