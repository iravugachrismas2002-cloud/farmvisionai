import { describe, expect, it } from "vitest";
import { scoreFarmPerformance, scoreRiskSignals, type FarmPerformancePolicy, type RiskScoringPolicy } from "@/modules/intelligence/scoring";
import type { ActiveRiskSignal } from "@/modules/intelligence/types";

function signal(severity: ActiveRiskSignal["severity"], id = severity): ActiveRiskSignal {
  return {
    id,
    alertType: "FEED_LOW",
    severity,
    status: "OPEN",
    title: "Feed level",
    observedValue: 10,
    thresholdValue: 10,
    unit: "%",
    observedAt: "2026-10-01T12:00:00.000Z",
    source: "SIMULATOR",
    ruleVersion: null,
    provenanceNote: "Test evidence.",
  };
}

describe("policy-gated risk and farm-performance scoring", () => {
  it("keeps risk scores unrated when no explicit reviewed policy is supplied", () => {
    const result = scoreRiskSignals([signal("CRITICAL")]);
    expect(result).toMatchObject({ status: "NOT_CONFIGURED", score: null, policyVersion: null });
    expect(result.signals).toHaveLength(1);
  });

  it("uses the maximum severity points from an explicitly supplied, versioned risk policy", () => {
    const policy: RiskScoringPolicy = {
      version: "test-policy-v1",
      pointsBySeverity: { INFO: 0, WARNING: 40, CRITICAL: 85 },
    };
    expect(scoreRiskSignals([signal("WARNING"), signal("CRITICAL")], policy)).toMatchObject({
      status: "RATED",
      score: 85,
      policyVersion: "test-policy-v1",
    });
  });

  it("rejects non-monotonic risk severity points", () => {
    expect(() => scoreRiskSignals([signal("WARNING")], {
      version: "invalid-v1",
      pointsBySeverity: { INFO: 0, WARNING: 80, CRITICAL: 40 },
    })).toThrow("monotonic severity points");
  });

  it("keeps farm performance unrated without a configured policy", () => {
    expect(scoreFarmPerformance([{ id: "feed", score: 90 }])).toMatchObject({
      status: "NOT_CONFIGURED",
      score: null,
      policyVersion: null,
      coveragePercent: 0,
    });
  });

  it("reports partial weighted coverage instead of silently treating missing dimensions as zero", () => {
    const policy: FarmPerformancePolicy = {
      version: "test-performance-v1",
      dimensionWeights: { feed: 0.6, water: 0.4 },
      minimumCoveragePercent: 50,
    };
    expect(scoreFarmPerformance([{ id: "feed", score: 80 }, { id: "water", score: null }], policy)).toMatchObject({
      status: "PARTIAL",
      score: 80,
      policyVersion: "test-performance-v1",
      coveragePercent: 60,
    });
  });

  it("withholds performance scores below the policy's minimum evidence coverage", () => {
    const policy: FarmPerformancePolicy = {
      version: "test-performance-v1",
      dimensionWeights: { feed: 0.5, water: 0.5 },
      minimumCoveragePercent: 60,
    };
    expect(scoreFarmPerformance([{ id: "feed", score: null }, { id: "water", score: 40 }], policy)).toMatchObject({
      status: "INSUFFICIENT_COVERAGE",
      score: null,
      coveragePercent: 50,
    });
  });

  it("rejects out-of-range dimension scores", () => {
    const policy: FarmPerformancePolicy = {
      version: "test-performance-v1",
      dimensionWeights: { feed: 1 },
      minimumCoveragePercent: 1,
    };
    expect(() => scoreFarmPerformance([{ id: "feed", score: 120 }], policy)).toThrow("from 0 to 100");
  });
});
