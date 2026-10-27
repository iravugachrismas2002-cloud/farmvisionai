export async function GET() {
  try {
    const recommendations = [
      {
        id: "rec-1",
        type: "FEED_CHECK",
        severity: "WARNING",
        status: "PENDING",
        explanation:
          "Feed level has been stable at 85% for over 7 days; consider checking feed supply",
        suggestedAction:
          "Inspect feed storage and verify feed delivery schedule",
        observedValue: 85,
        thresholdValue: 80,
        unit: "%",
        device: {
          id: "device-1",
          publicId: "dev-abc123",
          name: "Greenhouse Sensor",
          source: "HARDWARE",
          farm: { id: "farm-1", name: "Main Farm" },
        },
        ruleVersion: "recommendation-v1",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "rec-2",
        type: "HEAT_RESPONSE",
        severity: "CRITICAL",
        status: "PENDING",
        explanation:
          "Temperature has been consistently above 35°C critical threshold for 3 days",
        suggestedAction:
          "Immediate: Activate cooling systems and monitor temperature trends",
        observedValue: 37.2,
        thresholdValue: 35,
        unit: "°C",
        device: {
          id: "device-1",
          publicId: "dev-abc123",
          name: "Greenhouse Sensor",
          source: "HARDWARE",
          farm: { id: "farm-1", name: "Main Farm" },
        },
        ruleVersion: "recommendation-v1",
        createdAt: new Date().toISOString(),
      },
      {
        id: "rec-3",
        type: "WATER_CHECK",
        severity: "INFO",
        status: "ACKNOWLEDGED",
        explanation:
          "Water level is within normal range; routine check recommended",
        suggestedAction:
          "Continue normal monitoring; no action required at this time",
        observedValue: 90,
        thresholdValue: 80,
        unit: "%",
        device: {
          id: "device-2",
          publicId: "dev-def456",
          name: "Water Level Sensor",
          source: "HARDWARE",
          farm: { id: "farm-1", name: "Main Farm" },
        },
        ruleVersion: "recommendation-v1",
        acknowledgedAt: new Date(Date.now() - 3600000).toISOString(),
        resolvedAt: null,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    return Response.json({ recommendations });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}