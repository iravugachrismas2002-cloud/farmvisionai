"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnalyticsDeviceOption, AnalyticsFarmOption, AnalyticsResponse } from "../../../../backend/src/modules/analytics/types";
import { buildDigitalTwinBaseline } from "../../../../backend/src/modules/digital-twin/baseline";
import { twinScenarioSchema, type TwinScenarioInput } from "../../../../backend/src/modules/digital-twin/schema";
import { simulateDigitalTwin } from "../../../../backend/src/modules/digital-twin/simulation";
import type { DigitalTwinInputs, TwinHistoryContext, TwinRiskProjection } from "../../../../backend/src/modules/digital-twin/types";
import type { IntelligenceResponse } from "../../../../backend/src/modules/intelligence/types";

type DigitalTwinDashboardProps = {
  initialFarms: AnalyticsFarmOption[];
  initialDevices: AnalyticsDeviceOption[];
};

type TwinRange = "7d" | "30d";
type ScenarioForm = Partial<TwinScenarioInput>;

type NumberFieldProps = {
  label: string;
  value: number | undefined;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  required?: boolean;
  onChange: (raw: string) => void;
};

function NumberField({ label, value, min, max, step = 1, unit, required = false, onChange }: NumberFieldProps) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      {label}{unit ? ` (${unit})` : ""}{required ? " · required" : " · optional"}
      <input
        className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal"
        type="number"
        min={min}
        max={max}
        step={step}
        required={required}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function formatValue(value: number | null, unit: string, digits = 1) {
  return value === null ? "Not available" : `${value.toFixed(digits)} ${unit}`;
}

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : "Invalid timestamp";
}

function basisLabel(basis: string) {
  switch (basis) {
    case "OBSERVED_BASELINE": return "Observed baseline";
    case "DIRECTIONAL_TREND": return "Phase 5 directional trend";
    case "USER_ASSUMPTION": return "User-entered scenario assumption";
    case "BASELINE_HELD": return "Scenario holds latest observation constant";
    default: return "Unavailable; no value assumed";
  }
}

function riskLabel(level: string) {
  switch (level) {
    case "NONE": return "No prototype threshold crossed";
    case "WARNING": return "Warning threshold crossed";
    case "CRITICAL": return "Critical threshold crossed";
    default: return "Unavailable; input is missing";
  }
}

export function DigitalTwinDashboard({ initialFarms, initialDevices }: DigitalTwinDashboardProps) {
  const initialFarmId = initialFarms[0]?.id ?? "";
  const initialDeviceId = initialDevices.find((device) => device.farm.id === initialFarmId)?.id ?? "";
  const [range, setRange] = useState<TwinRange>("30d");
  const [farmId, setFarmId] = useState(initialFarmId);
  const [deviceId, setDeviceId] = useState(initialDeviceId);
  const [inputs, setInputs] = useState<DigitalTwinInputs | null>(null);
  const [scenarioForm, setScenarioForm] = useState<ScenarioForm>({ horizonDays: 7 });
  const [loading, setLoading] = useState(Boolean(initialDeviceId));
  const [error, setError] = useState<string | null>(null);

  const farms = inputs?.intelligence.farms ?? initialFarms;
  const devices = inputs?.intelligence.devices ?? initialDevices;
  const farmDevices = devices.filter((device) => device.farm.id === farmId);
  const selectedDevice = devices.find((device) => device.id === deviceId) ?? null;

  useEffect(() => {
    if (!farmId || !deviceId) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ range, farmId, deviceId });
    const requestOptions = { signal: controller.signal, cache: "no-store" as const };

    void Promise.all([
      fetch(`/api/intelligence?${params.toString()}`, requestOptions),
      fetch(`/api/analytics?${params.toString()}`, requestOptions),
    ])
      .then(async ([intelligenceResponse, analyticsResponse]) => {
        const intelligenceBody = await intelligenceResponse.json() as IntelligenceResponse & { error?: string };
        const analyticsBody = await analyticsResponse.json() as AnalyticsResponse & { error?: string };
        if (!intelligenceResponse.ok) throw new Error(intelligenceBody.error ?? "Resource intelligence could not be loaded.");
        if (!analyticsResponse.ok) throw new Error(analyticsBody.error ?? "Historical analytics could not be loaded.");
        if (!controller.signal.aborted) setInputs({ intelligence: intelligenceBody, analytics: analyticsBody });
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "Digital Twin inputs could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [range, farmId, deviceId]);

  const baseline = useMemo(() => inputs ? buildDigitalTwinBaseline(inputs) : null, [inputs]);
  const parsedScenario = useMemo(() => twinScenarioSchema.safeParse(scenarioForm), [scenarioForm]);
  const simulation = useMemo(
    () => baseline && parsedScenario.success ? simulateDigitalTwin(baseline, parsedScenario.data) : null,
    [baseline, parsedScenario],
  );

  function clearTwin(shouldLoad: boolean) {
    setInputs(null);
    setError(null);
    setLoading(shouldLoad);
  }

  function updateScenario(key: keyof TwinScenarioInput, raw: string) {
    const value = raw.trim() === "" ? undefined : Number(raw);
    setScenarioForm((current) => ({ ...current, [key]: value }));
  }

  const observed = baseline?.observed ?? null;
  const history = baseline?.history;
  const sourceLabel = baseline?.source === "SIMULATOR"
    ? "Simulator observation"
    : baseline?.source === "HARDWARE" ? "Hardware-reported · calibration unverified" : "No observation source";

  return (
    <div className="space-y-6">
      <section aria-label="Digital Twin selectors" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <label className="text-sm font-semibold text-slate-800">
          Farm
          <select className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal" value={farmId} onChange={(event) => {
            const nextFarmId = event.target.value;
            const nextDevice = devices.find((device) => device.farm.id === nextFarmId);
            setFarmId(nextFarmId);
            setDeviceId(nextDevice?.id ?? "");
            clearTwin(Boolean(nextDevice));
          }}>
            {farms.length === 0 ? <option value="">No farms available</option> : farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Device
          <select className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal" value={deviceId} disabled={farmDevices.length === 0} onChange={(event) => {
            const nextDeviceId = event.target.value;
            setDeviceId(nextDeviceId);
            clearTwin(Boolean(nextDeviceId));
          }}>
            {farmDevices.length === 0 ? <option value="">No devices for this farm</option> : farmDevices.map((device) => <option key={device.id} value={device.id}>{device.name}{device.isEnabled ? "" : " · disabled"}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">
          History context
          <select className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal" value={range} onChange={(event) => {
            setRange(event.target.value as TwinRange);
            clearTwin(Boolean(deviceId));
          }}>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
          </select>
        </label>
      </section>

      <section className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        <h2 className="font-bold uppercase tracking-wide">Simulation only — not a real-world measurement</h2>
        <p className="mt-2">The baseline comes from the existing owner-scoped analytics and intelligence APIs. Scenario values are calculated in this browser session only; they are not saved and cannot update telemetry, device state, alerts, or recommendations.</p>
      </section>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-600" role="status">Loading observed analytics and intelligence…</p> : null}
      {!selectedDevice ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-slate-600">Register a device to load a baseline, or select a farm with an associated device.</p> : null}

      {selectedDevice && baseline ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Observed baseline · {selectedDevice.farm.name} · {selectedDevice.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{sourceLabel} · observed at {formatDate(baseline.observedAt)}</p>
              </div>
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900">Observed data</span>
            </div>
            {!observed ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">No reading was recorded in this selected history window. Baseline values remain unavailable; explicit assumptions can still define a simulation, but no observed comparison is possible.</p> : null}
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Metric label="Feed level" value={observed?.feedLevelPercent ?? null} unit="%" />
              <Metric label="Water level" value={observed?.waterLevelPercent ?? null} unit="%" />
              <Metric label="Temperature" value={observed?.temperatureC ?? null} unit="°C" />
              <Metric label="Humidity" value={observed?.humidityPercent ?? null} unit="%" />
              <Metric label="Feed weight" value={observed?.feedWeightGrams ?? null} unit="g" />
            </dl>
            <p className="mt-4 text-xs leading-5 text-slate-500">Only fields present in the latest recorded row are shown. Missing fields are not carried forward from older readings. Feed weight and feed-level percentage remain separate measurements.</p>
          </section>

          {history ? <HistoryContext history={history} range={range} /> : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Scenario assumptions</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Blank resource rates reuse a Phase 5 directional trend only when its evidence gate passed. Entered values are assumptions, not measured consumption. Climate values are horizon conditions, not forecasts.</p>
              </div>
              <button className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={() => setScenarioForm({ horizonDays: 7 })}>Reset assumptions</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NumberField label="Horizon" unit="days ahead" value={scenarioForm.horizonDays} min={1} max={30} required onChange={(raw) => updateScenario("horizonDays", raw)} />
              <NumberField label="Feed starting level assumption" unit="%" value={scenarioForm.feedStartLevelAssumptionPercent} min={0} max={100} step={0.1} onChange={(raw) => updateScenario("feedStartLevelAssumptionPercent", raw)} />
              <NumberField label="Feed daily drawdown assumption" unit="percentage points/day" value={scenarioForm.feedDailyDrawdownAssumptionPercentagePoints} min={0} max={100} step={0.1} onChange={(raw) => updateScenario("feedDailyDrawdownAssumptionPercentagePoints", raw)} />
              <NumberField label="Water starting level assumption" unit="%" value={scenarioForm.waterStartLevelAssumptionPercent} min={0} max={100} step={0.1} onChange={(raw) => updateScenario("waterStartLevelAssumptionPercent", raw)} />
              <NumberField label="Water daily drawdown assumption" unit="percentage points/day" value={scenarioForm.waterDailyDrawdownAssumptionPercentagePoints} min={0} max={100} step={0.1} onChange={(raw) => updateScenario("waterDailyDrawdownAssumptionPercentagePoints", raw)} />
              <NumberField label="Temperature at horizon assumption" unit="°C" value={scenarioForm.temperatureAtHorizonAssumptionC} min={-40} max={85} step={0.1} onChange={(raw) => updateScenario("temperatureAtHorizonAssumptionC", raw)} />
              <NumberField label="Humidity at horizon assumption" unit="%" value={scenarioForm.humidityAtHorizonAssumptionPercent} min={0} max={100} step={0.1} onChange={(raw) => updateScenario("humidityAtHorizonAssumptionPercent", raw)} />
            </div>
            {!parsedScenario.success ? <p className="mt-4 text-sm text-red-800" role="alert">{parsedScenario.error.issues[0]?.message ?? "Check scenario inputs."}</p> : null}
          </section>

          {simulation ? (
            <>
              <section aria-label="Observed baseline and simulated state comparison" className="grid gap-5 lg:grid-cols-2">
                <article className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                  <h2 className="font-semibold text-slate-950">Baseline · observed</h2>
                  <p className="mt-1 text-xs text-slate-500">Latest event time: {formatDate(baseline.observedAt)} · {sourceLabel}</p>
                  <StateMetric label="Feed level" value={observed?.feedLevelPercent ?? null} unit="%" />
                  <StateMetric label="Water level" value={observed?.waterLevelPercent ?? null} unit="%" />
                  <StateMetric label="Temperature" value={observed?.temperatureC ?? null} unit="°C" />
                  <StateMetric label="Humidity" value={observed?.humidityPercent ?? null} unit="%" />
                  <StateMetric label="Feed weight (observed only)" value={simulation.feedWeight.observedGrams} unit="g" />
                </article>
                <article className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold text-slate-950">Horizon state · simulated</h2>
                    <span className="rounded-full border border-amber-400 bg-white px-3 py-1 text-xs font-bold text-amber-900">SIMULATION</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{simulation.input.horizonDays} days after the observed baseline · {formatDate(simulation.horizonEnd)}</p>
                  <StateMetric label="Feed level" value={simulation.feedLevel.projectedPercent} unit="%" basis={basisLabel(simulation.feedLevel.rateBasis)} />
                  <StateMetric label="Water level" value={simulation.waterLevel.projectedPercent} unit="%" basis={basisLabel(simulation.waterLevel.rateBasis)} />
                  <StateMetric label="Temperature" value={simulation.temperature.value} unit="°C" basis={basisLabel(simulation.temperature.basis)} />
                  <StateMetric label="Humidity" value={simulation.humidity.value} unit="%" basis={basisLabel(simulation.humidity.basis)} />
                  <p className="mt-3 border-t border-amber-200 pt-3 text-xs text-slate-700">{simulation.feedWeight.explanation}</p>
                </article>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-950">Change from observed baseline</h2>
                <p className="mt-1 text-sm text-slate-600">A change is shown only when both the observed value and simulated value are available.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Delta label="Feed level" value={simulation.feedLevel.changeFromObservedPercentagePoints} unit="percentage points" />
                  <Delta label="Water level" value={simulation.waterLevel.changeFromObservedPercentagePoints} unit="percentage points" />
                  <Delta label="Temperature" value={difference(observed?.temperatureC ?? null, simulation.temperature.value)} unit="°C" />
                  <Delta label="Humidity" value={difference(observed?.humidityPercent ?? null, simulation.humidity.value)} unit="percentage points" />
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-semibold text-slate-950">Baseline rule evaluation · derived, not persisted</h2>
                  <RiskList risks={simulation.baselineRisk} stage="baseline" />
                </article>
                <article className="rounded-2xl border-2 border-amber-400 bg-white p-5 shadow-sm">
                  <h2 className="font-semibold text-slate-950">Projected risks · simulation only</h2>
                  <RiskList risks={simulation.projectedRisk} stage="simulation" />
                </article>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-950">Risk comparison</h2>
                <p className="mt-1 text-sm text-slate-600">The same current prototype feed, water, and temperature thresholds are evaluated against observed and simulated states. This does not create or resolve an alert.</p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
                    <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><th className="py-2 pr-4">Rule</th><th className="py-2 pr-4">Observed baseline</th><th className="py-2 pr-4">Simulation</th><th className="py-2">Difference</th></tr></thead>
                    <tbody>{simulation.riskComparisons.map((comparison) => (
                      <tr className="border-b border-slate-100" key={comparison.alertType}>
                        <th className="py-3 pr-4 font-semibold text-slate-900">{comparison.title}</th>
                        <td className="py-3 pr-4 text-slate-700">{riskLabel(comparison.baseline)}{comparison.baselineValue === null ? "" : ` · ${comparison.baselineValue}${comparison.unit}`}</td>
                        <td className="py-3 pr-4 text-slate-700">{riskLabel(comparison.simulated)}{comparison.simulatedValue === null ? "" : ` · ${comparison.simulatedValue}${comparison.unit}`}</td>
                        <td className="py-3 text-slate-700">{comparison.change}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">Humidity is shown as a scenario condition but has no risk threshold in the current prototype. Feed/water percentage thresholds and temperature thresholds have not been validated for a species, farm, or sensor calibration.</p>
              </section>

              {baseline.persistedAlerts.length > 0 ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-semibold text-slate-950">Existing persisted alerts · read only</h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">{baseline.persistedAlerts.map((alert) => <li className="rounded-lg bg-slate-50 p-3" key={alert.id}>{alert.title} · {alert.severity} · {alert.status} · triggered {formatDate(alert.observedAt)}</li>)}</ul>
                  <p className="mt-2 text-xs text-slate-500">These Phase 3 records are shown as existing application data. Simulations do not modify them.</p>
                </section>
              ) : null}

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-950">Simulation limits</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">{simulation.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
              </section>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function Metric({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 text-lg font-semibold text-slate-950">{formatValue(value, unit)}</dd></div>;
}

function StateMetric({ label, value, unit, basis }: { label: string; value: number | null; unit: string; basis?: string }) {
  return <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2">
    <dt className="text-sm text-slate-700">{label}</dt>
    <dd className="text-right text-sm font-semibold text-slate-950">{formatValue(value, unit)}{basis ? <span className="block text-xs font-normal text-slate-500">{basis}</span> : null}</dd>
  </div>;
}

function Delta({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value === null ? "Unavailable" : `${value > 0 ? "+" : ""}${value.toFixed(1)} ${unit}`}</p></div>;
}

function difference(baseline: number | null, simulated: number | null) {
  return baseline === null || simulated === null ? null : simulated - baseline;
}

function RiskList({ risks, stage }: { risks: TwinRiskProjection[]; stage: "baseline" | "simulation" }) {
  const active = risks.filter((risk) => risk.level === "WARNING" || risk.level === "CRITICAL");
  if (active.length === 0) {
    const hasMissing = risks.some((risk) => risk.level === "UNAVAILABLE");
    return <p className="mt-3 text-sm leading-6 text-slate-600">{hasMissing ? "Some risk checks are unavailable because their input measurements are missing." : `No current prototype threshold is crossed by the available ${stage === "simulation" ? "scenario" : "observed"} values.`} This is not proof of safety.</p>;
  }
  return <ul className="mt-3 space-y-2">{active.map((risk) => <li className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm" key={risk.alertType}>
    <p className="font-semibold text-slate-900">{risk.title} · {risk.level}</p>
    <p className="mt-1 text-slate-700">{risk.value}{risk.unit} · configured prototype boundary {risk.thresholdValue}{risk.unit}</p>
    <p className="mt-1 text-xs text-slate-600">{risk.explanation}</p>
  </li>)}</ul>;
}

function HistoryContext({ history, range }: { history: TwinHistoryContext; range: TwinRange }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-slate-950">Observed history context · {range}</h2>
        <p className="text-xs text-slate-500">{history.readingCount.toLocaleString()} readings · {history.bucketCount} non-empty analytics buckets</p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Environmental history</h3>
          <p className="mt-2 text-sm text-slate-700">Temperature mean {formatValue(history.temperature.meanC, "°C")} · min {formatValue(history.temperature.minC, "°C")} · max {formatValue(history.temperature.maxC, "°C")} · {history.temperature.sampleCount} samples</p>
          <p className="mt-2 text-sm text-slate-700">Humidity mean {formatValue(history.humidity.meanPercent, "%")} · min {formatValue(history.humidity.minPercent, "%")} · max {formatValue(history.humidity.maxPercent, "%")} · {history.humidity.sampleCount} samples</p>
        </article>
        <article className="rounded-lg bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Measured changes across intervals</h3>
          <p className="mt-2 text-sm text-slate-700">Feed level: {formatValue(history.feedLevel.observedDecreasePercentagePoints, "percentage points")} decrease across {history.feedLevel.intervalCount} intervals · {history.feedLevel.increaseIntervalCount} increase/reset intervals.</p>
          <p className="mt-2 text-sm text-slate-700">Water level: {formatValue(history.waterLevel.observedDecreasePercentagePoints, "percentage points")} decrease across {history.waterLevel.intervalCount} intervals · {history.waterLevel.increaseIntervalCount} increase/reset intervals.</p>
          <p className="mt-2 text-sm text-slate-700">Feed weight: {formatValue(history.feedWeight.observedDecreaseGrams, "g")} observed decrease across {history.feedWeight.intervalCount} intervals · {history.feedWeight.increaseIntervalCount} increase/reset intervals.</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">These totals summarize Phase 4 interval outputs, not proven animal intake or calibrated water/feed consumption.</p>
        </article>
      </div>
    </section>
  );
}
