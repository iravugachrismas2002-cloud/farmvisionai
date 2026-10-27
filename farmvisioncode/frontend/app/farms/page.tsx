"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Farm = {
  id: string;
  name: string;
  locationLabel?: string;
  createdAt?: string;
};

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchFarms() {
      try {
        const res = await fetch("/api/farms", {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load farms");
        }

        if (cancelled) return;

        const data = await res.json();
        setFarms(data.farms ?? []);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setLoading(false);
      }
    }

    fetchFarms();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">FARMS</p>
          <h1>My Farms</h1>
          <p>Loading farms...</p>
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

      <section className="farms-page">
        <div className="dashboard-header">
          <h1>My Farms</h1>
          <p className="eyebrow">Manage your farms and associated devices</p>
        </div>

        {farms.length === 0 ? (
          <div className="card empty-state">
            <p>No farms registered yet.</p>
            <Link href="/api/farms" className="primary-button mt-4">
              Create First Farm
            </Link>
          </div>
        ) : (
          <div className="farms-grid">
            {farms.map((farm) => (
              <div key={farm.id} className="card">
                <h3>{farm.name}</h3>
                {farm.locationLabel && (
                  <p className="text-slate-600 text-sm">{farm.locationLabel}</p>
                )}
                <p className="text-slate-500 text-xs">
                  Created {new Date(farm.createdAt ?? Date.now()).toLocaleDateString()}
                </p>
                <Link
                  href={`/devices?farmId=${farm.id}`}
                  className="secondary-button text-sm"
                >
                  View Devices
                </Link>
              </div>
            ))}
          </div>
        )}

        <Link href="/api/farms/create" className="primary-button mt-6">
          Create New Farm
        </Link>
      </section>
    </main>
  );
}