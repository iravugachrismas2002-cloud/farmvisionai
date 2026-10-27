"use client";

import { useState } from "react";

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
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  device: {
    id: string;
    publicId: string;
    name: string;
    source: "HARDWARE" | "SIMULATOR";
    farm: { id: string; name: string };
  };
  events: AlertEventItem[];
};

type AckResponse = {
  alreadyAcknowledged: boolean;
  acknowledgedAt?: string;
  event?: Omit<AlertEventItem, "actor">;
  error?: string;
};

const severityStyles = {
  INFO: "border-slate-300 bg-slate-100 text-slate-700",
  WARNING: "border-amber-300 bg-amber-50 text-amber-900",
  CRITICAL: "border-red-300 bg-red-50 text-red-900",
} as const;

export function AlertCenter({ initialAlerts }: { initialAlerts: AlertItem[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [showHistory, setShowHistory] = useState(false);
  const [busyAlertId, setBusyAlertId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const visibleAlerts = showHistory ? alerts : alerts.filter((alert) => alert.status !== "RESOLVED");
  const activeCount = alerts.filter((alert) => alert.status === "OPEN").length;

  async function acknowledge(alert: AlertItem) {
    setBusyAlertId(alert.id);
    setMessage(null);
    setError(false);
    try {
      const response = await fetch(`/api/alerts/${encodeURIComponent(alert.id)}/acknowledge`, { method: "POST" });
      const result = (await response.json()) as AckResponse;
      if (!response.ok) throw new Error(result.error ?? "Alert acknowledgement failed.");
      const acknowledgedAt = result.acknowledgedAt ?? new Date().toISOString();
      setAlerts((current) => current.map((item) => item.id !== alert.id ? item : {
        ...item,
        status: "ACKNOWLEDGED",
        acknowledgedAt,
        events: result.event
          ? [{ ...result.event, actor: null }, ...item.events]
          : item.events,
      }));
      setMessage(result.alreadyAcknowledged ? "This alert was already acknowledged." : "Alert acknowledged. It will remain visible until new telemetry clears the condition.");
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : "Alert acknowledgement failed.");
    } finally {
      setBusyAlertId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-600">Open alerts</p>
          <p className="text-3xl font-semibold text-slate-950">{activeCount}</p>
        </div>
        <button className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50" onClick={() => setShowHistory((value) => !value)} type="button">
          {showHistory ? "Show active alerts" : "Show alert history"}
        </button>
      </section>

      <p className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        These deterministic thresholds are configurable prototype defaults, not validated veterinary or farm-specific advice. Sensor readings and threshold comparisons are shown with their units and source.
      </p>
      {message ? <p className={error ? "text-sm text-red-700" : "text-sm text-emerald-800"} role={error ? "alert" : "status"}>{message}</p> : null}

      {visibleAlerts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-slate-600">
          {showHistory ? "No alert history is available for your farms." : "No open alerts. Alerts appear when accepted telemetry crosses a configured prototype threshold."}
        </p>
      ) : (
        <ul className="space-y-4">
          {visibleAlerts.map((alert) => {
            const displaySeverity = alert.status === "RESOLVED" ? "INFO" : alert.severity;
            return (
              <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={alert.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-950">{alert.title}</h2>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${severityStyles[displaySeverity]}`}>{displaySeverity}</span>
<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Source: {alert.device.source === "HARDWARE" ? "Operator Entry" : "Sensor Node"}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{alert.status.replace("_", " ")}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{alert.device.farm.name} · {alert.device.name} · {alert.device.source === "SIMULATOR" ? "Simulated" : "Hardware-reported"}</p>
                  </div>
                  {alert.status === "OPEN" ? (
                    <button className="min-h-10 rounded-lg border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 disabled:opacity-60" disabled={busyAlertId === alert.id} onClick={() => void acknowledge(alert)} type="button">
                      {busyAlertId === alert.id ? "Saving…" : "Acknowledge"}
                    </button>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-800">{alert.reason}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Suggested response:</strong> {alert.suggestedAction}</p>
                <p className="mt-2 text-xs text-slate-500">Observed {alert.observedValue}{alert.unit}; threshold {alert.thresholdValue}{alert.unit} · last triggered {new Date(alert.lastTriggeredAt).toLocaleString()}</p>
                {alert.acknowledgedAt ? <p className="mt-1 text-xs text-slate-500">Acknowledged {new Date(alert.acknowledgedAt).toLocaleString()}</p> : null}
                {alert.resolvedAt ? <p className="mt-1 text-xs text-slate-500">Resolved {new Date(alert.resolvedAt).toLocaleString()}</p> : null}
                <details className="mt-4 border-t border-slate-100 pt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-700">Event history ({alert.events.length})</summary>
                  <ol className="mt-3 space-y-3">
                    {alert.events.map((event) => (
                      <li className="border-l-2 border-slate-200 pl-3" key={event.id}>
                        <p className="text-sm font-medium text-slate-800">{event.eventType.replaceAll("_", " ")} · {event.severity}</p>
                        <p className="text-sm text-slate-600">{event.message}</p>
                        <p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}{event.actor ? ` · ${event.actor.name ?? event.actor.email ?? "Account"}` : " · system"}</p>
                      </li>
                    ))}
                  </ol>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
