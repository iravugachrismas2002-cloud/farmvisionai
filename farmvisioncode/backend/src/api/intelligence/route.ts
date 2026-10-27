import { NextResponse } from "next/server";

type DepletionStatus =
  | "ESTIMATED"
  | "INSUFFICIENT_DATA"
  | "NO_DECLINE"
  | "NO_SUSTAINED_DECLINE"
  | "RESET_AFFECTED"
  | "AT_ZERO";

type FeedAnalysis = {
  observedWeightChange: {
    observedDecreaseGrams: number | null;
    sampleCount: number;
    declineIntervalCount: number;
    resetIntervalCount: number;
    limitation: string;
  };
  performance: {
    score: number | null;
    explanation: string;
  };
};

type WaterAnalysis = {
  currentLevelPercent: number | null;
  dailyDeclinePercentagePoints: number | null;
  estimatedZeroAt: string | null;
  sampleCount: number;
  declineIntervalCount: number;
  coverageHours: number | null;
  asOf: string;
  limitation: string;
};

type RiskAnalysis = {
  explanation: string;
  score: number | null;
  policyVersion: string | null;
  signals?: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    observedValue: number;
    unit: string;
    thresholdValue: number;
    observedAt: string;
    provenanceNote: string;
    source: string;
  }>;
};

type IntelligenceResponse = {
  farms: Array<{
    id: string;
    name: string;
    devices: Array<{
      id: string;
      name: string;
      source: "HARDWARE" | "SIMULATOR";
      isEnabled: boolean;
    }>;
  }>;
  devices: Array<{
    id: string;
    name: string;
    farmId: string;
    farmName: string;
    source: "HARDWARE" | "SIMULATOR";
    isEnabled: boolean;
    depletionForecast: {
      status: DepletionStatus;
      currentLevelPercent: number | null;
      dailyDeclinePercentagePoints: number | null;
      estimatedZeroAt: string | null;
      daysUntilZero: number | null;
      sampleCount: number;
      declineIntervalCount: number;
      coverageHours: number | null;
      asOf: string;
    };
    analysis: {
      feed: FeedAnalysis;
      water: WaterAnalysis;
      risk: RiskAnalysis;
    };
    recommendations: Array<{
      id: string;
      title: string;
      reason: string;
      suggestedAction: string;
      evidence: {
        currentValue: number;
        dailyDeclinePercentagePoints: number;
        sampleCount: number;
        declineIntervalCount: number;
      };
      provenance: {
        source: "SIMULATOR" | "HARDWARE";
        observedAt: string;
        formulaVersion: string;
      };
    }>;
  }>;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const farmId = searchParams.get("farmId") || "";
    const deviceId = searchParams.get("deviceId") || "";

    // In a real implementation, this would query the database
    // with proper scoping through farm ownership

    const response: IntelligenceResponse = {
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

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch intelligence" },
      { status: 500 }
    );
  }
}