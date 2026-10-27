import "server-only";
import { FarmAdvisorAccessEventType, FarmAdvisorAccessStatus, FarmVisionRole } from "../../generated/prisma/client";
import { getPrismaClient } from "../../server/db/prisma";
import { AdvisoryServiceError, isUniqueConstraintError } from "./errors";
import { nextFarmAdvisorAccessStatus, type AdvisoryActor } from "./policy";

function requireRole(actor: AdvisoryActor, role: "FARMER" | "AGRONOMIST") {
  if (!actor.roles.includes(role)) {
    throw new AdvisoryServiceError("ROLE_REQUIRED", `The ${role === "FARMER" ? "Farmer" : "Agronomist"} role is required.`);
  }
}

export async function listFarmAdvisorAccess(actor: AdvisoryActor) {
  const isFarmer = actor.roles.includes(FarmVisionRole.FARMER);
  const isAgronomist = actor.roles.includes(FarmVisionRole.AGRONOMIST);
  if (!isFarmer && !isAgronomist) {
    throw new AdvisoryServiceError("ROLE_REQUIRED", "A Farmer or Agronomist role is required.");
  }

  const db = getPrismaClient();
  const [ownerAccesses, ownRequests] = await Promise.all([
    isFarmer
      ? db.farmAdvisorAccess.findMany({
          where: { farm: { ownerId: actor.userId } },
          orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
          select: {
            id: true,
            farmId: true,
            status: true,
            requestedAt: true,
            decidedAt: true,
            revokedAt: true,
            updatedAt: true,
            farm: { select: { id: true, name: true, locationLabel: true } },
            agronomist: { select: { id: true, name: true, email: true } },
            events: {
              orderBy: { createdAt: "desc" },
              take: 10,
              select: { id: true, eventType: true, message: true, createdAt: true },
            },
          },
        })
      : Promise.resolve([]),
    isAgronomist
      ? db.farmAdvisorAccess.findMany({
          where: { agronomistId: actor.userId },
          orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
          select: {
            id: true,
            farmId: true,
            status: true,
            requestedAt: true,
            decidedAt: true,
            revokedAt: true,
            updatedAt: true,
            farm: { select: { id: true, name: true, locationLabel: true } },
            events: {
              orderBy: { createdAt: "desc" },
              take: 10,
              select: { id: true, eventType: true, message: true, createdAt: true },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  return {
    ownerAccesses,
    ownRequests: ownRequests.map(({ farm, ...access }) => ({
      ...access,
      farm: access.status === FarmAdvisorAccessStatus.ACTIVE ? farm : null,
    })),
  };
}

export async function requestFarmAdvisorAccess(actor: AdvisoryActor, farmId: string) {
  requireRole(actor, "AGRONOMIST");
  const db = getPrismaClient();
  const farm = await db.farm.findUnique({
    where: { id: farmId },
    select: { id: true, ownerId: true },
  });
  if (!farm) throw new AdvisoryServiceError("NOT_FOUND", "Farm was not found.");
  if (farm.ownerId === actor.userId) {
    throw new AdvisoryServiceError("FORBIDDEN", "An Agronomist cannot request access to their own farm.");
  }

  try {
    return await db.$transaction(async (tx) => {
      const existing = await tx.farmAdvisorAccess.findUnique({
        where: { farmId_agronomistId: { farmId, agronomistId: actor.userId } },
        select: { id: true, status: true },
      });
      if (existing && (existing.status === FarmAdvisorAccessStatus.PENDING || existing.status === FarmAdvisorAccessStatus.ACTIVE)) {
        throw new AdvisoryServiceError("CONFLICT", "An access request already exists for this farm.");
      }

      const now = new Date();
      const access = existing
        ? await tx.farmAdvisorAccess.update({
            where: { id: existing.id },
            data: {
              status: FarmAdvisorAccessStatus.PENDING,
              requestedAt: now,
              decidedAt: null,
              revokedAt: null,
            },
            select: { id: true, farmId: true, status: true, requestedAt: true },
          })
        : await tx.farmAdvisorAccess.create({
            data: { farmId, agronomistId: actor.userId, status: FarmAdvisorAccessStatus.PENDING, requestedAt: now },
            select: { id: true, farmId: true, status: true, requestedAt: true },
          });

      await tx.farmAdvisorAccessEvent.create({
        data: {
          accessId: access.id,
          eventType: FarmAdvisorAccessEventType.REQUESTED,
          actorId: actor.userId,
        },
      });
      return access;
    });
  } catch (error) {
    if (error instanceof AdvisoryServiceError) throw error;
    if (isUniqueConstraintError(error)) {
      throw new AdvisoryServiceError("CONFLICT", "An access request already exists for this farm.");
    }
    throw error;
  }
}

export async function decideFarmAdvisorAccess(
  actor: AdvisoryActor,
  accessId: string,
  action: "APPROVE" | "DECLINE" | "REVOKE",
  message?: string,
) {
  requireRole(actor, "FARMER");
  const db = getPrismaClient();
  return db.$transaction(async (tx) => {
    const access = await tx.farmAdvisorAccess.findUnique({
      where: { id: accessId },
      select: {
        id: true,
        farmId: true,
        agronomistId: true,
        status: true,
        decidedAt: true,
        farm: { select: { ownerId: true } },
      },
    });
    if (!access) throw new AdvisoryServiceError("NOT_FOUND", "Access request was not found.");

    const nextStatus = nextFarmAdvisorAccessStatus({
      currentStatus: access.status,
      action,
      actor,
      farmOwnerId: access.farm.ownerId,
      agronomistId: access.agronomistId,
    });
    const now = new Date();
    const changed = await tx.farmAdvisorAccess.updateMany({
      where: { id: access.id, status: access.status },
      data: {
        status: nextStatus,
        decidedAt: action === "APPROVE" || action === "DECLINE" ? now : access.status === FarmAdvisorAccessStatus.PENDING ? null : access.decidedAt,
        revokedAt: action === "REVOKE" ? now : null,
      },
    });
    if (changed.count !== 1) {
      throw new AdvisoryServiceError("CONFLICT", "The access request changed; reload and try again.");
    }

    const eventType = action === "APPROVE"
      ? FarmAdvisorAccessEventType.APPROVED
      : action === "DECLINE"
        ? FarmAdvisorAccessEventType.DECLINED
        : FarmAdvisorAccessEventType.REVOKED;
    await tx.farmAdvisorAccessEvent.create({
      data: {
        accessId: access.id,
        eventType,
        actorId: actor.userId,
        message: message || undefined,
      },
    });

    return { id: access.id, farmId: access.farmId, agronomistId: access.agronomistId, status: nextStatus };
  });
}

export async function listAccessibleFarmsForAgronomist(actor: AdvisoryActor) {
  requireRole(actor, "AGRONOMIST");
  return getPrismaClient().farmAdvisorAccess.findMany({
    where: { agronomistId: actor.userId, status: FarmAdvisorAccessStatus.ACTIVE },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      farmId: true,
      updatedAt: true,
      farm: { select: { id: true, name: true, locationLabel: true } },
    },
  });
}
