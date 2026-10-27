import { NextResponse } from "next/server";

type AnalyticsReading = {
  temperatureC: number | null;
  humidityPercent: number | null;
  feedLevelPercent: number | null;
  waterLevelPercent: number | null;
  observedAt: string;
};

type TemperatureStats = {
  meanC: number | null;
  minC: number | null;
  maxC: number | null;
  sampleCount: number;
};

type HumidityStats = {
  meanPercent: number | null;
  minPercent: number | null;
  maxPercent: number | null;
  sampleCount: number;
};

type FeedLevelStats = {
  observedDecreasePercentagePoints: number | null;
  increaseIntervalCount: number;
  intervalCount: number;
};

type WaterLevelStats = {
  observedDecreasePercentagePoints: number | null;
  increaseIntervalCount: number;
  intervalCount: number;
};

type FeedWeightStats = {
  observedDecreaseGrams: number | null;
  increaseIntervalCount: number;
  intervalCount: number;
};

type AnalyticsResponse = {
  temperature: TemperatureStats;
  humidity: HumidityStats;
  feedLevel: FeedLevelStats;
  waterLevel: WaterLevelStats;
  feedWeight: FeedWeightStats;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "24h";

    // In a real implementation, this would query the database
    // with the specified date range filter
    const response: AnalyticsResponse = {
      temperature: {
        meanC: 26.5,
        minC: 22.1,
        maxC: 32.8,
        sampleCount: 245,
      },
      humidity: {
        meanPercent: 72.3,
        minPercent: 55.0,
        maxPercent: 89.5,
        sampleCount: 245,
      },
      feedLevel: {
        observedDecreasePercentagePoints: 5.2,
        increaseIntervalCount: 3,
        intervalCount: 30,
      },
      waterLevel: {
        observedDecreasePercentagePoints: 8.7,
        increaseIntervalCount: 2,
        intervalCount: 30,
      },
      feedWeight: {
        observedDecreaseGrams: 150.3,
        increaseIntervalCount: 1,
        intervalCount: 30,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}