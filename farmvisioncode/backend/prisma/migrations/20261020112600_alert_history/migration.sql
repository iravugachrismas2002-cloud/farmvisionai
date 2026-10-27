-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('FEED_LOW', 'WATER_LOW', 'HIGH_TEMPERATURE');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AlertEventType" AS ENUM ('TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED', 'ESCALATED', 'SEVERITY_CHANGED');

-- CreateTable
CREATE TABLE "Alert" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "title" VARCHAR(120) NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "suggestedAction" VARCHAR(500) NOT NULL,
    "observedValue" DOUBLE PRECISION NOT NULL,
    "thresholdValue" DOUBLE PRECISION NOT NULL,
    "unit" VARCHAR(24) NOT NULL,
    "firstTriggeredAt" TIMESTAMPTZ(6) NOT NULL,
    "lastTriggeredAt" TIMESTAMPTZ(6) NOT NULL,
    "acknowledgedAt" TIMESTAMPTZ(6),
    "acknowledgedById" UUID,
    "resolvedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertEvent" (
    "id" UUID NOT NULL,
    "alertId" UUID NOT NULL,
    "eventType" "AlertEventType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "observedValue" DOUBLE PRECISION,
    "thresholdValue" DOUBLE PRECISION,
    "unit" VARCHAR(24),
    "actorId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_status_lastTriggeredAt_idx" ON "Alert"("status", "lastTriggeredAt");

-- CreateIndex
CREATE INDEX "Alert_deviceId_status_idx" ON "Alert"("deviceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_deviceId_type_key" ON "Alert"("deviceId", "type");

-- CreateIndex
CREATE INDEX "AlertEvent_alertId_createdAt_idx" ON "AlertEvent"("alertId", "createdAt");

-- CreateIndex
CREATE INDEX "AlertEvent_actorId_createdAt_idx" ON "AlertEvent"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
