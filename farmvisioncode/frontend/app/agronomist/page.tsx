"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Farm = {
  id: string;
  name: string;
  locationLabel?: string;
  createdAt?: string;
};

type AdvisoryNote = {
  id: string;
  farmId: string;
  agronomistId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type RecommendationReview = {
  id: string;
  recommendationId: string;
  agronomistId: string;
  farmerId: string;
  status: "PENDING" | "APPROVED" | "CHANGES_REQUESTED" | "NOT_RECOMMENDED" | "ACCEPTED_BY_FARMER" | "DECLINED_BY_FARMER";
  createdAt: string;
  updatedAt: string;
  message?: string;
};

type FarmAccessRequest = {
  id: string;
  farmId: string;
  agronomistId: string;
  farmerId: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "REVOKED";
  requestedAt: string;
  decidedAt?: string;
  message?: string;
};

type ActiveFarm = {
  id: string;
  name: string;
  publicId: string;
  locationLabel?: string;
  deviceCount: number;
  lastSeenAt?: string;
};

export default function AgronomistPage() {
  const [farms, setFarms] = useState<ActiveFarm[]>([]);
  const [accessRequests, setAccessRequests] = useState<FarmAccessRequest[]>([]);
  const [advisoryNotes, setAdvisoryNotes] = useState<AdvisoryNote[]>([]);
  const [recommendationReviews, setRecommendationReviews] = useState<RecommendationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [farmsRes, accessRes, notesRes, reviewsRes] = await Promise.all([
          fetch("/api/farms", { credentials: "include" }),
          fetch("/api/access-requests", { credentials: "include" }),
          fetch("/api/advisory-notes", { credentials: "include" }),
          fetch("/api/recommendation-reviews", { credentials: "include" }),
        ]);

        if (!farmsRes.ok && cancelled === false) {
          if (farmsRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load farms");
        }

        if (!accessRes.ok && cancelled === false) {
          if (accessRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load access requests");
        }

        if (!notesRes.ok && cancelled === false) {
          if (notesRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load advisory notes");
        }

        if (!reviewsRes.ok && cancelled === false) {
          if (reviewsRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load recommendation reviews");
        }

        if (cancelled) return;

        const farmsData = await farmsRes.json();
        const accessData = await accessRes.json();
        const notesData = await notesRes.json();
        const reviewsData = await reviewsRes.json();

        if (cancelled) return;

        setFarms(farmsData.farms ?? []);
        setAccessRequests(accessData.requests ?? []);
        setAdvisoryNotes(notesData.notes ?? []);
        setRecommendationReviews(reviewsData.reviews ?? []);
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
          <p className="eyebrow">AGRONOMIST DASHBOARD</p>
          <h1>Dashboard</h1>
          <p>Loading agronomist data...</p>
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

  // Compute summary stats
  const pendingAccessRequests = accessRequests.filter(
    (a) => a.status === "PENDING",
  ).length;
  // Count all access requests (status comes from FarmAdvisorAccessStatus: PENDING | ACTIVE | DECLINED | REVOKED)
  const totalAccessRequests = accessRequests.length;
  const activeFarms = farms.filter((f) => f.deviceCount > 0);
  const totalAdvisoryNotes = advisoryNotes.length;
  const pendingReviews = recommendationReviews.filter(
    (r) => r.status === "PENDING",
  ).length;

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
          <Link className="nav-login" href="/api/auth/logout">Sign out</Link>
        </div>
      </nav>

      <section className="dashboard-page">
        <div className="dashboard-header">
          <h1>Agri‑Vision Dashboard</h1>
          <p className="eyebrow">Agronomist Overview</p>
        </div>

        <div className="summary-section">
          <div className="summary-grid">
            <div className="summary-card">
              <h3>Managed Farms</h3>
              <p>{activeFarms.length} farms with active devices</p>
            </div>

            <div className="summary-card">
              <h3>Access Requests</h3>
              <p>
                {pendingAccessRequests} pending {" "}{pendingAccessRequests !== 1 ? "requests" : "request"}
              </p>
              <p>
                {totalAccessRequests} total requests
              </p>
            </div>

            <div className="summary-card">
              <h3>Advisory Notes</h3>
              <p>{totalAdvisoryNotes} notes</p>
            </div>

            <div className="summary-card">
              <h3>Recommendation Reviews</h3>
              <p>
                {pendingReviews} pending review
              </p>
            </div>
          </div>

          {/* Action Cards Section */}
          <div className="action-cards-section">
            <h3>Quick Actions</h3>
            <div className="action-cards-grid">
              <div className="action-card">
                <Link href="/api/access-requests" className="action-card-link">
                  <span className="action-card-icon">📋</span>
                  <span>Access Requests</span>
                  <span className="badge badge-primary">{pendingAccessRequests}</span>
                </Link>
              </div>

              <div className="action-card">
                <Link href="/managed-farms" className="action-card-link">
                  <span className="action-card-icon">🚜</span>
                  <span>Managed Farms</span>
                  <span className="badge badge-primary">{activeFarms.length}</span>
                </Link>
              </div>

              <div className="action-card">
                <Link href="/recommendation-reviews" className="action-card-link">
                  <span className="action-card-icon">💡</span>
                  <span>Recommendation Reviews</span>
                  <span className="badge badge-primary">{pendingReviews}</span>
                </Link>
              </div>

              <div className="action-card">
                <Link href="/advisory-notes" className="action-card-link">
                  <span className="action-card-icon">📝</span>
                  <span>Advisory Notes</span>
                  <span className="badge badge-primary">{totalAdvisoryNotes}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Access Requests Section */}
        <div className="access-requests-section">
          <h3>Access Requests <span className="section-badge">{pendingAccessRequests} pending</span></h3>
          {accessRequests.length === 0 ? (
            <p>No access requests at this time.</p>
          ) : (
            <div className="access-requests-list">
              {accessRequests.map((request) => (
                <div key={request.id} className="access-request-item">
                  <div className="request-info">
                    <strong>Farm:</strong> {request.farmId}
                    <br />
                    <strong>From Farmer:</strong> {request.farmerId}
                  </div>
                  <div className="request-status">
                    <span
                      className={
                        request.status === "PENDING"
                          ? "status-badge status-pending"
                          : request.status === "APPROVED"
                          ? "status-badge status-approved"
                          : "status-badge status-declined"
                      }
                    >
                      {request.status}
                    </span>
                  </div>
                  {request.message && (
                    <p className="request-message">{request.message}</p>
                  )}
                  <div className="request-actions">
                    {request.status === "PENDING" && (
                      <>
                        <button
                          className="btn-mini approve-btn"
                          onClick={() =>
                            window.location.href = `/agronomist/approve-access/${request.id}`
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="btn-mini decline-btn"
                          onClick={() =>
                            window.location.href = `/agronomist/decline-access/${request.id}`
                          }
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Managed Farms Section */}
        <div className="managed-farms-section">
          <h3>Managed Farms</h3>
          {farms.length === 0 ? (
            <p>No farms under your management yet. Request access or wait for approvals.</p>
          ) : (
            <div className="farms-grid">
              {farms.map((farm) => (
                <div key={farm.id} className="farm-card">
                  <div className="farm-header">
                    <strong>{farm.name}</strong>
                    {farm.locationLabel && (
                      <span className="farm-label">{farm.locationLabel}</span>
                    )}
                  </div>
                  <div className="farm-details">
                    <span className="device-count">
                      {farm.deviceCount} device{farm.deviceCount !== 1 ? "s" : ""} connected
                    </span>
                    {farm.lastSeenAt && (
                      <span className="last-seen">
                        Last seen: {new Date(farm.lastSeenAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/agronomist/farm/${farm.id}`}
                    className="farm-link"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advisory Notes Section */}
        <div className="advisory-notes-section">
          <h3>Advisory Notes</h3>
          {advisoryNotes.length === 0 ? (
            <p>No advisory notes yet. Create your first note for a managed farm.</p>
          ) : (
            <div className="notes-list">
              {advisoryNotes.map((note) => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <strong>{note.title}</strong>
                    <span className="note-farm">Farm: {note.farmId}</span>
                  </div>
                  <p className="note-body">{note.body}</p>
                  <span className="note-date">
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="create-note-btn">
            <Link href="/agronomist/create-note" className="primary-button-small">
              Create New Note
            </Link>
          </div>
        </div>

        {/* Recommendation Reviews Section */}
        <div className="recommendation-reviews-section">
          <h3>Recommendation Reviews <span className="section-badge">
            {pendingReviews} pending
          </span></h3>
          {recommendationReviews.length === 0 ? (
            <p>No recommendation reviews at this time.</p>
          ) : (
            <div className="reviews-list">
              {recommendationReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <strong>Recommendation:</strong> {review.recommendationId}
                    <span className="review-status">
                      {review.status}
                    </span>
                  </div>
                  <p className="review-message">
                    {review.message || "No message submitted."}
                  </p>
                  <span className="review-date">
                    Created: {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  {review.status === "PENDING" && (
                    <div className="review-actions">
                      <button
                        className="btn-review approve"
                        onClick={() =>
                          window.location.href = `/agronomist/approve-review/${review.id}`
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="btn-review request-changes"
                        onClick={() =>
                          window.location.href = `/agronomist/request-changes/${review.id}`
                        }
                      >
                        Request Changes
                      </button>
                      <button
                        className="btn-review decline"
                        onClick={() =>
                          window.location.href = `/agronomist/decline-review/${review.id}`
                        }
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}