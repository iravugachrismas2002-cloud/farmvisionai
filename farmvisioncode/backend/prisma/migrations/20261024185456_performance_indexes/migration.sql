-- Performance indexes for hot query paths

-- Support listAlertsForOwner: joins Alert -> Device -> Farm -> User
CREATE INDEX IF NOT EXISTS "Alert_deviceId_status_lastTriggeredAt_idx" ON "Alert"("deviceId", "status", "lastTriggeredAt" DESC);

-- Support listDevicesForOwner: Device -> Farm -> ownerId ordering
CREATE INDEX IF NOT EXISTS "Device_farmId_isEnabled_createdAt_idx" ON "Device"("farmId", "isEnabled", "createdAt" DESC);

-- Support DeviceState latest-state queries and upsert conflict resolution
CREATE INDEX IF NOT EXISTS "DeviceState_deviceId_observedAt_idx" ON "DeviceState"("deviceId", "observedAt" DESC);

-- Support telemetry lookups by deviceId + receivedAt
CREATE INDEX IF NOT EXISTS "SensorReading_deviceId_receivedAt_idx" ON "SensorReading"("deviceId", "receivedAt" DESC);

-- Support alert event listing per alert
CREATE INDEX IF NOT EXISTS "AlertEvent_alertId_createdAt_idx" ON "AlertEvent"("alertId", "createdAt" DESC);

-- Support user lookup by email for auth
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Support userRole lookups by userId + role (hot path for authorization)
CREATE INDEX IF NOT EXISTS "UserRole_userId_role_idx" ON "UserRole"("userId", "role");
