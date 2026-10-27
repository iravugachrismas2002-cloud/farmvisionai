export type AdvisoryRole = "FARMER" | "AGRONOMIST";

export type FarmAdvisorAccessStatus =
  | "PENDING"
  | "ACTIVE"
  | "DECLINED"
  | "REVOKED";

export type FarmAdvisorAccessEventType =
  | "REQUESTED"
  | "APPROVED"
  | "DECLINED"
  | "REVOKED";

export type RecommendationReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "NOT_RECOMMENDED"
  | "ACCEPTED_BY_FARMER"
  | "DECLINED_BY_FARMER";

export type RecommendationReviewAction =
  | "APPROVE"
  | "REQUEST_CHANGES"
  | "NOT_RECOMMENDED"
  | "ACCEPT"
  | "DECLINE";

export type AdvisorySource = "HARDWARE" | "SIMULATOR";

export interface AdvisoryReadingEvidence {
  readingId: string;
  deviceId: string;
  deviceName: string;
  observedAt: string;
  source: AdvisorySource;
  temperatureC: number | null;
  humidityPercent: number | null;
  feedLevelPercent: number | null;
  waterLevelPercent: number | null;
  feedWeightGrams: number | null;
}

export interface AdvisoryRecommendationEvidence {
  recommendationId: string;
  title: string;
  type: "FEED_CHECK" | "WATER_CHECK" | "HEAT_RESPONSE";
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  severity: "INFO" | "WARNING" | "CRITICAL";
  observedValue: number;
  thresholdValue: number;
  unit: string;
  observedAt: string;
  source: AdvisorySource;
  ruleVersion: string;
}

export interface AdvisoryEvidenceSnapshot {
  capturedAt: string;
  readings: AdvisoryReadingEvidence[];
  recommendations: AdvisoryRecommendationEvidence[];
}
