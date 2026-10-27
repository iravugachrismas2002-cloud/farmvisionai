import "server-only";
import { FarmVisionRole, Prisma, RecommendationStatus } from "../../generated/prisma/client";
import { getPrismaClient } from "../../server/db/prisma";
import { buildRecommendation, type RecommendationInput } from "./rules";

export class RecommendationAccessError extends Error {
  constructor(message = "A Farmer role is required to view recommendations.") {
    super(message);
    this.name = "RecommendationAccessError";
  }
}

export async function synchronizeRecommendationForAlert(
  tx: Prisma.TransactionClient,
  alertId: string,
  input: RecommendationInput,
  state: {
    status: "OPEN" | "ACKNOWLEDGED";
    acknowledgedAt: Date | null;
    acknowledgedById: string | null;
  },
) {
  const candidate = buildRecommendation(input);
  if (!candidate) return;

  const status = state.status === "ACKNOWLEDGED"
    ? RecommendationStatus.ACKNOWLEDGED
    : RecommendationStatus.OPEN;
  await tx.recommendation.upsert({
    where: { alertId },
    create: {
      alertId,
      ...candidate,
      status,
      lastGeneratedAt: input.generatedAt,
      acknowledgedAt: state.acknowledgedAt,
      acknowledgedById: state.acknowledgedById,
    },
    update: {
      ...candidate,
      status,
      lastGeneratedAt: input.generatedAt,
      acknowledgedAt: state.acknowledgedAt,
      acknowledgedById: state.acknowledgedById,
      resolvedAt: null,
    },
  });
}

export async function resolveRecommendationForAlert(
  tx: Prisma.TransactionClient,
  alertId: string,
  resolvedAt: Date,
) {
  await tx.recommendation.updateMany({
    where: { alertId, status: { not: RecommendationStatus.RESOLVED } },
    data: {
      status: RecommendationStatus.RESOLVED,
      resolvedAt,
      acknowledgedAt: null,
      acknowledgedById: null,
    },
  });
}

export async function acknowledgeRecommendationForAlert(
  tx: Prisma.TransactionClient,
  alertId: string,
  ownerId: string,
  acknowledgedAt: Date,
) {
  const result = await tx.recommendation.updateMany({
    where: { alertId, status: RecommendationStatus.OPEN },
    data: {
      status: RecommendationStatus.ACKNOWLEDGED,
      acknowledgedAt,
      acknowledgedById: ownerId,
    },
  });
  if (result.count !== 1) {
    throw new Error("The alert recommendation is missing or changed; transaction was rolled back.");
  }
}

export async function listRecommendationsForOwner(
  ownerId: string,
  status?: RecommendationStatus,
  limit = 100,
) {
  const db = getPrismaClient();
  const farmer = await db.userRole.findUnique({
    where: { userId_role: { userId: ownerId, role: FarmVisionRole.FARMER } },
    select: { userId: true },
  });
  if (!farmer) throw new RecommendationAccessError();

  return db.recommendation.findMany({
    where: {
      ...(status ? { status } : {}),
      alert: { device: { farm: { ownerId } } },
    },
    orderBy: [{ lastGeneratedAt: "desc" }, { id: "desc" }],
    take: limit,
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
      createdAt: true,
      lastGeneratedAt: true,
      acknowledgedAt: true,
      resolvedAt: true,
      alert: {
        select: {
          id: true,
          type: true,
          device: {
            select: {
              id: true,
              name: true,
              publicId: true,
              source: true,
              farm: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });
}
