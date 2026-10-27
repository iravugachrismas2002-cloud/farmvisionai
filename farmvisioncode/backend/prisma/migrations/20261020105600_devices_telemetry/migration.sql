-- CreateEnum
CREATE TYPE "DeviceSource" AS ENUM ('HARDWARE', 'SIMULATOR');

-- CreateTable
CREATE TABLE "Device" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "publicId" VARCHAR(64) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "credentialHash" CHAR(64) NOT NULL,
    "source" "DeviceSource" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMPTZ(6),

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "messageId" VARCHAR(128) NOT NULL,
    "observedAt" TIMESTAMPTZ(6) NOT NULL,
    "receivedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "DeviceSource" NOT NULL,
    "temperatureC" DOUBLE PRECISION,
    "humidityPercent" DOUBLE PRECISION,
    "feedLevelPercent" DOUBLE PRECISION,
    "waterLevelPercent" DOUBLE PRECISION,
    "feedWeightGrams" DOUBLE PRECISION,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceState" (
    "deviceId" UUID NOT NULL,
    "observedAt" TIMESTAMPTZ(6) NOT NULL,
    "source" "DeviceSource" NOT NULL,
    "temperatureC" DOUBLE PRECISION,
    "humidityPercent" DOUBLE PRECISION,
    "feedLevelPercent" DOUBLE PRECISION,
    "waterLevelPercent" DOUBLE PRECISION,
    "feedWeightGrams" DOUBLE PRECISION,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DeviceState_pkey" PRIMARY KEY ("deviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_publicId_key" ON "Device"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_credentialHash_key" ON "Device"("credentialHash");

-- CreateIndex
CREATE INDEX "Device_farmId_createdAt_idx" ON "Device"("farmId", "createdAt");

-- CreateIndex
CREATE INDEX "SensorReading_deviceId_observedAt_idx" ON "SensorReading"("deviceId", "observedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SensorReading_deviceId_messageId_key" ON "SensorReading"("deviceId", "messageId");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceState" ADD CONSTRAINT "DeviceState_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
