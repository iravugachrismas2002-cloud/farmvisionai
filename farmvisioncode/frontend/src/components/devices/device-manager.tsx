"use client";

import { useState, type FormEvent } from "react";

type FarmOption = { id: string; name: string };
type DeviceItem = {
  id: string;
  publicId: string;
  name: string;
  source: "HARDWARE" | "SIMULATOR";
  isEnabled: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  farm: FarmOption;
  latestState: {
    observedAt: string;
    source: "HARDWARE" | "SIMULATOR";
    temperatureC: number | null;
    humidityPercent: number | null;
    feedLevelPercent: number | null;
    waterLevelPercent: number | null;
    feedWeightGrams: number | null;
  } | null;
};

type ProvisionedDevice = {
  device: Omit<DeviceItem, "lastSeenAt" | "latestState">;
  token: string;
};

const inputClass = "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

export function DeviceManager({ farms, initialDevices }: { farms: FarmOption[]; initialDevices: DeviceItem[] }) {
  const [devices, setDevices] = useState(initialDevices);
  const [farmId, setFarmId] = useState(farms[0]?.id ?? "");
  const [name, setName] = useState("");
  const [source, setSource] = useState<"HARDWARE" | "SIMULATOR">("HARDWARE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(false);
    setNewToken(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId, name, source }),
      });
      const result = (await response.json()) as ProvisionedDevice & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Device registration failed.");
      setDevices((current) => [{ ...result.device, lastSeenAt: null, latestState: null }, ...current]);
      setNewToken(result.token);
      setName("");
      setMessage("Device registered. Copy its token now; FarmVision will not show it again.");
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : "Device registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function revoke(device: DeviceItem) {
    if (!window.confirm(`Disable ${device.name}? It will no longer be able to submit telemetry.`)) return;
    setMessage(null);
    setError(false);
    try {
      const response = await fetch(`/api/devices/${encodeURIComponent(device.id)}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Device could not be disabled.");
      setDevices((current) => current.map((item) => item.id === device.id ? { ...item, isEnabled: false } : item));
      setMessage(`${device.name} has been disabled.`);
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : "Device could not be disabled.");
    }
  }

  return (
    <div className="space-y-8">
      {farms.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-slate-600">Register a farm before associating a device.</p>
      ) : (
        <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2" onSubmit={register}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="device-name">Device name</label>
            <input className={inputClass} id="device-name" maxLength={120} onChange={(event) => setName(event.target.value)} required value={name} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="device-farm">Associated farm</label>
            <select className={inputClass} id="device-farm" onChange={(event) => setFarmId(event.target.value)} required value={farmId}>
              {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="device-source">Device source</label>
            <select className={inputClass} id="device-source" onChange={(event) => setSource(event.target.value as "HARDWARE" | "SIMULATOR")} value={source}>
              <option value="HARDWARE">Hardware device</option>
              <option value="SIMULATOR">Simulator (clearly labelled)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="min-h-11 rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white hover:bg-emerald-900 disabled:opacity-60" disabled={isSubmitting || farms.length === 0} type="submit">
              {isSubmitting ? "Registering…" : "Register device"}
            </button>
          </div>
        </form>
      )}

      {newToken ? (
        <section aria-labelledby="device-token-heading" className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-950" id="device-token-heading">Copy this device token now</h2>
          <p className="text-sm leading-6 text-amber-900">It is shown only once. Store it securely in the device’s configuration; do not commit it to firmware source code or share it publicly.</p>
          <code className="block break-all rounded-lg bg-white p-3 text-sm text-slate-900">{newToken}</code>
          <button className="rounded-lg border border-amber-700 px-3 py-2 text-sm font-semibold text-amber-950" onClick={() => void navigator.clipboard.writeText(newToken)} type="button">Copy token</button>
          <p className="break-all text-xs text-amber-900">Device ID: {devices[0]?.publicId}</p>
        </section>
      ) : null}

      {message ? <p className={error ? "text-sm text-red-700" : "text-sm text-emerald-800"} role={error ? "alert" : "status"}>{message}</p> : null}

      <section aria-labelledby="registered-devices-heading" className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950" id="registered-devices-heading">Registered devices</h2>
        {devices.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-slate-600">No devices registered. Telemetry will appear here after a device is provisioned and reports data.</p> : (
          <ul className="space-y-4">
            {devices.map((device) => (
              <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={device.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">{device.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{device.farm.name} · {device.source === "HARDWARE" ? "Hardware" : "Simulator"} · ID <code>{device.publicId}</code></p>
                    <p className="mt-1 text-xs text-slate-500">{device.isEnabled ? "Enabled" : "Disabled"}{device.lastSeenAt ? ` · Last report received ${new Date(device.lastSeenAt).toLocaleString()}` : " · No telemetry received"}</p>
                  </div>
                  {device.isEnabled ? <button className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-50" onClick={() => void revoke(device)} type="button">Disable device</button> : null}
                </div>
                {device.latestState ? (
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
                    {([ ["Temperature", device.latestState.temperatureC, "°C"], ["Humidity", device.latestState.humidityPercent, "%"], ["Feed level", device.latestState.feedLevelPercent, "%"], ["Water level", device.latestState.waterLevelPercent, "%"], ["Feed weight", device.latestState.feedWeightGrams, "g"] ] as const).filter(([, value]) => value !== null).map(([label, value, unit]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="font-medium text-slate-900">{value}{unit}</dd></div>)}
                    <p className="col-span-full text-xs text-slate-500">Observed {new Date(device.latestState.observedAt).toLocaleString()} · {device.latestState.source === "SIMULATOR" ? "Simulated" : "Hardware-reported"}</p>
                  </dl>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="font-semibold text-slate-950">Proposed REST telemetry contract (not yet confirmed with firmware)</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">Send a POST to <code>/api/telemetry</code> over HTTPS with <code>Authorization: Bearer &lt;device-token&gt;</code>. Include a unique <code>messageId</code> for retry-safe de-duplication and an ISO-8601 timestamp with an explicit UTC offset. The device ID and sensor field names below must be agreed with the hardware teammate before firmware integration.</p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">{`{\n  "schemaVersion": 1,\n  "deviceId": "fv_…",\n  "messageId": "unique-per-device-message",\n  "timestamp": "2026-10-20T10:00:00Z",\n  "temperatureC": 32,\n  "humidityPercent": 85,\n  "feedLevelPercent": 15,\n  "waterLevelPercent": 20,\n  "feedWeightGrams": 1200\n}`}</pre>
      </section>
    </div>
  );
}
