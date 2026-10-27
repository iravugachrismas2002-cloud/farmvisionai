import "server-only";
import { FarmAdvisorAccessStatus, FarmVisionRole, Prisma, RecommendationReviewStatus } from "../../generated/prisma/client";
import { getPrismaClient } from "../../server/db/prisma";
import { AdvisoryServiceError } from "./errors";
import type { AdvisoryActor } from "./policy";

export async function getFarmReviewData(actor: AdvisoryActor, farmId: string) {
  const accessRules: Prisma.FarmWhereInput[] = [];
  if (actor.roles.includes(FarmVisionRole.FARMER)) accessRules.push({ ownerId: actor.userId });
  if (actor.roles.includes(FarmVisionRole.AGRONOMIST)) {
    accessRules.push({ advisorAccesses: { some: { agronomistId: actor.userId, status: FarmAdvisorAccessStatus.ACTIVE } } });
  }
  if (accessRules.length === 0) {
    throw new AdvisoryServiceError("ROLE_REQUIRED", "A Farmer or Agronomist role is required.");
  }

  const db = getPrismaClient();
  const farm = await db.farm.findFirst({
    where: { id: farmId, OR: accessRules },
    select: {
      id: true,
      name: true,
      locationLabel: true,
      devices: {
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          source: true,
          isEnabled: true,
          readings: {
            orderBy: [{ observedAt: "desc" }, { id: "asc" }],
            take: 20,
            select: {
              id: true,
              observedAt: true,
              receivedAt: true,
              source: true,
              temperatureC: true,
              humidityPercent: true,
              feedLevelPercent: true,
              waterLevelPercent: true,
              feedWeightGrams: true,
            },
          },
        },
      },
    },
  });
  if (!farm) throw new AdvisoryServiceError("NOT_FOUND", "Farm or active advisory access was not found.");

  const [recommendations, notes, reviews] = await Promise.all([
    db.recommendation.findMany({
      where: { alert: { device: { farmId } } },
      orderBy: [{ lastGeneratedAt: "desc" }, { id: "asc" }],
      take: 100,
      select: {
        id: true,
        type: true,
        severity: true,
        status: true,
        title: true,
        reason: true,
        suggestedAction: true,
        observedValue: true,
        thresholdValue: true,
        unit: true,
        observedAt: true,
        deviceSource: true,
        ruleVersion: true,
        alert: { select: { device: { select: { id: true, name: true } } } },
      },
    }),
    db.advisoryNote.findMany({
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
    }),
    db.recommendationReview.findMany({
      where: {
        farmId,
        OR: [
          ...(actor.roles.includes(FarmVisionRole.FARMER) ? [{ farmerId: actor.userId }] : []),
          ...(actor.roles.includes(FarmVisionRole.AGRONOMIST)
            ? [{ agronomistId: actor.userId, farm: { advisorAccesses: { some: { agronomistId: actor.userId, status: FarmAdvisorAccessStatus.ACTIVE } } } }]
            : []),
        ],
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      take: 100,
      select: {
        id: true,
        recommendationId: true,
        status: true,
        submissionNote: true,
        reviewerNote: true,
        farmerDecisionNote: true,
        createdAt: true,
        updatedAt: true,
        decidedAt: true,
        farmer: { select: { id: true, name: true } },
        agronomist: { select: { id: true, name: true } },
        recommendation: { select: { id: true, title: true, type: true, status: true, severity: true, observedValue: true, thresholdValue: true, unit: true, observedAt: true, deviceSource: true, ruleVersion: true } },
        events: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: { id: true, eventType: true, actorId: true, message: true, createdAt: true },
        },
      },
    }),
  ]);

  return {
    farm,
    recommendations,
    notes,
    reviews: reviews.filter((review) => Object.values(RecommendationReviewStatus).includes(review.status)),
  };
}
