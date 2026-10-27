"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FarmOption = { id: string; name: string };
type DeviceItem = {
  id: string;
  publicId: string;
  name: string;
  source: "HARDWARE" | "SIMULATOR";
  isEnabled: boolean;
  lastSeenAt?: string | null;
  farm: FarmOption;
};

export default function DevicesPage() {
  const [farms, setFarms] = useState<FarmOption[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [farmsRes, devicesRes] = await Promise.all([
          fetch("/api/farms", { credentials: "include" }),
          fetch("/api/devices", { credentials: "include" }),
        ]);

        if (!farmsRes.ok) {
          if (farmsRes.status === 401 || farmsRes.status === 403) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load farms");
        }

        if (!devicesRes.ok) {
          if (devicesRes.status === 401 || devicesRes.status === 403) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load devices");
        }

        if (cancelled) return;

        const farmsData = await farmsRes.json();
        const devicesData = await devicesRes.json();
        setFarms(farmsData.farms ?? []);
        setDevices(devicesData.devices ?? []);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">DEVICES</p>
          <h1>My Devices</h1>
          <p>Loading devices...</p>
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

      <section className="devices-page">
        <div className="dashboard-header">
          <h1>My Devices</h1>
          <p className="eyebrow">Manage your registered devices</p>
        </div>

        {farms.length === 0 ? (
          <div className="card empty-state">
            <p>No farms registered. Register a farm first to associate devices.</p>
            <Link href="/farms" className="primary-button">Go to Farms</Link>
          </div>
        ) : (
          <div>
            <Link
              href="/farms"
              className="secondary-button mb-4"
            >
              ← Back to Farms
            </Link>
            <p>
              {farms.length} farm{farms.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {devices.length === 0 ? (
          <div className="card empty-state">
            <p>
              No devices registered yet.{" "}
              <Link href="/api/devices/register" className="primary-button">
                Register Device
              </Link>
            </p>
            <p className="text-slate-500 text-xs">
              A device must be registered before it can report telemetry.
            </p>
          </div>
        ) : (
          <div className="devices-grid">
            {devices.map((device) => (
              <div key={device.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3>{device.name}</h3>
                    <p className="text-slate-500 text-xs">
                      {device.farm.name} ·{" "}
                      {device.source === "HARDWARE" ? "Hardware" : "Simulator"}
                    </p>
                    <p className="text-slate-500 text-xs">
                      ID: {device.publicId}
                    </p>
                  </div>
                  {device.isEnabled ? (
                    <span className="tag tag-enabled">Enabled</span>
                  ) : (
                    <span className="tag tag-disabled">Disabled</span>
                  )}
                  {device.lastSeenAt && (
                    <p className="text-slate-500 text-xs">
                      Last seen: {new Date(device.lastSeenAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/api/devices/register"
          className="primary-button mt-6"
        >
          Register New Device
        </Link>
      </section>
    </main>
  );
}