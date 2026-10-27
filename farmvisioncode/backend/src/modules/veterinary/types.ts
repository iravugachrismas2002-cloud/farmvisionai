export type VeterinaryActor = {
  userId: string;
  roles: readonly string[];
};

export type VeterinaryProviderStatus = "ACTIVE" | "SUSPENDED";

export type FarmVeterinarianAccessStatus =
  | "PENDING"
  | "ACTIVE"
  | "DECLINED"
  | "REVOKED";

export type FarmVeterinarianAccessEventType =
  | "REQUESTED"
  | "APPROVED"
  | "DECLINED"
  | "REVOKED";

export type LivestockHealthStatus =
  | "HEALTHY"
  | "WATCH"
  | "UNDER_TREATMENT"
  | "RECOVERING";

export type VaccinationStatus = "SCHEDULED" | "ADMINISTERED" | "OVERDUE";

export type DiseaseObservationStatus =
  | "OPEN"
  | "UNDER_INVESTIGATION"
  | "CONFIRMED"
  | "RESOLVED";

export type HealthRiskRecommendationStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "RESOLVED";

export interface VeterinaryProviderSummary {
  id: string;
  userId: string;
  clinicName: string;
  licenseNumber: string | null;
  contactEmail: string | null;
  status: VeterinaryProviderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LivestockHealthRecordSummary {
  id: string;
  farmId: string;
  animalId: string;
  animalType: string;
  breed: string | null;
  healthStatus: LivestockHealthStatus;
  notes: string | null;
  recordedById: string | null;
  recordedAt: string;
  updatedAt: string;
}

export interface VaccinationRecordSummary {
  id: string;
  farmId: string;
  animalId: string;
  vaccineName: string;
  vaccineType: string | null;
  status: VaccinationStatus;
  administeredAt: string | null;
  administeredById: string | null;
  nextDueAt: string | null;
  batchNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentRecordSummary {
  id: string;
  farmId: string;
  animalId: string;
  condition: string;
  treatmentDescription: string;
  medication: string | null;
  dosageNote: string | null;
  administeredById: string | null;
  administeredAt: string | null;
  followUpAt: string | null;
  outcome: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiseaseObservationSummary {
  id: string;
  farmId: string;
  animalId: string;
  suspectedDisease: string;
  symptoms: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: DiseaseObservationStatus;
  observedAt: string;
  observedById: string;
  reportedToVeterinarianId: string | null;
  veterinarianAssessment: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VeterinaryNoteSummary {
  id: string;
  farmId: string;
  authorId: string;
  title: string;
  body: string;
  evidence: unknown;
  createdAt: string;
}

export interface HealthRiskRecommendationSummary {
  id: string;
  farmId: string;
  animalId: string | null;
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: HealthRiskRecommendationStatus;
  title: string;
  reason: string;
  suggestedAction: string;
  createdById: string;
  acknowledgedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FarmVeterinarianAccessSummary {
  id: string;
  farmId: string;
  veterinarianId: string;
  status: FarmVeterinarianAccessStatus;
  requestedAt: string;
  decidedAt: string | null;
  revokedAt: string | null;
  updatedAt: string;
}