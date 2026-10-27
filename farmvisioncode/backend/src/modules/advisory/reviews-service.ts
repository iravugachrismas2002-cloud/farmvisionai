import "server-only";
import {
  FarmAdvisorAccessStatus,
  FarmVisionRole,
  Prisma,
  RecommendationReviewEventType,
  RecommendationReviewStatus,
  RecommendationStatus,
} from "../../generated/prisma/client";
import { getPrismaClient } from "../../server/db/prisma";
import { AdvisoryServiceError, isUniqueConstraintError } from "./errors";
import { nextRecommendationReviewStatus, type AdvisoryActor } from "./policy";
import type { RecommendationReviewActionInput, RecommendationReviewRequestInput } from "./schema";

function activeReviewKey(recommendationId: string, agronomistId: string) {
  return `${recommendationId}:${agronomistId}`;
}

export async function listRecommendationReviews(actor: AdvisoryActor) {
  const allowedRoles = actor.roles.some((role) => role === FarmVisionRole.FARMER || role === FarmVisionRole.AGRONOMIST);
  if (!allowedRoles) throw new AdvisoryServiceError("ROLE_REQUIRED", "A Farmer or Agronomist role is required.");

  const reviewScopes: Prisma.RecommendationReviewWhereInput[] = [];
  if (actor.roles.includes(FarmVisionRole.FARMER)) reviewScopes.push({ farmerId: actor.userId });
  if (actor.roles.includes(FarmVisionRole.AGRONOMIST)) {
    reviewScopes.push({
      agronomistId: actor.userId,
      farm: { advisorAccesses: { some: { agronomistId: actor.userId, status: FarmAdvisorAccessStatus.ACTIVE } } },
    });
  }

  return getPrismaClient().recommendationReview.findMany({
    where: { OR: reviewScopes },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    take: 200,
    select: {
      id: true,
      recommendationId: true,
      farmId: true,
      farmerId: true,
      agronomistId: true,
      status: true,
      submissionNote: true,
      reviewerNote: true,
      farmerDecisionNote: true,
      createdAt: true,
      updatedAt: true,
      decidedAt: true,
      farm: { select: { id: true, name: true } },
      farmer: { select: { id: true, name: true } },
      agronomist: { select: { id: true, name: true } },
      recommendation: {
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
      },
      events: {
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: { id: true, eventType: true, actorId: true, message: true, createdAt: true },
      },
    },
  });
}

export async function requestRecommendationReview(
  actor: AdvisoryActor,
  input: RecommendationReviewRequestInput,
) {
  if (!actor.roles.includes(FarmVisionRole.FARMER)) {
    throw new AdvisoryServiceError("ROLE_REQUIRED", "A Farmer role is required to request a recommendation review.");
  }

  const db = getPrismaClient();
  try {
    return await db.$transaction(async (tx) => {
      const recommendation = await tx.recommendation.findFirst({
        where: {
          id: input.recommendationId,
          status: { in: [RecommendationStatus.OPEN, RecommendationStatus.ACKNOWLEDGED] },
          alert: { device: { farm: { ownerId: actor.userId } } },
        },
        select: {
          id: true,
          alert: { select: { device: { select: { farmId: true, farm: { select: { ownerId: true } } } } } },
        },
      });
      if (!recommendation) {
        throw new AdvisoryServiceError("NOT_FOUND", "An open recommendation on one of your farms was not found.");
      }

      const farmId = recommendation.alert.device.farmId;
      const farmOwnerId = recommendation.alert.device.farm.ownerId;
      const [access, agronomistRole] = await Promise.all([
        tx.farmAdvisorAccess.findUnique({
          where: { farmId_agronomistId: { farmId, agronomistId: input.agronomistId } },
          select: { status: true },
        }),
        tx.userRole.findUnique({
          where: { userId_role: { userId: input.agronomistId, role: FarmVisionRole.AGRONOMIST } },
          select: { userId: true },
        }),
      ]);
      if (!agronomistRole || access?.status !== FarmAdvisorAccessStatus.ACTIVE) {
        throw new AdvisoryServiceError("FORBIDDEN", "Choose an Agronomist with active approved access to this farm.");
      }

      const nextStatus = nextRecommendationReviewStatus({
        currentStatus: null,
        action: "SUBMIT",
        actor,
        farmerId: farmOwnerId,
        agronomistId: input.agronomistId,
        hasActiveFarmAccess: true,
      });
      const key = activeReviewKey(recommendation.id, input.agronomistId);
      const review = await tx.recommendationReview.create({
        data: {
          recommendationId: recommendation.id,
          farmId,
          farmerId: actor.userId,
          agronomistId: input.agronomistId,
          status: nextStatus,
          activeKey: key,
          submissionNote: input.submissionNote,
          events: {
            create: {
              eventType: RecommendationReviewEventType.SUBMITTED,
              actorId: actor.userId,
              message: input.submissionNote,
            },
          },
        },
        select: { id: true, recommendationId: true, farmId: true, agronomistId: true, status: true, createdAt: true },
      });
      return review;
    });
  } catch (error) {
    if (error instanceof AdvisoryServiceError) throw error;
    if (isUniqueConstraintError(error)) {
      throw new AdvisoryServiceError("CONFLICT", "An unresolved review for this recommendation and Agronomist already exists.");
    }
    throw error;
  }
}

export async function decideRecommendationReview(
  actor: AdvisoryActor,
  reviewId: string,
  input: RecommendationReviewActionInput,
) {
  const db = getPrismaClient();
  return db.$transaction(async (tx) => {
    const review = await tx.recommendationReview.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        farmId: true,
        farmerId: true,
        agronomistId: true,
        status: true,
        activeKey: true,
        farm: { select: { ownerId: true } },
      },
    });
    if (!review) throw new AdvisoryServiceError("NOT_FOUND", "Recommendation review was not found.");

    const isAgronomistAction = input.action === "APPROVE" || input.action === "REQUEST_CHANGES" || input.action === "NOT_RECOMMENDED";
    let hasActiveFarmAccess = false;
    if (isAgronomistAction && actor.roles.includes(FarmVisionRole.AGRONOMIST)) {
      const access = await tx.farmAdvisorAccess.findUnique({
        where: { farmId_agronomistId: { farmId: review.farmId, agronomistId: actor.userId } },
        select: { status: true },
      });
      hasActiveFarmAccess = access?.status === FarmAdvisorAccessStatus.ACTIVE;
    }

    const nextStatus = nextRecommendationReviewStatus({
      currentStatus: review.status,
      action: input.action,
      actor,
      farmerId: review.farm.ownerId,
      agronomistId: review.agronomistId,
      hasActiveFarmAccess,
    });
    const now = new Date();
    const keepsReviewOpen = nextStatus === RecommendationReviewStatus.PENDING || nextStatus === RecommendationReviewStatus.APPROVED;
    const updated = await tx.recommendationReview.updateMany({
      where: { id: review.id, status: review.status },
      data: {
        status: nextStatus,
        activeKey: keepsReviewOpen ? review.activeKey ?? activeReviewKey(review.id, review.agronomistId) : null,
        ...(isAgronomistAction
          ? { reviewerNote: input.message, decidedAt: now }
          : { farmerDecisionNote: input.message, decidedAt: now }),
      },
    });
    if (updated.count !== 1) {
      throw new AdvisoryServiceError("CONFLICT", "The recommendation review changed; reload and try again.");
    }

    const eventType = input.action === "APPROVE"
      ? RecommendationReviewEventType.APPROVED
      : input.action === "REQUEST_CHANGES"
        ? RecommendationReviewEventType.CHANGES_REQUESTED
        : input.action === "NOT_RECOMMENDED"
          ? RecommendationReviewEventType.NOT_RECOMMENDED
          : input.action === "ACCEPT"
            ? RecommendationReviewEventType.ACCEPTED_BY_FARMER
            : RecommendationReviewEventType.DECLINED_BY_FARMER;
    await tx.recommendationReviewEvent.create({
      data: {
        reviewId: review.id,
        eventType,
        actorId: actor.userId,
        message: input.message,
      },
    });

    return { id: review.id, status: nextStatus, decidedAt: now };
  });
}
