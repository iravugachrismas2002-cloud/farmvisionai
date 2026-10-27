import type {
  ActiveRiskSignal,
  FarmPerformanceAssessment,
  PerformanceDimensionInput,
  RiskAssessment,
} from "./types";

export type RiskScoringPolicy = {
  version: string;
  pointsBySeverity: { INFO: number; WARNING: number; CRITICAL: number };
};

export type FarmPerformancePolicy = {
  version: string;
  dimensionWeights: Readonly<Record<string, number>>;
  minimumCoveragePercent: number;
};

function validVersion(version: string) {
  return typeof version === "string" && version.trim().length > 0 && version.length <= 64;
}

function validateRiskPolicy(policy: RiskScoringPolicy) {
  const values = [policy.pointsBySeverity.INFO, policy.pointsBySeverity.WARNING, policy.pointsBySeverity.CRITICAL];
  if (
    !validVersion(policy.version) ||
    values.some((value) => !Number.isFinite(value) || value < 0 || value > 100) ||
    values[0] > values[1] ||
    values[1] > values[2]
  ) {
    throw new RangeError("Risk policy must have a version and monotonic severity points from 0 to 100.");
  }
}

export function scoreRiskSignals(
  signals: readonly ActiveRiskSignal[],
  policy?: RiskScoringPolicy,
): RiskAssessment {
  if (!policy) {
    return {
      status: "NOT_CONFIGURED",
      score: null,
      policyVersion: null,
      signals: [...signals],
      explanation: "Risk signals are shown with their source evidence; no reviewed composite risk policy is configured, so no numeric score is produced.",
    };
  }
  validateRiskPolicy(policy);
  if (signals.length === 0) {
    return {
      status: "NO_SIGNALS",
      score: null,
      policyVersion: policy.version,
      signals: [],
      explanation: "No active risk signals were returned for this device; absence of signals is not a proof of safety.",
    };
  }
  const score = Math.max(...signals.map((signal) => policy.pointsBySeverity[signal.severity]));
  return {
    status: "RATED",
    score: Math.round(score),
    policyVersion: policy.version,
    signals: [...signals],
    explanation: "The score uses the explicitly supplied versioned policy and the most severe included signal; it is not an agronomic risk probability.",
  };
}

function validatePerformancePolicy(policy: FarmPerformancePolicy) {
  const weights = Object.values(policy.dimensionWeights);
  if (
    !validVersion(policy.version) ||
    weights.length === 0 ||
    weights.some((weight) => !Number.isFinite(weight) || weight < 0) ||
    weights.reduce((sum, weight) => sum + weight, 0) <= 0 ||
    !Number.isFinite(policy.minimumCoveragePercent) ||
    policy.minimumCoveragePercent < 0 ||
    policy.minimumCoveragePercent > 100
  ) {
    throw new RangeError("Farm-performance policy requires positive total weights and a coverage threshold from 0 to 100.");
  }
}

export function scoreFarmPerformance(
  dimensions: readonly PerformanceDimensionInput[],
  policy?: FarmPerformancePolicy,
): FarmPerformanceAssessment {
  if (!policy) {
    return {
      status: "NOT_CONFIGURED",
      score: null,
      policyVersion: null,
      coveragePercent: 0,
      explanation: "Farm-performance dimensions and validated weights are not configured; one device's telemetry is not sufficient to rate a whole farm.",
    };
  }
  validatePerformancePolicy(policy);

  const scores = new Map<string, number | null>();
  for (const dimension of dimensions) {
    if (scores.has(dimension.id)) throw new RangeError("Performance dimension ids must be unique.");
    if (dimension.score !== null && (!Number.isFinite(dimension.score) || dimension.score < 0 || dimension.score > 100)) {
      throw new RangeError("Performance dimension scores must be null or from 0 to 100.");
    }
    scores.set(dimension.id, dimension.score);
  }

  const configuredWeight = Object.values(policy.dimensionWeights).reduce((sum, weight) => sum + weight, 0);
  let availableWeight = 0;
  let weightedScore = 0;
  for (const [id, weight] of Object.entries(policy.dimensionWeights)) {
    const score = scores.get(id);
    if (score === undefined || score === null) continue;
    availableWeight += weight;
    weightedScore += score * weight;
  }

  const coveragePercent = (availableWeight / configuredWeight) * 100;
  if (availableWeight === 0 || coveragePercent < policy.minimumCoveragePercent) {
    return {
      status: "INSUFFICIENT_COVERAGE",
      score: null,
      policyVersion: policy.version,
      coveragePercent,
      explanation: "Available dimensions do not meet the policy's minimum evidence coverage; no composite performance score is produced.",
    };
  }
  return {
    status: coveragePercent < 100 ? "PARTIAL" : "RATED",
    score: Math.round(weightedScore / availableWeight),
    policyVersion: policy.version,
    coveragePercent,
    explanation: "The score is a weighted summary under the explicitly supplied versioned policy; it is not a universal farm-quality rating.",
  };
}
