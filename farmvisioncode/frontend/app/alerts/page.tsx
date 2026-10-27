"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AlertEventItem = {
  id: string;
  eventType: "TRIGGERED" | "ACKNOWLEDGED" | "RESOLVED" | "ESCALATED" | "SEVERITY_CHANGED";
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  observedValue: number | null;
  thresholdValue: number | null;
  unit: string | null;
  createdAt: string;
  actor: { name: string | null; email: string | null } | null;
};

export type { AlertEventItem };

type Device = {
  id: string;
  publicId: string;
  name: string;
  source: "HARDWARE" | "SIMULATOR";
  farm: { id: string; name: string };
};

export type { Device };

type AlertItem = {
  id: string;
  type: "FEED_LOW" | "WATER_LOW" | "HIGH_TEMPERATURE";
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  title: string;
  reason: string;
  suggestedAction: string;
  observedValue: number;
  thresholdValue: number;
  unit: string;
  firstTriggeredAt: string;
  lastTriggeredAt: string;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  device: Device;
  events: AlertEventItem[];
};

export type { AlertItem };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchAlerts() {
      try {
        const res = await fetch("/api/alerts", {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load alerts");
        }

        if (cancelled) return;

        const data = await res.json();
        setAlerts(data.alerts ?? []);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setLoading(false);
      }
    }

    fetchAlerts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">ALERTS</p>
          <h1>Alert Center</h1>
          <p>Loading alerts...</p>
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

  const activeAlerts = alerts.filter((alert) => alert.status !== "RESOLVED");
  const resolvedAlerts = alerts.filter((alert) => alert.status === "RESOLVED");
  const openAlerts = alerts.filter((alert) => alert.status === "OPEN");

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
          <Link className="nav-login" href="/api/auth/logout" onClick={(e) => {
            e.preventDefault();
            fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => {
              window.location.href = "/login";
            });
          }}>Sign out</Link>
        </div>
      </nav>

      <section className="alerts-page">
        <div className="dashboard-header">
          <h1>Alert Center</h1>
          <p className="eyebrow">Farm alerts and notifications</p>
        </div>

        <div className="alert-summary">
          <div className="summary-card">
            <p className="text-sm text-slate-600">Open</p>
            <p className="text-3xl font-semibold text-slate-950">
              {openAlerts.length}
            </p>
          </div>
          <div className="summary-card">
            <p className="text-sm text-slate-600">Acknowledged</p>
            <p className="text-3xl font-semibold text-slate-950">
              {alerts.filter((a) => a.status === "ACKNOWLEDGED").length}
            </p>
          </div>
          <div className="summary-card">
            <p className="text-sm text-slate-600">Resolved</p>
            <p className="text-3xl font-semibold text-slate-950">
              {resolvedAlerts.length}
            </p>
          </div>
        </div>

        {activeAlerts.length === 0 && resolvedAlerts.length === 0 ? (
          <div className="card empty-state">
            <p>No alerts at this time. Telemetry is within normal thresholds.</p>
          </div>
        ) : (
          <div className="alerts-container">
            <section className="open-alerts">
              <h2>Open Alerts</h2>
              {openAlerts.length === 0 ? (
                <p>No open alerts.</p>
              ) : (
                <ul>
                  {openAlerts.map((alert) => (
                    <li key={alert.id} className="alert-item">
                      <div className="alert-header">
                        <h3>{alert.title}</h3>
                        <span
                          className={`severity-badge ${alert.severity.toLowerCase()}`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="alert-reason">{alert.reason}</p>
                      <p className="alert-suggested">
                        Suggested: {alert.suggestedAction}
                      </p>
                      <p className="alert-device">
                        {alert.device.name} · {alert.device.farm.name}
                      </p>
                      <div className="alert-actions">
                        <button
                          className="btn-acknowledge"
                          onClick={() => alertAck(alert.id)}
                          disabled={false}
                        >
                          Acknowledge
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="resolved-alerts">
              <h2>Resolved Alerts</h2>
              {resolvedAlerts.length === 0 ? (
                <p>No resolved alerts.</p>
              ) : (
                <ul>
                  {resolvedAlerts.map((alert) => (
                    <li key={alert.id} className="alert-item">
                      <div className="alert-header">
                        <h3>{alert.title}</h3>
                        <span
                          className={`severity-badge ${alert.severity.toLowerCase()}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="alert-reason">{alert.reason}</p>
                      <p className="alert-resolved">
                        Resolved: {new Date(alert.resolvedAt ?? Date.now()).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        <Link
          href="/api/alerts/create"
          className="primary-button mt-6"
        >
          Create Alert Manually
        </Link>
      </section>
    </main>
  );
}

function alertAck(alertId: string) {
  alert("Acknowledge alert functionality would be implemented via API call");
}