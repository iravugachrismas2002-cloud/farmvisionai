import { Pool } from "pg";
import { randomUUID } from "crypto";

/**
 * FarmVision AI — Post-migration persistence verification.
 *
 * Exercises migrations 1–8 modules:
 *   3 Account, 4 Farm, 5 Device, 6 Telemetry, 7 Alerts,
 *   8 Recommendations, 9 Advisory, 10 Marketplace,
 *   11 Ownership isolation, 12 Multi-role behavior.
 *
 * Every camelCase identifier is double-quoted: PostgreSQL folds unquoted
 * identifiers to lowercase, but this schema uses case-sensitive quoted columns.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("FATAL: DATABASE_URL is not configured in .env");
  process.exit(1);
}

const pool = new Pool({ connectionString });

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ✅ PASS: ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed += 1;
    console.error(`  ❌ FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
    process.exitCode = 1;
  }
}

async function main() {
  const client = await pool.connect();
  try {
    console.log("\n🔐 FarmVision AI — persistence verification against farmvision_dev\n");

    const uidA = randomUUID();
    const uidB = randomUUID();
    const openIdA = `fv_verify_owner_${Date.now()}`;
    const openIdB = `fv_verify_isolate_${Date.now()}`;

    console.log("\n[3] Account persistence");
    await client.query(
      `INSERT INTO "User" ("id", "openId", "name", "email", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, now(), now())`,
      [uidA, openIdA, "Farm Owner", "owner@example.com"]
    );
    await client.query(
      `INSERT INTO "UserRole" ("userId", "role", "assignedAt")
       VALUES ($1, $2, now()), ($1, $3, now())`,
      [uidA, "FARMER", "AGRONOMIST"]
    );
    await client.query(
      `INSERT INTO "User" ("id", "openId", "name", "email", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, now(), now())`,
      [uidB, openIdB, "Isolation User", "isolate@example.com"]
    );
    await client.query(
      `INSERT INTO "UserRole" ("userId", "role", "assignedAt")
       VALUES ($1, $2, now())`,
      [uidB, "FARMER"]
    );
    const owner = await client.query(`SELECT "id", "openId", "name" FROM "User" WHERE "id" = $1`, [uidA]);
    check("User row persisted", owner.rowCount === 1, `id=${uidA}`);
    const roles = await client.query(
      `SELECT "role" FROM "UserRole" WHERE "userId" = $1 ORDER BY "role"`,
      [uidA]
    );
    check(
      "Multi-role assignment persisted (FARMER + AGRONOMIST)",
      roles.rowCount === 2 && roles.rows.map((r) => r.role).sort().join(",") === "AGRONOMIST,FARMER"
    );

    console.log("\n[4] Farm persistence");
    const farmAId = randomUUID();
    await client.query(
      `INSERT INTO "Farm" ("id", "ownerId", "name", "locationLabel", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, now(), now())`,
      [farmAId, uidA, "North Ridge Farm", "Rukinga, Rwanda"]
    );
    const farm = await client.query(`SELECT "id", "ownerId", "name" FROM "Farm" WHERE "id" = $1`, [farmAId]);
    check("Farm row persisted", farm.rowCount === 1);
    check("Farm owner link correct", farm.rows[0].ownerId === uidA);

    const farmBId = randomUUID();
    await client.query(
      `INSERT INTO "Farm" ("id", "ownerId", "name", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, now(), now())`,
      [farmBId, uidB, "User B Farm"]
    );

    console.log("\n[5] Device persistence");
    const deviceId = randomUUID();
    const publicId = `feeder-verify-${Date.now()}`;
    const credentialHash = Buffer.from(`cred-${Date.now()}`).toString("hex").slice(0, 64);
    await client.query(
      `INSERT INTO "Device" ("id", "farmId", "publicId", "name", "credentialHash", "source", "isEnabled", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
      [deviceId, farmAId, publicId, "Feeder #1", credentialHash, "SIMULATOR", true]
    );
    const device = await client.query(`SELECT "id", "farmId", "publicId" FROM "Device" WHERE "id" = $1`, [deviceId]);
    check("Device row persisted", device.rowCount === 1);
    check("Device farm link correct", device.rows[0].farmId === farmAId);

    console.log("\n[6] Telemetry persistence");
    const readingId = randomUUID();
    const observedAt = new Date("2026-10-20T12:00:00Z").toISOString();
    await client.query(
      `INSERT INTO "SensorReading" ("id", "deviceId", "messageId", "observedAt", "source",
        "temperatureC", "humidityPercent", "feedLevelPercent", "waterLevelPercent", "receivedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())`,
      [readingId, deviceId, `msg-${Date.now()}`, observedAt, "SIMULATOR", 32, 85, 15, 20]
    );
    const reading = await client.query(
      `SELECT "id", "deviceId", "temperatureC" FROM "SensorReading" WHERE "id" = $1`,
      [readingId]
    );
    check("SensorReading row persisted", reading.rowCount === 1);
    check("Reading device link correct", reading.rows[0].deviceId === deviceId);

    await client.query(
      `INSERT INTO "DeviceState" ("deviceId", "observedAt", "source", "temperatureC",
        "humidityPercent", "feedLevelPercent", "waterLevelPercent", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT ("deviceId") DO UPDATE SET
         "observedAt" = EXCLUDED."observedAt",
         "temperatureC" = EXCLUDED."temperatureC",
         "updatedAt" = now()`,
      [deviceId, observedAt, "SIMULATOR", 32, 85, 15, 20]
    );
    const state = await client.query(`SELECT "temperatureC" FROM "DeviceState" WHERE "deviceId" = $1`, [deviceId]);
    check(
      "DeviceState latest-state persisted",
      state.rowCount === 1 && state.rows[0].temperatureC === 32
    );
    console.log("\n[7] Alerts persistence");
    const alertId = randomUUID();
    await client.query(
      `INSERT INTO "Alert" ("id", "deviceId", "type", "severity", "status", "title", "reason",
        "suggestedAction", "observedValue", "thresholdValue", "unit",
        "firstTriggeredAt", "lastTriggeredAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), now())`,
      [
        alertId, deviceId, "HIGH_TEMPERATURE", "CRITICAL", "OPEN", "Heat risk",
        "Temperature above threshold", "Increase ventilation", 32, 30, "°C",
        observedAt, observedAt,
      ]
    );
    const alert = await client.query(`SELECT "id", "deviceId", "status" FROM "Alert" WHERE "id" = $1`, [alertId]);
    check("Alert row persisted", alert.rowCount === 1);
    check("Alert device link correct", alert.rows[0].deviceId === deviceId);

    const alertEventId = randomUUID();
    await client.query(
      `INSERT INTO "AlertEvent" ("id", "alertId", "eventType", "severity", "message", "actorId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, now())`,
      [alertEventId, alertId, "TRIGGERED", "CRITICAL", "Auto-triggered by rule", uidA]
    );
    const ev = await client.query(`SELECT "id", "actorId" FROM "AlertEvent" WHERE "id" = $1`, [alertEventId]);
    check("AlertEvent row persisted with actor link", ev.rowCount === 1 && ev.rows[0].actorId === uidA);

    console.log("\n[8] Recommendations persistence");
    const recId = randomUUID();
    await client.query(
      `INSERT INTO "Recommendation" ("id", "alertId", "type", "severity", "status", "title", "reason",
        "suggestedAction", "observedValue", "thresholdValue", "unit", "observedAt",
        "deviceSource", "ruleVersion", "createdAt", "lastGeneratedAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now(), now(), now())`,
      [
        recId, alertId, "HEAT_RESPONSE", "CRITICAL", "OPEN", "Ventilate coop",
        "High temperature detected", "Open vents and run fan", 32, 30, "°C",
        observedAt, "SIMULATOR", "v1.0.0",
      ]
    );
    const rec = await client.query(`SELECT "id", "alertId", "status" FROM "Recommendation" WHERE "id" = $1`, [recId]);
    check("Recommendation row persisted", rec.rowCount === 1);
    check("Recommendation linked to alert", rec.rows[0].alertId === alertId);

    console.log("\n[9] Advisory persistence");
    const accessId = randomUUID();
    await client.query(
      `INSERT INTO "FarmAdvisorAccess" ("id", "farmId", "agronomistId", "status", "requestedAt", "updatedAt")
       VALUES ($1, $2, $3, $4, now(), now())`,
      [accessId, farmAId, uidA, "ACTIVE"]
    );
    const access = await client.query(`SELECT "id", "status" FROM "FarmAdvisorAccess" WHERE "id" = $1`, [accessId]);
    check("FarmAdvisorAccess row persisted", access.rowCount === 1 && access.rows[0].status === "ACTIVE");

    const accessEventId = randomUUID();
    await client.query(
      `INSERT INTO "FarmAdvisorAccessEvent" ("id", "accessId", "eventType", "actorId", "createdAt")
       VALUES ($1, $2, $3, $4, now())`,
      [accessEventId, accessId, "APPROVED", uidA]
    );
    const accessEvent = await client.query(`SELECT "id" FROM "FarmAdvisorAccessEvent" WHERE "id" = $1`, [accessEventId]);
    check("FarmAdvisorAccessEvent row persisted", accessEvent.rowCount === 1);

    const noteId = randomUUID();
    await client.query(
      `INSERT INTO "AdvisoryNote" ("id", "farmId", "authorId", "title", "body", "evidence", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, now())`,
      [
        noteId, farmAId, uidA, "Heat mitigation note",
        "Increase ventilation at midday",
        JSON.stringify({ temperatureC: 32, action: "ventilate", source: "SIMULATOR" }),
      ]
    );
    const note = await client.query(`SELECT "id", "evidence" FROM "AdvisoryNote" WHERE "id" = $1`, [noteId]);
    check(
      "AdvisoryNote row persisted with JSONB evidence",
      note.rowCount === 1 && note.rows[0].evidence.temperatureC === 32
    );

    const reviewId = randomUUID();
    await client.query(
      `INSERT INTO "RecommendationReview" ("id", "recommendationId", "farmId", "farmerId",
        "agronomistId", "status", "activeKey", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())`,
      [reviewId, recId, farmAId, uidA, uidA, "PENDING", `review-key-${Date.now()}`]
    );
    const review = await client.query(`SELECT "id", "status" FROM "RecommendationReview" WHERE "id" = $1`, [reviewId]);
    check("RecommendationReview row persisted", review.rowCount === 1);
    console.log("\n[10] Marketplace persistence");
    const supplierId = randomUUID();
    await client.query(
      `INSERT INTO "SupplierProfile" ("id", "userId", "businessName", description, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, now(), now())`,
      [supplierId, uidA, "Verified Feed Co.", "Quality poultry feed supplier", "ACTIVE"]
    );
    const supplier = await client.query(`SELECT "id", "userId" FROM "SupplierProfile" WHERE "id" = $1`, [supplierId]);
    check("SupplierProfile row persisted", supplier.rowCount === 1 && supplier.rows[0].userId === uidA);

    const productId = randomUUID();
    await client.query(
      `INSERT INTO "MarketplaceProduct" ("id", "supplierProfileId", name, category, description,
        "unitLabel", "priceMinor", currency, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())`,
      [productId, supplierId, "Layer Mash Feed", "FEED", "Complete layer feed", "kg", 4500, "RWF", "PUBLISHED"]
    );
    const product = await client.query(`SELECT "id", "category", "status" FROM "MarketplaceProduct" WHERE "id" = $1`, [productId]);
    check("MarketplaceProduct row persisted", product.rowCount === 1 && product.rows[0].category === "FEED");

    console.log("\n[11] Ownership isolation");
    const isolationFarm = await client.query(`SELECT "id" FROM "Farm" WHERE "id" = $1 AND "ownerId" = $2`, [farmAId, uidB]);
    check("User B cannot see User A's farm (owner-scoped)", isolationFarm.rowCount === 0);
    const bFarm = await client.query(`SELECT "id" FROM "Farm" WHERE "id" = $1 AND "ownerId" = $2`, [farmBId, uidB]);
    check("User B can see their own farm", bFarm.rowCount === 1);
    const crossDevices = await client.query(`SELECT "id", "farmId" FROM "Device" WHERE "farmId" = $1`, [farmAId]);
    check(
      "Device rows belong to the owning farm only (no cross-farm leakage)",
      crossDevices.rows.every((d) => d.farmId === farmAId) && crossDevices.rowCount >= 1
    );

    console.log("\n[12] Multi-role behavior");
    const farmerRole = await client.query(
      `SELECT "role" FROM "UserRole" WHERE "userId" = $1 AND "role" = $2`,
      [uidA, "FARMER"]
    );
    const agronomistRole = await client.query(
      `SELECT "role" FROM "UserRole" WHERE "userId" = $1 AND "role" = $2`,
      [uidA, "AGRONOMIST"]
    );
    check("User A holds FARMER role", farmerRole.rowCount === 1);
    check("User A holds AGRONOMIST role", agronomistRole.rowCount === 1);
    const bRoles = await client.query(`SELECT "role" FROM "UserRole" WHERE "userId" = $1`, [uidB]);
    check(
      "User B holds only FARMER role",
      bRoles.rowCount === 1 && bRoles.rows[0].role === "FARMER"
    );

    console.log("\n[cleanup] Removing verification fixtures");
    await client.query(`DELETE FROM "FarmAdvisorAccessEvent" WHERE "accessId" = $1`, [accessId]);
    await client.query(`DELETE FROM "FarmAdvisorAccess" WHERE "id" = $1`, [accessId]);
    await client.query(`DELETE FROM "AdvisoryNote" WHERE "id" = $1`, [noteId]);
    await client.query(`DELETE FROM "RecommendationReviewEvent" WHERE "reviewId" = $1`, [reviewId]);
    await client.query(`DELETE FROM "RecommendationReview" WHERE "id" = $1`, [reviewId]);
    await client.query(`DELETE FROM "AlertEvent" WHERE "id" = $1`, [alertEventId]);
    await client.query(`DELETE FROM "Recommendation" WHERE "id" = $1`, [recId]);
    await client.query(`DELETE FROM "Alert" WHERE "id" = $1`, [alertId]);
    await client.query(`DELETE FROM "DeviceState" WHERE "deviceId" = $1`, [deviceId]);
    await client.query(`DELETE FROM "SensorReading" WHERE "id" = $1`, [readingId]);
    await client.query(`DELETE FROM "MarketplaceProduct" WHERE "id" = $1`, [productId]);
    await client.query(`DELETE FROM "SupplierProfile" WHERE "id" = $1`, [supplierId]);
    await client.query(`DELETE FROM "Device" WHERE "id" = $1`, [deviceId]);
    await client.query(`DELETE FROM "Farm" WHERE "id" = $1 OR "id" = $2`, [farmAId, farmBId]);
    await client.query(`DELETE FROM "UserRole" WHERE "userId" = $1 OR "userId" = $2`, [uidA, uidB]);
    await client.query(`DELETE FROM "User" WHERE "id" = $1 OR "id" = $2`, [uidA, uidB]);

    console.log(`\n📊 Result: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});