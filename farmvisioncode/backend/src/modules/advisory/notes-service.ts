import "server-only";
import { FarmAdvisorAccessStatus, FarmVisionRole, Prisma } from "../../generated/prisma/client";
import { getPrismaClient } from "../../server/db/prisma";
import { AdvisoryServiceError } from "./errors";
import { canCreateAdvisoryNote, type AdvisoryActor } from "./policy";
import type { AdvisoryEvidenceSnapshot, AdvisoryRecommendationEvidence, AdvisoryReadingEvidence } from "./types";
import type { AdvisoryNoteCreateInput } from "./schema";

function accessibleFarmWhere(actor: AdvisoryActor, farmId: string): Prisma.FarmWhereInput {
  const accessRules: Prisma.FarmWhereInput[] = [];
  if (actor.roles.includes(FarmVisionRole.FARMER)) {
    accessRules.push({ ownerId: actor.userId });
  }
  if (actor.roles.includes(FarmVisionRole.AGRONOMIST)) {
    accessRules.push({ advisorAccesses: { some: { agronomistId: actor.userId, status: FarmAdvisorAccessStatus.ACTIVE } } });
  }
  if (accessRules.length === 0) {
    throw new AdvisoryServiceError("ROLE_REQUIRED", "A Farmer or active Agronomist role is required.");
  }
  return { id: farmId, OR: accessRules };
}

export async function listAdvisoryNotesForFarm(actor: AdvisoryActor, farmId: string) {
  const db = getPrismaClient();
  const farm = await db.farm.findFirst({
    where: accessibleFarmWhere(actor, farmId),
    select: { id: true },
  });
  if (!farm) throw new AdvisoryServiceError("NOT_FOUND", "Farm or active advisory access was not found.");

  return db.advisoryNote.findMany({
    where: { farmId },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: 100,
    select: {
      id: true,
      title: true,
      body: true,
      evidence: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  });
}

export async function createAdvisoryNote(actor: AdvisoryActor, input: AdvisoryNoteCreateInput) {
  if (!actor.roles.includes(FarmVisionRole.AGRONOMIST)) {
    throw new AdvisoryServiceError("ROLE_REQUIRED", "Only an Agronomist can write advisory notes.");
  }
  const db = getPrismaClient();
  return db.$transaction(async (tx) => {
    const access = await tx.farmAdvisorAccess.findUnique({
      where: { farmId_agronomistId: { farmId: input.farmId, agronomistId: actor.userId } },
      select: { status: true },
    });
    if (!access || !canCreateAdvisoryNote({
      actor,
      agronomistId: actor.userId,
      accessStatus: access.status,
    })) {
      throw new AdvisoryServiceError("FORBIDDEN", "Active Farmer-approved access is required to write a note.");
    }

    const [readings, recommendations] = await Promise.all([
      input.readingIds.length
        ? tx.sensorReading.findMany({
            where: { id: { in: input.readingIds }, device: { farmId: input.farmId } },
            orderBy: [{ observedAt: "asc" }, { id: "asc" }],
            select: {
              id: true,
              deviceId: true,
              observedAt: true,
              source: true,
              temperatureC: true,
              humidityPercent: true,
              feedLevelPercent: true,
              waterLevelPercent: true,
              feedWeightGrams: true,
              device: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
      input.recommendationIds.length
        ? tx.recommendation.findMany({
            where: { id: { in: input.recommendationIds }, alert: { device: { farmId: input.farmId } } },
            orderBy: [{ observedAt: "asc" }, { id: "asc" }],
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              severity: true,
              observedValue: true,
              thresholdValue: true,
              unit: true,
              observedAt: true,
              deviceSource: true,
              ruleVersion: true,
            },
          })
        : Promise.resolve([]),
    ]);

    if (readings.length !== input.readingIds.length || recommendations.length !== input.recommendationIds.length) {
      throw new AdvisoryServiceError("EVIDENCE_INVALID", "Every evidence item must belong to the approved farm.");
    }

    const evidence: AdvisoryEvidenceSnapshot = {
      capturedAt: new Date().toISOString(),
      readings: readings.map((reading): AdvisoryReadingEvidence => ({
        readingId: reading.id,
        deviceId: reading.deviceId,
        deviceName: reading.device.name,
        observedAt: reading.observedAt.toISOString(),
        source: reading.source,
        temperatureC: reading.temperatureC,
        humidityPercent: reading.humidityPercent,
        feedLevelPercent: reading.feedLevelPercent,
        waterLevelPercent: reading.waterLevelPercent,
        feedWeightGrams: reading.feedWeightGrams,
      })),
      recommendations: recommendations.map((recommendation): AdvisoryRecommendationEvidence => ({
        recommendationId: recommendation.id,
        title: recommendation.title,
        type: recommendation.type,
        status: recommendation.status,
        severity: recommendation.severity,
        observedValue: recommendation.observedValue,
        thresholdValue: recommendation.thresholdValue,
        unit: recommendation.unit,
        observedAt: recommendation.observedAt.toISOString(),
        source: recommendation.deviceSource,
        ruleVersion: recommendation.ruleVersion,
      })),
    };

    return tx.advisoryNote.create({
      data: {
        farmId: input.farmId,
        authorId: actor.userId,
        title: input.title,
        body: input.body,
        evidence: evidence as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        farmId: true,
        title: true,
        body: true,
        evidence: true,
        createdAt: true,
      },
    });
  });
}
