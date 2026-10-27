export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const farmId = searchParams.get("farmId") || "";
    const deviceId = searchParams.get("deviceId") || "";

    const response = {
      farms: [
        {
          id: "farm-1",
          name: "Main Farm",
          devices: [
            {
              id: "device-1",
              name: "Greenhouse Sensor",
              source: "HARDWARE",
              isEnabled: true,
            },
          ],
        },
      ],
      devices: [
        {
          id: "device-1",
          name: "Greenhouse Sensor",
          farmId: "farm-1",
          farmName: "Main Farm",
          source: "HARDWARE",
          isEnabled: true,
          depletionForecast: {
            status: "ESTIMATED",
            currentLevelPercent: 65.5,
            dailyDeclinePercentagePoints: -2.3,
            estimatedZeroAt: new Date(Date.now() + 7776000000).toISOString(),
            daysUntilZero: 10.5,
            sampleCount: 245,
            declineIntervalCount: 12,
            coverageHours: 168,
            asOf: new Date().toISOString(),
          },
          analysis: {
            feed: {
              observedWeightChange: {
                observedDecreaseGrams: 150.3,
                sampleCount: 245,
                declineIntervalCount: 12,
                resetIntervalCount: 3,
                limitation: "Feed weight and feed-level percentage remain separate measurements; not verified animal intake",
              },
              performance: {
                score: 72,
                explanation:
                  "Moderate performance based on historical feed consumption patterns",
              },
            },
            water: {
              currentLevelPercent: 88.2,
              dailyDeclinePercentagePoints: -1.1,
              estimatedZeroAt: null,
              sampleCount: 245,
              declineIntervalCount: 5,
              coverageHours: 168,
              asOf: new Date().toISOString(),
              limitation: "Water level percentages are not litres; not verified consumption",
            },
            risk: {
              explanation:
                "No critical thresholds crossed; one warning for temperature near boundary",
              score: 23,
              policyVersion: "policy-v1",
              signals: [
                {
                  id: "signal-1",
                  title: "Temperature near warning threshold",
                  severity: "WARNING",
                  status: "OPEN",
                  observedValue: 32.5,
                  unit: "°C",
                  thresholdValue: 32,
                  observedAt: new Date(Date.now() - 3600000).toISOString(),
                  provenanceNote: "Hardware-reported",
                  source: "HARDWARE",
                },
              ],
            },
          },
          recommendations: [
            {
              id: "rec-1",
              title: "Feed-level forecast",
              reason:
                "Feed depletion forecast indicates potential 0% crossing in 10 days",
              suggestedAction:
                "Review feed supply and consider early refill to avoid disruption",
              evidence: {
                currentValue: 65.5,
                dailyDeclinePercentagePoints: -2.3,
                sampleCount: 245,
                declineIntervalCount: 12,
              },
              provenance: {
                source: "HARDWARE",
                observedAt: new Date(Date.now() - 86400000).toISOString(),
                formulaVersion: "directional-depletion-v1",
              },
            },
          ],
        },
      ],
    };

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: "Failed to fetch intelligence" }, { status: 500 });
  }
}