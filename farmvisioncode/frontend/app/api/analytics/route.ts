export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "24h";

    const response = {
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

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}