import { NextResponse } from "next/server";

export async function GET() {
  try {
    // In a real implementation, this would query the database
    // for devices owned by the authenticated user
    const devices = [
      {
        id: "device-1",
        publicId: "dev-abc123",
        name: "Greenhouse Sensor",
        source: "HARDWARE",
        isEnabled: true,
        lastSeenAt: new Date().toISOString(),
        farm: {
          id: "farm-1",
          name: "Main Farm",
        },
        latestState: {
          observedAt: new Date().toISOString(),
          source: "HARDWARE",
          temperatureC: 28.5,
          humidityPercent: 72.0,
          feedLevelPercent: 85,
          waterLevelPercent: 90,
          feedWeightGrams: 1200,
        },
      },
      {
        id: "device-2",
        publicId: "dev-def456",
        name: "Water Level Sensor",
        source: "HARDWARE",
        isEnabled: true,
        lastSeenAt: new Date(Date.now() - 3600000).toISOString(),
        farm: {
          id: "farm-1",
          name: "Main Farm",
        },
        latestState: {
          observedAt: new Date(Date.now() - 7200000).toISOString(),
          source: "HARDWARE",
          temperatureC: null,
          humidityPercent: null,
          feedLevelPercent: null,
          waterLevelPercent: 88,
          feedWeightGrams: null,
        },
      },
    ];

    return NextResponse.json({ devices });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 }
    );
  }
}