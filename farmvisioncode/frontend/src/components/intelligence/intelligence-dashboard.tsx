"use client";

import { useEffect, useState } from "react";
import type { AnalyticsDeviceOption, AnalyticsFarmOption } from "../../../../backend/src/modules/analytics/types";
import type { DepletionForecast, IntelligenceResponse, IntelligenceReviewPrompt } from "../../../../backend/src/modules/intelligence/types";

type IntelligenceDashboardProps = {
  initialFarms: AnalyticsFarmOption[];
  initialDevices: AnalyticsDeviceOption[];
};

type RangeChoice = "7d" | "30d";

function formatPercent(value: number | null) {
  return value === null ? "Not available" : `${value.toFixed(1)}%`;
}

function formatRate(value: number | null) {
  return value === null ? "Not available" : `${value.toFixed(2)} percentage points/day`;
}

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : "Invalid timestamp";
}

function statusLabel(status: DepletionForecast["status"]) {
  switch (status) {
    case "ESTIMATED": return "Directional estimate available";
    case "INSUFFICIENT_DATA": return "Not enough continuous history";
    case "NO_DECLINE": return "No decline observed in this segment";
    case "NO_SUSTAINED_DECLINE": return "Declines were not sustained across stable intervals";
    case "RESET_AFFECTED": return "Too little history after a refill/reset";
    case "AT_ZERO": return "Last recorded level is 0%; verify locally";
  }
}

function ForecastCard({ title, forecast }: { title: string; forecast: DepletionForecast }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{statusLabel(forecast.status)}</p>
        </div>
        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">Directional · uncalibrated</span>
      </div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest reported level</dt><dd className="mt-1 text-2xl font-semibold text-slate-950">{formatPercent(forecast.currentLevelPercent)}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Median level-change rate</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{formatRate(forecast.dailyDeclinePercentagePoints)}</dd></div>
        {forecast.status === "ESTIMATED" ? (
          <>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Directional 0% crossing</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{formatDate(forecast.estimatedZeroAt)}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Days from last observation</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{forecast.daysUntilZero?.toFixed(1) ?? "Not available"}</dd></div>
          </>
        ) : null}
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calculation evidence</dt><dd className="mt-1 text-sm text-slate-800">{forecast.sampleCount} readings · {forecast.declineIntervalCount} declining intervals · {forecast.coverageHours?.toFixed(1) ?? "0"} hours</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">As of (viewer local time)</dt><dd className="mt-1 text-sm text-slate-800">{formatDate(forecast.asOf)}</dd></div>
      </dl>
      {forecast.resetIntervalCount > 0 ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{forecast.resetIntervalCount} level increase(s) were treated as possible refill/reset boundaries; earlier intervals do not set the current rate.</p> : null}
      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-600">
        {forecast.limitations.slice(0, 3).map((limitation) => <li key={limitation}>{limitation}</li>)}
      </ul>
    </article>
  );
}

function ReviewPromptCard({ prompt }: { prompt: IntelligenceReviewPrompt }) {
  return (
    <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold text-emerald-950">{prompt.title}</h4>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-900">Proposed · not saved</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-emerald-950">{prompt.reason}</p>
      <p className="mt-2 text-sm leading-6 text-emerald-900"><strong>Review prompt:</strong> {prompt.suggestedAction}</p>
      <dl className="mt-3 grid gap-2 text-xs text-emerald-950 sm:grid-cols-2">
        <div><dt className="font-semibold">Evidence</dt><dd>{prompt.evidence.currentValue.toFixed(1)}% · {prompt.evidence.dailyDeclinePercentagePoints.toFixed(2)} percentage points/day · {prompt.evidence.sampleCount} readings / {prompt.evidence.declineIntervalCount} decline intervals</dd></div>
        <div><dt className="font-semibold">Provenance</dt><dd>{prompt.evidence.source === "SIMULATOR" ? "Simulator" : "Hardware-reported (unverified)"} · {formatDate(prompt.evidence.observedAt)} · {prompt.evidence.formulaVersion}</dd></div>
        <div><dt className="font-semibold">Calculation segment</dt><dd>{formatDate(prompt.evidence.periodStart)} to {formatDate(prompt.evidence.periodEnd)}</dd></div>
        <div><dt className="font-semibold">Reset boundaries</dt><dd>{prompt.evidence.resetIntervalCount} possible refill/reset interval(s); confidence {prompt.evidence.confidence.toLowerCase().replaceAll("_", " ")}</dd></div>
      </dl>
    </article>
  );
}

export function IntelligenceDashboard({ initialFarms, initialDevices }: IntelligenceDashboardProps) {
  const initialFarmId = initialFarms[0]?.id ?? "";
  const initialDeviceId = initialDevices.find((device) => device.farm.id === initialFarmId)?.id ?? "";
  const [range, setRange] = useState<RangeChoice>("30d");
  const [farmId, setFarmId] = useState(initialFarmId);
  const [deviceId, setDeviceId] = useState(initialDeviceId);
  const [intelligence, setIntelligence] = useState<IntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(initialDeviceId));
  const [error, setError] = useState<string | null>(null);

  const farms = intelligence?.farms ?? initialFarms;
  const devices = intelligence?.devices ?? initialDevices;
  const farmDevices = devices.filter((device) => device.farm.id === farmId);
  const selectedDevice = devices.find((device) => device.id === deviceId) ?? null;

  function clearIntelligence(shouldLoad: boolean) {
    setIntelligence(null);
    setError(null);
    setLoading(shouldLoad);
  }

  useEffect(() => {
    if (!farmId || !deviceId) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ range, farmId, deviceId });
    void fetch(`/api/intelligence?${params.toString()}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const body = await response.json() as IntelligenceResponse & { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Resource intelligence could not be loaded.");
        setIntelligence(body);
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "Resource intelligence could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [range, farmId, deviceId]);

  const analysis = intelligence?.analysis ?? null;

  return (
    <div className="space-y-6">
      <section aria-label="Intelligence filters" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <label className="text-sm font-semibold text-slate-800">
          Farm
          <select className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal" value={farmId} onChange={(event) => {
            const nextFarmId = event.target.value;
            const nextDevice = devices.find((device) => device.farm.id === nextFarmId);
            setFarmId(nextFarmId);
            setDeviceId(nextDevice?.id ?? "");
            clearIntelligence(Boolean(nextDevice));
          }}>
            {farms.length === 0 ? <option value="">No farms available</option> : farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Device
          <select className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal" value={deviceId} onChange={(event) => {
            const nextDeviceId = event.target.value;
            setDeviceId(nextDeviceId);
            clearIntelligence(Boolean(nextDeviceId));
          }} disabled={farmDevices.length === 0}>
            {farmDevices.length === 0 ? <option value="">No devices for this farm</option> : farmDevices.map((device) => <option key={device.id} value={device.id}>{device.name}{device.isEnabled ? "" : " · disabled"}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          History window
          <select className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal" value={range} onChange={(event) => {
            setRange(event.target.value as RangeChoice);
            clearIntelligence(Boolean(deviceId));
          }}>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
          </select>
        </label>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        These are deterministic summaries of recorded observations, not machine-learning predictions. A reported percentage is not a calibrated physical quantity. Estimates use only a recent post-reset segment with enough history, and they do not trigger equipment, notifications, or persisted recommendations.
      </section>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-600" role="status">Reading selected-device history…</p> : null}
      {!selectedDevice ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-slate-600">Register a device to view its feed and water history.</p> : null}

      {selectedDevice && analysis ? (
        <>
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-semibold text-slate-950">{selectedDevice.farm.name} · {selectedDevice.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{selectedDevice.source === "SIMULATOR" ? "Simulator data" : "Hardware-reported data · calibration unverified"} · {intelligence?.readingCount.toLocaleString() ?? 0} readings</p>
            </div>
            <p className="text-xs text-slate-500">History: {formatDate(intelligence?.range.start ?? null)} to {formatDate(intelligence?.range.end ?? null)} · stored in UTC</p>
          </section>

          <section aria-label="Feed and water intelligence" className="grid gap-5 lg:grid-cols-2">
            <ForecastCard title="Feed-level forecast" forecast={analysis.feed.level} />
            <ForecastCard title="Water-level forecast" forecast={analysis.water.level} />
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-950">Observed feed-weight changes</h3>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{analysis.feed.observedWeightChange.observedDecreaseGrams === null ? "Not available" : `${analysis.feed.observedWeightChange.observedDecreaseGrams.toFixed(1)} g observed decrease`}</p>
              <p className="mt-2 text-sm text-slate-600">{analysis.feed.observedWeightChange.sampleCount} reported mass samples · {analysis.feed.observedWeightChange.declineIntervalCount} declining intervals · {analysis.feed.observedWeightChange.resetIntervalCount} increase/reset intervals.</p>
              <p className="mt-3 text-xs leading-5 text-slate-500">{analysis.feed.observedWeightChange.limitation}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-950">Farm performance foundation</h3>
              <p className="mt-2 text-lg font-semibold text-slate-900">{analysis.performance.score === null ? "Not rated" : `${analysis.performance.score}/100`}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.performance.explanation}</p>
            </article>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-semibold text-slate-950">Risk signals</h3><p className="mt-1 text-sm text-slate-600">{analysis.risk.explanation}</p></div>
              {analysis.risk.score !== null ? <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-800">{analysis.risk.score}/100 · {analysis.risk.policyVersion}</span> : null}
            </div>
            {analysis.risk.signals.length === 0 ? <p className="mt-4 text-sm text-slate-600">No active persisted alert signals were returned for this device. Missing alerts are not proof of safety.</p> : (
              <ul className="mt-4 space-y-3">
                {analysis.risk.signals.map((signal) => <li className="rounded-lg border border-slate-200 p-3" key={signal.id}>
                  <p className="font-semibold text-slate-900">{signal.title} · {signal.severity} · {signal.status}</p>
                  <p className="mt-1 text-sm text-slate-700">Observed {signal.observedValue}{signal.unit}; configured boundary {signal.thresholdValue}{signal.unit}; last triggered {formatDate(signal.observedAt)}.</p>
                  <p className="mt-1 text-xs text-slate-500">{signal.provenanceNote} Source: {signal.source === "SIMULATOR" ? "simulator" : "hardware-reported (unverified)"}.</p>
                </li>)}
              </ul>
            )}
          </section>

          <section aria-label="Evidence-linked review prompts" className="space-y-3">
            <div><h3 className="text-lg font-semibold text-slate-950">Evidence-linked review prompts</h3><p className="mt-1 text-sm text-slate-600">These are proposed, on-demand interpretations—not saved Phase 3 recommendations or instructions to act.</p></div>
            {analysis.recommendations.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">No directional prompt is available because the selected history did not meet the estimate’s evidence gates.</p> : analysis.recommendations.map((prompt) => <ReviewPromptCard key={prompt.id} prompt={prompt} />)}
          </section>
        </>
      ) : null}
    </div>
  );
}
