"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RecommendationItem = {
  id: string;
  type: "FEED_CHECK" | "WATER_CHECK" | "HEAT_RESPONSE";
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "PENDING" | "ACKNOWLEDGED" | "RESOLVED" | "REVIEW_REQUIRED";
  explanation: string;
  suggestedAction: string;
  observedValue?: number;
  thresholdValue?: number;
  unit?: string;
  device: {
    id: string;
    publicId: string;
    name: string;
    source: "HARDWARE" | "SIMULATOR";
    farm: { id: string; name: string };
  };
  ruleVersion?: string;
  createdAt?: string;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch("/api/recommendations", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load recommendations");
        const data = await res.json();
        setRecommendations(data.recommendations ?? []);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">RECOMMENDATIONS</p>
          <h1>Recommendations</h1>
          <p>Loading recommendations...</p>
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

  const pending = recommendations.filter(
    (r) => r.status === "PENDING" || r.status === "REVIEW_REQUIRED",
  );
  const acknowledged = recommendations.filter(
    (r) => r.status === "ACKNOWLEDGED",
  );
  const resolved = recommendations.filter((r) => r.status === "RESOLVED");

  return (
    <main className="auth-page">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FarmVision<span className="brand-ai"> AI</span></span>
        </Link>
        <div className="nav-actions">
          <Link className="primary-button" href="/">
            <span className="brand-mark" aria-hidden="true">F</span>
            <span>FarmVision AI</span>
          </Link>
          <Link className="nav-login" href="/logout">Sign out</Link>
        </div>
      </nav>

      <section className="recommendations-page">
        <div className="dashboard-header">
          <h1>Recommendations</h1>
          <p className="eyebrow">AI-generated recommendations based on sensor data</p>
        </div>

        {recommendations.length === 0 ? (
          <div className="card empty-state">
            <p>
              No recommendations at this time.{" "}
              <Link href="/api/recommendations/generate" className="primary-button">
                Generate Recommendations
              </Link>
            </p>
            <p className="text-slate-500 text-xs">
              Recommendations appear when sensor data crosses prototype thresholds.
            </p>
          </div>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map((rec) => (
              <div key={rec.id} className="card recommendation-card">
                <div className="rec-header">
                  <span
                    className={`rec-severity ${rec.severity.toLowerCase()}`}
                  >
                    {rec.severity}
                  </span>
                  <span className="rec-status">
                    {rec.status.replace("_", " ")}
                  </span>
                </div>
                <h3>{rec.type.replace("_", " ")}</h3>
                <p className="rec-explanation">
                  {rec.explanation}
                </p>
                {rec.suggestedAction && (
                  <p className="rec-action"><strong>Action:</strong> {rec.suggestedAction}</p>
                )}
                {rec.observedValue !== undefined && rec.thresholdValue !== undefined && (
                  <p className="rec-observed">
                    Observed: {rec.observedValue}{rec.unit ?? ""} ·
                    Threshold: {rec.thresholdValue}{rec.unit ?? ""}
                  </p>
                )}
                <p className="rec-device">
                  {rec.device.name} · {rec.device.farm.name}
                </p>
                {rec.acknowledgedAt && (
                  <p className="rec-acknowledged">
                    Acknowledged: {new Date(rec.acknowledgedAt).toLocaleDateString()}
                  </p>
                )}
                {rec.resolvedAt && (
                  <p className="rec-resolved">
                    Resolved: {new Date(rec.resolvedAt ?? Date.now()).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <Link
          href="/api/recommendations/generate"
          className="primary-button mt-6"
        >
          Generate Recommendations
        </Link>
      </section>
    </main>
  );
}