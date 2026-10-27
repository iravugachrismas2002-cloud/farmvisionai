"use client";

import Link from "next/link";
import { useState } from "react";

type RecommendationItem = {
  id: string;
  type: "FEED_CHECK" | "WATER_CHECK" | "HEAT_RESPONSE";
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  title: string;
  reason: string;
  suggestedAction: string;
  observedValue: number;
  thresholdValue: number;
  unit: string;
  observedAt: string;
  deviceSource: "HARDWARE" | "SIMULATOR";
  ruleVersion: string;
  createdAt: string;
  lastGeneratedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  alert: {
    id: string;
    type: "FEED_LOW" | "WATER_LOW" | "HIGH_TEMPERATURE";
    device: {
      id: string;
      name: string;
      publicId: string;
      source: "HARDWARE" | "SIMULATOR";
      farm: { id: string; name: string };
    };
  };
};

const severityStyles = {
  INFO: "border-slate-300 bg-slate-100 text-slate-700",
  WARNING: "border-amber-300 bg-amber-50 text-amber-900",
  CRITICAL: "border-red-300 bg-red-50 text-red-900",
} as const;

export function RecommendationCenter({ initialRecommendations }: { initialRecommendations: RecommendationItem[] }) {
  const [showHistory, setShowHistory] = useState(false);
  const visible = showHistory
    ? initialRecommendations
    : initialRecommendations.filter((item) => item.status !== "RESOLVED");

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-600">Current recommendations</p>
          <p className="text-3xl font-semibold text-slate-950">{initialRecommendations.filter((item) => item.status !== "RESOLVED").length}</p>
        </div>
        <button className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50" onClick={() => setShowHistory((value) => !value)} type="button">
          {showHistory ? "Show current" : "Show history"}
        </button>
      </section>

      <p className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        Recommendations are deterministic review prompts based on prototype rules. Confirm the measurement and follow your farm&apos;s approved operating plan; these prompts are not universal veterinary advice and do not control equipment.
      </p>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-slate-600">
          {showHistory ? "No recommendation history is available for your farms." : "No current recommendations. A prompt appears when accepted telemetry crosses a configured rule."}
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((item) => (
            <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${severityStyles[item.severity]}`}>{item.severity}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{item.status.replace("_", " ")}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{item.alert.device.farm.name} · {item.alert.device.name} · {item.deviceSource === "HARDWARE" ? "Operator Entry" : "Sensor Node"}</p>
                </div>
                <Link className="text-sm font-semibold text-emerald-800 underline underline-offset-4" href="/alerts">Review alert</Link>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-800"><strong>Why:</strong> {item.reason}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Suggested action:</strong> {item.suggestedAction}</p>
              <p className="mt-3 text-xs text-slate-500">Supporting observation: {item.observedValue}{item.unit}; rule boundary {item.thresholdValue}{item.unit}; observed {new Date(item.observedAt).toLocaleString()}.</p>
              <p className="mt-1 text-xs text-slate-500">Created {new Date(item.createdAt).toLocaleString()} · refreshed {new Date(item.lastGeneratedAt).toLocaleString()} · rule {item.ruleVersion}</p>
              {item.acknowledgedAt ? <p className="mt-1 text-xs text-slate-500">Acknowledged {new Date(item.acknowledgedAt).toLocaleString()} from the associated alert.</p> : null}
              {item.resolvedAt ? <p className="mt-1 text-xs text-slate-500">Resolved {new Date(item.resolvedAt).toLocaleString()} when later telemetry returned within range.</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
