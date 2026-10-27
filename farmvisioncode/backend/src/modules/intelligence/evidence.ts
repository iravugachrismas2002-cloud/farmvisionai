import type { DepletionForecast, IntelligenceRangePreset, IntelligenceReviewPrompt } from "./types";

const REVIEW_ACTION = "Compare this directional estimate with a direct inspection and the farm's established replenishment plan; do not rely on it as a confirmed refill schedule.";

function buildPrompt(
  resource: "feed" | "water",
  metric: "feedLevelPercent" | "waterLevelPercent",
  forecast: DepletionForecast,
  range: { preset: IntelligenceRangePreset; start: string; end: string },
): IntelligenceReviewPrompt | null {
  if (
    forecast.status !== "ESTIMATED" ||
    forecast.currentLevelPercent === null ||
    forecast.dailyDeclinePercentagePoints === null ||
    forecast.estimatedZeroAt === null ||
    forecast.asOf === null ||
    forecast.calculationStart === null ||
    forecast.source === null
  ) return null;

  const rate = forecast.dailyDeclinePercentagePoints;
  const evidence = {
    metric,
    currentValue: forecast.currentLevelPercent,
    currentUnit: "%" as const,
    dailyDeclinePercentagePoints: rate,
    rateUnit: "percentage points/day" as const,
    observedAt: forecast.asOf,
    source: forecast.source,
    periodStart: forecast.calculationStart,
    periodEnd: forecast.asOf,
    sampleCount: forecast.sampleCount,
    declineIntervalCount: forecast.declineIntervalCount,
    resetIntervalCount: forecast.resetIntervalCount,
    formulaVersion: forecast.formulaVersion,
    confidence: forecast.confidence,
    limitations: [
      ...forecast.limitations,
      `Selected query window: ${range.preset}, ${range.start} through ${range.end}. The calculation uses the current segment from ${forecast.calculationStart} through ${forecast.asOf}.`,
    ],
  };

  return {
    id: resource === "feed" ? "FEED_TREND_REVIEW" : "WATER_TREND_REVIEW",
    status: "PROPOSED",
    persisted: false,
    title: `Review the ${resource} level trend`,
    reason: `The reported ${resource} level was ${forecast.currentLevelPercent.toFixed(1)}% at ${forecast.asOf}. Across ${forecast.sampleCount} observations and ${forecast.coverageHours?.toFixed(1) ?? "an unknown"} hours in the current segment, the median level-change rate across declining and stable intervals was ${rate.toFixed(2)} percentage points/day. A simple extrapolation reaches 0% near ${forecast.estimatedZeroAt}; this estimate is directional and uncalibrated.`,
    suggestedAction: REVIEW_ACTION,
    evidence,
  };
}

export function buildIntelligenceReviewPrompts(input: {
  feed: DepletionForecast;
  water: DepletionForecast;
  range: { preset: IntelligenceRangePreset; start: string; end: string };
}): IntelligenceReviewPrompt[] {
  const prompts = [
    buildPrompt("feed", "feedLevelPercent", input.feed, input.range),
    buildPrompt("water", "waterLevelPercent", input.water, input.range),
  ];
  return prompts.filter((prompt): prompt is IntelligenceReviewPrompt => prompt !== null);
}
