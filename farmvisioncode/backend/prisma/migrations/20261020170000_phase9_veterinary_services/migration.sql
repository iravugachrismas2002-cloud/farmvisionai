-- Phase 9: Veterinary Services Platform
-- Adds VETERINARIAN role and veterinary provider, consent, and clinical-record models.
-- All changes are additive; no existing tables or data are modified.

ALTER TYPE "FarmVisionRole" ADD VALUE 'VETERINARIAN';

CREATE TYPE "VeterinaryProviderStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "FarmVeterinarianAccessStatus" AS ENUM ('PENDING', 'ACTIVE', 'DECLINED', 'REVOKED');
CREATE TYPE "FarmVeterinarianAccessEventType" AS ENUM ('REQUESTED', 'APPROVED', 'DECLINED', 'REVOKED');
CREATE TYPE "LivestockHealthStatus" AS ENUM ('HEALTHY', 'WATCH', 'UNDER_TREATMENT', 'RECOVERING');
CREATE TYPE "VaccinationStatus" AS ENUM ('SCHEDULED', 'ADMINISTERED', 'OVERDUE');
CREATE TYPE "DiseaseObservationStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'CONFIRMED', 'RESOLVED');
CREATE TYPE "HealthRiskRecommendationStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateTable
CREATE TABLE "VeterinaryProvider" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "clinicName" VARCHAR(160) NOT NULL,
    "licenseNumber" VARCHAR(80),
    "contactEmail" VARCHAR(320),
    "status" "VeterinaryProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "VeterinaryProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmVeterinarianAccess" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "veterinarianId" UUID NOT NULL,
    "status" "FarmVeterinarianAccessStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "FarmVeterinarianAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmVeterinarianAccessEvent" (
    "id" UUID NOT NULL,
    "accessId" UUID NOT NULL,
    "eventType" "FarmVeterinarianAccessEventType" NOT NULL,
    "actorId" UUID,
    "message" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmVeterinarianAccessEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivestockHealthRecord" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "animalId" VARCHAR(64) NOT NULL,
    "animalType" VARCHAR(40) NOT NULL,
    "breed" VARCHAR(80),
    "healthStatus" "LivestockHealthStatus" NOT NULL DEFAULT 'HEALTHY',
    "notes" VARCHAR(2000),
    "recordedById" UUID,
    "recordedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LivestockHealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccinationRecord" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "animalId" VARCHAR(64) NOT NULL,
    "vaccineName" VARCHAR(120) NOT NULL,
    "vaccineType" VARCHAR(80),
    "status" "VaccinationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "administeredAt" TIMESTAMPTZ(6),
    "administeredById" UUID,
    "nextDueAt" TIMESTAMPTZ(6),
    "batchNumber" VARCHAR(80),
    "notes" VARCHAR(2000),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "VaccinationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentRecord" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "animalId" VARCHAR(64) NOT NULL,
    "condition" VARCHAR(160) NOT NULL,
    "treatmentDescription" VARCHAR(2000) NOT NULL,
    "medication" VARCHAR(160),
    "dosageNote" VARCHAR(200),
    "administeredById" UUID,
    "administeredAt" TIMESTAMPTZ(6),
    "followUpAt" TIMESTAMPTZ(6),
    "outcome" VARCHAR(160),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TreatmentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseObservation" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "animalId" VARCHAR(64) NOT NULL,
    "suspectedDisease" VARCHAR(160) NOT NULL,
    "symptoms" VARCHAR(2000) NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "DiseaseObservationStatus" NOT NULL DEFAULT 'OPEN',
    "observedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observedById" UUID NOT NULL,
    "reportedToVeterinarianId" UUID,
    "veterinarianAssessment" VARCHAR(2000),
    "resolvedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DiseaseObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VeterinaryNote" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "body" VARCHAR(5000) NOT NULL,
    "evidence" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VeterinaryNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthRiskRecommendation" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "animalId" VARCHAR(64),
    "type" VARCHAR(64) NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "HealthRiskRecommendationStatus" NOT NULL DEFAULT 'OPEN',
    "title" VARCHAR(120) NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "suggestedAction" VARCHAR(500) NOT NULL,
    "createdById" UUID NOT NULL,
    "acknowledgedById" UUID,
    "resolvedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "HealthRiskRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VeterinaryProvider_userId_key" ON "VeterinaryProvider"("userId");
CREATE INDEX "VeterinaryProvider_status_updatedAt_idx" ON "VeterinaryProvider"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FarmVeterinarianAccess_farmId_veterinarianId_key" ON "FarmVeterinarianAccess"("farmId", "veterinarianId");
CREATE INDEX "FarmVeterinarianAccess_farmId_status_updatedAt_idx" ON "FarmVeterinarianAccess"("farmId", "status", "updatedAt");
CREATE INDEX "FarmVeterinarianAccess_veterinarianId_status_updatedAt_idx" ON "FarmVeterinarianAccess"("veterinarianId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "FarmVeterinarianAccessEvent_accessId_createdAt_idx" ON "FarmVeterinarianAccessEvent"("accessId", "createdAt");
CREATE INDEX "FarmVeterinarianAccessEvent_actorId_createdAt_idx" ON "FarmVeterinarianAccessEvent"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "LivestockHealthRecord_farmId_animalId_idx" ON "LivestockHealthRecord"("farmId", "animalId");
CREATE INDEX "LivestockHealthRecord_farmId_healthStatus_recordedAt_idx" ON "LivestockHealthRecord"("farmId", "healthStatus", "recordedAt");

-- CreateIndex
CREATE INDEX "VaccinationRecord_farmId_animalId_idx" ON "VaccinationRecord"("farmId", "animalId");
CREATE INDEX "VaccinationRecord_farmId_status_nextDueAt_idx" ON "VaccinationRecord"("farmId", "status", "nextDueAt");

-- CreateIndex
CREATE INDEX "TreatmentRecord_farmId_animalId_idx" ON "TreatmentRecord"("farmId", "animalId");
CREATE INDEX "TreatmentRecord_farmId_createdAt_idx" ON "TreatmentRecord"("farmId", "createdAt");

-- CreateIndex
CREATE INDEX "DiseaseObservation_farmId_status_observedAt_idx" ON "DiseaseObservation"("farmId", "status", "observedAt");
CREATE INDEX "DiseaseObservation_farmId_animalId_observedAt_idx" ON "DiseaseObservation"("farmId", "animalId", "observedAt");

-- CreateIndex
CREATE INDEX "VeterinaryNote_farmId_createdAt_idx" ON "VeterinaryNote"("farmId", "createdAt");
CREATE INDEX "VeterinaryNote_authorId_createdAt_idx" ON "VeterinaryNote"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "HealthRiskRecommendation_farmId_status_createdAt_idx" ON "HealthRiskRecommendation"("farmId", "status", "createdAt");
CREATE INDEX "HealthRiskRecommendation_farmId_type_status_idx" ON "HealthRiskRecommendation"("farmId", "type", "status");

-- AddForeignKey
ALTER TABLE "VeterinaryProvider" ADD CONSTRAINT "VeterinaryProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FarmVeterinarianAccess" ADD CONSTRAINT "FarmVeterinarianAccess_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FarmVeterinarianAccess" ADD CONSTRAINT "FarmVeterinarianAccess_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FarmVeterinarianAccessEvent" ADD CONSTRAINT "FarmVeterinarianAccessEvent_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "FarmVeterinarianAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FarmVeterinarianAccessEvent" ADD CONSTRAINT "FarmVeterinarianAccessEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LivestockHealthRecord" ADD CONSTRAINT "LivestockHealthRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LivestockHealthRecord" ADD CONSTRAINT "LivestockHealthRecord_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VaccinationRecord" ADD CONSTRAINT "VaccinationRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VaccinationRecord" ADD CONSTRAINT "VaccinationRecord_administeredById_fkey" FOREIGN KEY ("administeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TreatmentRecord" ADD CONSTRAINT "TreatmentRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TreatmentRecord" ADD CONSTRAINT "TreatmentRecord_administeredById_fkey" FOREIGN KEY ("administeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DiseaseObservation" ADD CONSTRAINT "DiseaseObservation_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiseaseObservation" ADD CONSTRAINT "DiseaseObservation_observedById_fkey" FOREIGN KEY ("observedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DiseaseObservation" ADD CONSTRAINT "DiseaseObservation_reportedToVeterinarianId_fkey" FOREIGN KEY ("reportedToVeterinarianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VeterinaryNote" ADD CONSTRAINT "VeterinaryNote_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VeterinaryNote" ADD CONSTRAINT "VeterinaryNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HealthRiskRecommendation" ADD CONSTRAINT "HealthRiskRecommendation_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HealthRiskRecommendation" ADD CONSTRAINT "HealthRiskRecommendation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HealthRiskRecommendation" ADD CONSTRAINT "HealthRiskRecommendation_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;