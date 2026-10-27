"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type VetProfile = {
  id: string;
  name: string;
  specialization:
    | "SMALL_ANIMAL"
    | "LARGE_ANIMAL"
    | "POULTRY"
    | "SWINE"
    | "EQINE"
    | "PUBLIC_HEALTH";
  yearsExperience: number;
  farmId?: string;
  isAvailable: boolean;
  rating: number;
  totalConsultations: number;
  createdAt: string;
  updatedAt: string;
};

type Appointment = {
  id: string;
  vetId: string;
  farmerId: string;
  farmId: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  reason: string;
  createdAt: string;
  updatedAt: string;
};

type MedicalRecord = {
  id: string;
  appointmentId: string;
  vetId: string;
  farmerId: string;
  farmId: string;
  title: string;
  description: string;
  observations: string;
  diagnosedConditions: string[];
  recommendedActions: string[];
  createdAt: string;
  updatedAt: string;
};

type ConsentRecord = {
  id: string;
  farmerId: string;
  vetId: string;
  scope:
    | "MEDICAL_RECORDS"
    | "DATA_SHARING"
    | "CONSULTATION_NOTES"
    | "TELEMEDICINE";
  status: "PENDING" | "GRANTED" | "WITHDRAWN";
  grantedAt?: string;
  revokedAt?: string;
  createdAt: string;
};

type AvailableTimeSlot = {
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

function getVetStatusClass(isAvailable: boolean): string {
  return isAvailable ? "vet-status available" : "vet-status unavailable";
}

function getConsentStatusClass(status: ConsentRecord["status"]): string {
  return `consent-status ${status}`;
}

export default function VeterinaryPage() {
  const [vetProfiles, setVetProfiles] = useState<VetProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Appointment["status"] | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [vetsRes, appointmentsRes, recordsRes, consentRes] = await Promise.all([
          fetch("/api/vets", { credentials: "include" }),
          fetch("/api/appointments", { credentials: "include" }),
          fetch("/api/medical-records", { credentials: "include" }),
          fetch("/api/consents", { credentials: "include" }),
        ]);

        if (!vetsRes.ok && cancelled === false) {
          if (vetsRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load veterinarians");
        }

        if (!appointmentsRes.ok && cancelled === false) {
          if (appointmentsRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load appointments");
        }

        if (!recordsRes.ok && cancelled === false) {
          if (recordsRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load medical records");
        }

        if (!consentRes.ok && cancelled === false) {
          if (consentRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load consent records");
        }

        if (cancelled) return;

        const vetsData = await vetsRes.json();
        const appointmentsData = await appointmentsRes.json();
        const recordsData = await recordsRes.json();
        const consentData = await consentRes.json();

        if (cancelled) return;

        setVetProfiles(vetsData.vets ?? []);
        setAppointments(appointmentsData.appointments ?? []);
        setMedicalRecords(recordsData.records ?? []);
        setConsentRecords(consentData.consents ?? []);
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
          <p className="eyebrow">VETERINARY PLATFORM</p>
          <h1>Veterinary Services</h1>
          <p>Loading veterinary data...</p>
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

  // Filter appointments
  const filteredAppointments = appointments.filter(
    (a) => !filterStatus || a.status === filterStatus,
  );

  // Compute stats
  const totalVets = vetProfiles.length;
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(
    (a) => a.status === "COMPLETED",
  ).length;
  const pendingConsents = consentRecords.filter(
    (c) => c.status === "PENDING",
  ).length;

  // Available vets (available = true)
  const availableVets = vetProfiles.filter((v) => v.isAvailable);

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
          <h1>Veterinary Platform</h1>
          <p className="eyebrow">Animal Health & Consultations</p>
        </div>

        <div className="summary-section">
          <div className="summary-grid">
            <div className="summary-card">
              <strong>{totalVets}</strong>
              <p>Veterinarians</p>
            </div>
            <div className="summary-card">
              <strong>{totalAppointments}</strong>
              <p>Appointments</p>
            </div>
            <div className="summary-card">
              <strong>{completedAppointments}</strong>
              <p>Completed</p>
            </div>
            <div className="summary-card">
              <strong>{availableVets.length}</strong>
              <p>Available</p>
            </div>
            <div className="summary-card">
              <strong>{pendingConsents}</strong>
              <p>Consent pending</p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="action-cards-section">
            <h3>Quick Actions</h3>
            <div className="action-cards-grid">
              <div className="action-card">
                <Link href="/vets" className="action-card-link">
                  <span className="action-card-icon">👨‍⚕️</span>
                  <span>Veterinarians</span>
                </Link>
              </div>
              <div className="action-card">
                <Link href="/appointments" className="action-card-link">
                  <span className="action-card-icon">📅</span>
                  <span>Appointments</span>
                </Link>
              </div>
              <div className="action-card">
                <Link href="/medical-records" className="action-card-link">
                  <span className="action-card-icon">📋</span>
                  <span>Medical Records</span>
                </Link>
              </div>
              <div className="action-card">
                <Link href="/consents" className="action-card-link">
                  <span className="action-card-icon">📝</span>
                  <span>Consent Management</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Veterinarians Section */}
        <div className="vets-section">
          <h3>Veterinarians <span className="badge">{totalVets}</span></h3>
          {totalVets === 0 ? (
            <p>No veterinarians registered yet. Add vet profiles to get started.</p>
          ) : (
            <div className="vets-grid">
              {vetProfiles.map((vet) => (
                <div key={vet.id} className="vet-card">
                  <div className="vet-header">
                    <strong>{vet.name}</strong>
                    <span className="vet-specialization">
                      {vet.specialization}
                    </span>
                  </div>
                  <div className={getVetStatusClass(vet.isAvailable)}>
                    {vet.isAvailable ? "Available" : "Unavailable"}
                  </div>
                  {!vet.isAvailable && (
                    <p className="vet-unavailable-reason">
                      Not currently accepting appointments
                    </p>
                  )}
                  <Link
                    href={`/vet/${vet.id}`}
                    className="vet-link"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointments Section */}
        <div className="appointments-section">
          <h3>Appointments <span className="badge">{totalAppointments}</span></h3>
          {appointments.length === 0 ? (
            <p>No appointments scheduled. Request a consultation with a veterinarian.</p>
          ) : (
            <div className="appointments-list">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <strong>{appointment.title}</strong>
                    <span className="appointment-status">
                      {appointment.status}
                    </span>
                  </div>
                  <div className="appointment-meta">
                    <span className="vet-name">
                      Dr.{
                        vetProfiles.find((v) => v.id === appointment.vetId)?.name ||
                        "Unknown"
                      }
                    </span>
                    <span className="farm-name">
                      Farm: {appointment.farmId}
                    </span>
                  </div>
                  <p className="appointment-reason">
                    {appointment.reason}
                  </p>
                  <div className="appointment-actions">
                    {appointment.status === "PENDING" && (
                      <button
                        className="btn-appointment confirm"
                        onClick={() =>
                          window.location.href = `/appointment/confirm/${appointment.id}`
                        }
                      >
                        Confirm
                      </button>
                    )}
                    {appointment.status === "CONFIRMED" && (
                      <button
                        className="btn-appointment in-progress"
                        onClick={() =>
                          window.location.href = `/appointment/in-progress/${appointment.id}`
                        }
                      >
                        In Progress
                      </button>
                    )}
                    {appointment.status === "COMPLETED" && (
                      <button
                        className="btn-appointment completed"
                        disabled
                      >
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medical Records Section */}
        <div className="medical-records-section">
          <h3>Medical Records <span className="badge">
            {medicalRecords.length}
          </span></h3>
          {medicalRecords.length === 0 ? (
            <p>No medical records yet. Consultations will generate records.</p>
          ) : (
            <div className="records-list">
              {medicalRecords.map((record) => (
                <div key={record.id} className="record-card">
                  <div className="record-header">
                    <strong>{record.title}</strong>
                    <span className="record-appointment">
                      Appointment: {record.appointmentId}
                    </span>
                  </div>
                  <p className="record-description">
                    {record.description}
                  </p>
                  <div className="record-observations">
                    <strong>Observations:</strong> {record.observations}
                  </div>
                  <div className="record-diagnoses">
                    <strong>Diagnosed conditions:</strong>{" "}
                    {record.diagnosedConditions.map((cond, i) => (
                      <span key={i} className="diagnosis-tag">
                        {cond}
                      </span>
                    ))}
                  </div>
                  <div className="record-recommendations">
                    <strong>Recommended actions:</strong>{" "}
                    {record.recommendedActions.map((action, i) => (
                      <span key={i} className="recommendation-tag">
                        {action}
                      </span>
                    ))}
                  </div>
                  <span className="record-date">
                    Created: {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consent Management Section */}
        <div className="consent-section">
          <h3>Consent Management <span className="badge">
            {pendingConsents} pending
          </span></h3>
          {consentRecords.length === 0 ? (
            <p>No consent records yet. Request consent to access medical records and share data.</p>
          ) : (
            <div className="consents-list">
              {consentRecords.map((consent) => (
                <div key={consent.id} className="consent-card">
                  <div className={getConsentStatusClass(consent.status)}>
                    <strong>{consent.scope}</strong>
                    <span>{consent.status}</span>
                  </div>
                  <p className="consent-description">
                    {consent.scope} access{" "}{"granted" in consent ? "granted" : "pending"}
                  </p>
                  {consent.status === "PENDING" && (
                    <div className="consent-actions">
                      <button
                        className="btn-consent grant"
                        onClick={() =>
                          window.location.href = `/consent/grant/${consent.id}`
                        }
                      >
                        Grant
                      </button>
                      <button
                        className="btn-consent decline"
                        onClick={() =>
                          window.location.href = `/consent/decline/${consent.id}`
                        }
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  <span className="consent-date">
                    Created: {new Date(consent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="create-consent-btn">
            <Link href="/consent/request" className="primary-button-small">
              Request Consent
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}