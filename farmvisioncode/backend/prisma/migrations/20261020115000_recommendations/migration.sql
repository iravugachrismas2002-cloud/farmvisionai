-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('FEED_CHECK', 'WATER_CHECK', 'HEAT_RESPONSE');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" UUID NOT NULL,
    "alertId" UUID NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'OPEN',
    "title" VARCHAR(120) NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "suggestedAction" VARCHAR(500) NOT NULL,
    "observedValue" DOUBLE PRECISION NOT NULL,
    "thresholdValue" DOUBLE PRECISION NOT NULL,
    "unit" VARCHAR(24) NOT NULL,
    "observedAt" TIMESTAMPTZ(6) NOT NULL,
    "deviceSource" "DeviceSource" NOT NULL,
    "ruleVersion" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastGeneratedAt" TIMESTAMPTZ(6) NOT NULL,
    "acknowledgedAt" TIMESTAMPTZ(6),
    "acknowledgedById" UUID,
    "resolvedAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_alertId_key" ON "Recommendation"("alertId");

-- CreateIndex
CREATE INDEX "Recommendation_status_lastGeneratedAt_idx" ON "Recommendation"("status", "lastGeneratedAt");

-- CreateIndex
CREATE INDEX "Recommendation_type_status_idx" ON "Recommendation"("type", "status");

-- CreateIndex
CREATE INDEX "Recommendation_acknowledgedById_acknowledgedAt_idx" ON "Recommendation"("acknowledgedById", "acknowledgedAt");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
