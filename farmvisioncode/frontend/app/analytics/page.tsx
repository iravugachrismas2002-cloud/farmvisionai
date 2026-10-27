"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AnalyticsReading = {
  temperatureC: number | null;
  humidityPercent: number | null;
  feedLevelPercent: number | null;
  waterLevelPercent: number | null;
  observedAt: string;
};

type AnalyticsRange = "24h" | "7d" | "30d" | "90d";

export type AnalyticsResponse = {
  temperature: {
    meanC: number | null;
    minC: number | null;
    maxC: number | null;
    sampleCount: number;
  };
  humidity: {
    meanPercent: number | null;
    minPercent: number | null;
    maxPercent: number | null;
    sampleCount: number;
  };
  feedLevel: {
    observedDecreasePercentagePoints: number | null;
    increaseIntervalCount: number;
    intervalCount: number;
  };
  waterLevel: {
    observedDecreasePercentagePoints: number | null;
    increaseIntervalCount: number;
    intervalCount: number;
  };
  feedWeight: {
    observedDecreaseGrams: number | null;
    increaseIntervalCount: number;
    intervalCount: number;
  };
};

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("24h");
  const [readings, setReadings] = useState<AnalyticsReading[]>([]);
  const [response, setResponse] = useState<
    | {
        temperature: {
          meanC: number | null;
          minC: number | null;
          maxC: number | null;
          sampleCount: number;
        };
        humidity: {
          meanPercent: number | null;
          minPercent: number | null;
          maxPercent: number | null;
          sampleCount: number;
        };
        feedLevel: {
          observedDecreasePercentagePoints: number | null;
          increaseIntervalCount: number;
          intervalCount: number;
        };
        waterLevel: {
          observedDecreasePercentagePoints: number | null;
          increaseIntervalCount: number;
          intervalCount: number;
        };
        feedWeight: {
          observedDecreaseGrams: number | null;
          increaseIntervalCount: number;
          intervalCount: number;
        };
      }
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/analytics?range=${range}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load analytics");
        const data = await res.json();
        setResponse(data);
        // Convert aggregated data to readings for display
        const readings: AnalyticsReading[] = [];
        if (data?.temperature?.sampleCount > 0) {
          readings.push({
            temperatureC: data.temperature.meanC,
            humidityPercent: data.humidity?.meanPercent,
            feedLevelPercent: data.feedLevel?.observedDecreasePercentagePoints != null ? null : null,
            waterLevelPercent: data.waterLevel?.observedDecreasePercentagePoints != null ? null : null,
            observedAt: new Date().toISOString(),
          });
        }
        setReadings(readings);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [range]);

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">ANALYTICS</p>
          <h1>Historical Analytics</h1>
          <p>Loading analytics data...</p>
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

  // Use non-null assertions since we've checked loading and error states
  const tempStats = response?.temperature;
  const humidityStats = response?.humidity;
  const feedStats = response?.feedLevel;
  const waterStats = response?.waterLevel;
  const feedWeightStats = response?.feedWeight;

  // Defensive: ensure we have data, fallback to defaults
  const tempSampleCount = tempStats?.sampleCount ?? 0;
  const humiditySampleCount = humidityStats?.sampleCount ?? 0;
  const feedIntervalCount = feedStats?.intervalCount ?? 0;
  const waterIntervalCount = waterStats?.intervalCount ?? 0;

  const hasTempData = tempSampleCount > 0;
  const hasHumidityData = humiditySampleCount > 0;
  const hasFeedData = feedIntervalCount > 0;
  const hasWaterData = waterIntervalCount > 0;

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

      <section className="analytics-page">
        <div className="dashboard-header">
          <h1>Historical Analytics</h1>
          <p className="eyebrow">Environmental history and measurements</p>
        </div>

        <div className="range-selector">
          <Link
            href="/analytics"
            className={`range-button ${
              range === "24h" ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              setRange("24h");
            }}
          >
            24h
          </Link>
          <Link
            href="/analytics"
            className={`range-button ${
              range === "7d" ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              setRange("7d");
            }}
          >
            7d
          </Link>
          <Link
            href="/analytics"
            className={`range-button ${
              range === "30d" ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              setRange("30d");
            }}
          >
            30d
          </Link>
          <Link
            href="/analytics"
            className={`range-button ${
              range === "90d" ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              setRange("90d");
            }}
          >
            90d
          </Link>
        </div>

        {response ? (
          <div className="summary-grid">
            <div className="summary-card">
              <h3>Temperature</h3>
              <p>
                Mean:{" "}
                {hasTempData
                  ? `${tempStats!.meanC!.toFixed(1)}°C`
                  : "No data"}
              </p>
              <p>Min: {hasTempData ? `${tempStats!.minC!.toFixed(1)}°C` : "No data"}</p>
              <p>Max: {hasTempData ? `${tempStats!.maxC!.toFixed(1)}°C` : "No data"}</p>
              <p>Samples: {tempSampleCount}</p>
            </div>

            <div className="summary-card">
              <h3>Humidity</h3>
              <p>
                Mean:{" "}
                {hasHumidityData
                  ? `${humidityStats!.meanPercent!.toFixed(1)}%`
                  : "No data"}
              </p>
              <p>Min: {hasHumidityData ? `${humidityStats!.minPercent!.toFixed(1)}%` : "No data"}</p>
              <p>Max: {hasHumidityData ? `${humidityStats!.maxPercent!.toFixed(1)}%` : "No data"}</p>
              <p>Samples: {humiditySampleCount}</p>
            </div>

            <div className="summary-card">
              <h3>Feed Level</h3>
              <p>
                Observed decrease: {
                  hasFeedData
                    ? `${feedStats!.observedDecreasePercentagePoints!.toFixed(
                        1,
                      )} percentage points`
                    : "No data"
                }
              </p>
              <p>Increase intervals: {feedIntervalCount}</p>
              <p>Total intervals: {feedIntervalCount}</p>
            </div>

            <div className="summary-card">
              <h3>Water Level</h3>
              <p>
                Observed decrease: {
                  hasWaterData
                    ? `${waterStats!.observedDecreasePercentagePoints!.toFixed(
                        1,
                      )} percentage points`
                    : "No data"
                }
              </p>
              <p>Increase intervals: {waterIntervalCount}</p>
              <p>Total intervals: {waterIntervalCount}</p>
            </div>
          </div>
        ) : (
          <div className="card empty-state">
            <p>No analytics data available for the selected range.</p>
          </div>
        )}

        <div className="readings-histogram">
          <h3>Recent Readings ({range})</h3>
          {readings.length > 0 ? (
            <ul>
              {readings.map((reading, idx) => (
                <li key={idx} className="reading-item">
                  <div>
                    <span className="reading-time">
                      {new Date(reading.observedAt).toLocaleTimeString()}
                    </span>
                    <span className="reading-temp">
                      {reading.temperatureC !== null
                        ? `${reading.temperatureC.toFixed(1)}°C`
                        : "—"}
                    </span>
                    <span className="reading-humidity">
                      {reading.humidityPercent !== null
                        ? `${reading.humidityPercent.toFixed(1)}%`
                        : "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No readings for this range.</p>
          )}
        </div>
      </section>
    </main>
  );
}