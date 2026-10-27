"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

type Recommendation = {
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
};

type DeviceDetail = {
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
  recommendations: Recommendation[];
};

type FarmDetail = {
  id: string;
  name: string;
  devices: Array<{
    id: string;
    name: string;
    source: "HARDWARE" | "SIMULATOR";
    isEnabled: boolean;
  }>;
};

type IntelligenceResponse = {
  farms: FarmDetail[];
  devices: DeviceDetail[];
};

export default function IntelligencePage() {
  const [intelligence, setIntelligence] = useState<IntelligenceResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    async function fetchIntelligence() {
      try {
        const res = await fetch("/api/intelligence", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load intelligence");
        const data = await res.json() as IntelligenceResponse;
        setIntelligence(data);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    }

    fetchIntelligence();
  }, []);

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">INTELLIGENCE</p>
          <h1>Insights & Forecasts</h1>
          <p>Loading intelligence data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
          <Link href="/login" className="primary-button">Back to Login</Link>
        </div>
      </main>
    );
  }

  if (!intelligence || intelligence.devices.length === 0) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="text-slate-600">
            No devices found. Register a device to view its intelligence.
          </p>
          <Link
            href="/devices"
            className="primary-button"
          >
            Register Device
          </Link>
        </div>
      </main>
    );
  }

  const device = intelligence.devices[0];
  const farm = intelligence.farms.find((f) => f.id === device.farmId);

  return (
    <main className="auth-page">
      <nav className="site-nav" aria-label="Main navigation">
        <button
          className="mobile-menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setNavOpen((prev) => !prev)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FarmVision<span className="brand-ai"> AI</span></span>
        </Link>
        <div className={`nav-actions ${navOpen ? "open" : ""}`}>
          <Link className="primary-button" href="/">
            <span className="brand-mark" aria-hidden="true">F</span>
            <span>FarmVision AI</span>
          </Link>
          <Link className="nav-login" href="/logout">Sign out</Link>
        </div>
      </nav>

      <section className="intelligence-page">
        <div className="dashboard-header">
          <h1>Intelligence & Forecasts</h1>
          <p className="eyebrow">AI-powered insights and depletion forecasts</p>
        </div>

        <div className="intelligence-card">
          <div className="card-header">
            <h2>
              {farm?.name} · {device.name}
            </h2>
            <span className="device-source">
              {device.source === "HARDWARE" ? "Hardware" : "Simulator"}
            </span>
          </div>

          <div className="forecast-status">
            <h3>Depletion Forecast</h3>
            <p>
              Status:{" "}
              <span
                className={
                  device.depletionForecast.status === "ESTIMATED"
                    ? "status-estimated"
                    : device.depletionForecast.status === "INSUFFICIENT_DATA"
                    ? "status-insufficient"
                    : device.depletionForecast.status === "NO_DECLINE"
                    ? "status-no-decline"
                    : device.depletionForecast.status === "NO_SUSTAINED_DECLINE"
                    ? "status-no-sustained"
                    : device.depletionForecast.status === "RESET_AFFECTED"
                    ? "status-reset"
                    : "status-at-zero"
                }>
                {device.depletionForecast.status}
              </span>
            </p>
            <p>
              Current level:{" "}
              {device.depletionForecast.currentLevelPercent !== null
                ? `${device.depletionForecast.currentLevelPercent.toFixed(
                    1,
                  )}%`
                : "Not available"}
            </p>
            <p>
              Decline rate:{" "}
              {device.depletionForecast.dailyDeclinePercentagePoints !== null
                ? `${device.depletionForecast.dailyDeclinePercentagePoints.toFixed(
                    2,
                  )} percentage points/day`
                : "Not available"}
            </p>
            {device.depletionForecast.estimatedZeroAt &&
            device.depletionForecast.status === "ESTIMATED" && (
              <p>
                Estimated 0% crossing:{" "}
                {new Date(
                  device.depletionForecast.estimatedZeroAt,
                ).toLocaleDateString()}
              </p>
            )}
            <p>
              Samples:{" "}
              {device.depletionForecast.sampleCount.toLocaleString()}
            </p>
            <p>
              Declining intervals:{" "}
              {device.depletionForecast.declineIntervalCount}
            </p>
            <p>
              Coverage:{" "}
              {device.depletionForecast.coverageHours !== null
                ? `${device.depletionForecast.coverageHours.toFixed(
                    1,
                  )} hours`
                : "No data"}
            </p>
          </div>

          <div className="analysis-summary">
            <h3>Feed Analysis</h3>
            <p>
              Observed weight change:{" "}
              {device.analysis?.feed?.observedWeightChange?.observedDecreaseGrams !==
                null
                ? `${device.analysis?.feed?.observedWeightChange.observedDecreaseGrams.toFixed(
                    1,
                  )} g`
                : "Not available"}
            </p>
            <p>
              Samples:{" "}
              {device.analysis?.feed?.observedWeightChange.sampleCount}
            </p>
            <p>
              Decline intervals:{" "}
              {device.analysis?.feed?.observedWeightChange.declineIntervalCount}
            </p>
            <p className="limitation">
              {device.analysis?.feed?.observedWeightChange?.limitation}
            </p>
            <p>
              Performance score:{" "}
              {device.analysis?.feed?.performance.score !== null
                ? `${device.analysis?.feed?.performance.score}/100`
                : "Not rated"}
            </p>
            <p className="performance-explanation">
              {device.analysis?.feed?.performance.explanation}
            </p>
          </div>

          <div className="analysis-summary water-analysis">
            <h3>Water Analysis</h3>
            <p>
              Current level:{" "}
              {device.analysis?.water?.currentLevelPercent !== null
                ? `${device.analysis?.water?.currentLevelPercent.toFixed(
                    1,
                  )}%`
                : "Not available"}
            </p>
            <p>
              Decline rate:{" "}
              {device.analysis?.water?.dailyDeclinePercentagePoints !== null
                ? `${device.analysis?.water?.dailyDeclinePercentagePoints.toFixed(
                    2,
                  )} percentage points/day`
                : "Not available"}
            </p>
            <p>
              Estimated 0%:{" "}
              {device.analysis?.water?.estimatedZeroAt !== null
                ? new Date(
                    device.analysis?.water?.estimatedZeroAt,
                  ).toLocaleDateString()
                : "Not available"}
            </p>
            <p>
              Samples:{" "}
              {device.analysis?.water?.sampleCount}
            </p>
            <p className="water-limitation">
              {device.analysis?.water?.limitation}
            </p>
          </div>

          <div className="risk-analysis">
            <h3>Risk Signals</h3>
            <p>{device.analysis?.risk?.explanation}</p>
            {device.analysis?.risk?.score !== null && (
              <p>
                Risk score:{" "}
                {device.analysis?.risk?.score}/100{" "}
                {device.analysis?.risk?.policyVersion &&
                  ` (policy: ${device.analysis?.risk?.policyVersion})`}
              </p>
            )}
            {device.analysis?.risk?.signals != null && device.analysis?.risk?.signals.length > 0 && (
              <ul>
                {device.analysis?.risk?.signals.map(
                  (signal: any) => (
                    <li key={signal.id}>
                      {signal.title} · {signal.severity}
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>

          <div className="review-prompts">
            <h3>Review Prompts</h3>
            {device.recommendations.length > 0 ? (
              <ul>
                {device.recommendations.map(
                  (prompt: Recommendation) => (
                    <li key={prompt.id}>
                      <strong>{prompt.title}</strong>: {prompt.reason}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>No review prompts available.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}