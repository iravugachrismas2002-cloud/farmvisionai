export type AdvisoryActor = {
  userId: string;
  roles: readonly string[];
};

type AccessStatus = "PENDING" | "ACTIVE" | "DECLINED" | "REVOKED";
type ReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "NOT_RECOMMENDED"
  | "ACCEPTED_BY_FARMER"
  | "DECLINED_BY_FARMER";
type AccessAction = "REQUEST" | "APPROVE" | "DECLINE" | "REVOKE";
type ReviewAction = "SUBMIT" | "APPROVE" | "REQUEST_CHANGES" | "NOT_RECOMMENDED" | "ACCEPT" | "DECLINE";

export class AdvisoryPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdvisoryPolicyError";
  }
}

export function canAccessFarm({
  actor,
  farmOwnerId,
  agronomistId,
  accessStatus,
}: {
  actor: AdvisoryActor;
  farmOwnerId: string;
  agronomistId: string;
  accessStatus: AccessStatus;
}): boolean {
  return (
    (actor.userId === farmOwnerId && actor.roles.includes("FARMER")) ||
    (actor.userId === agronomistId &&
      actor.roles.includes("AGRONOMIST") &&
      accessStatus === "ACTIVE")
  );
}

export function nextFarmAdvisorAccessStatus({
  currentStatus,
  action,
  actor,
  farmOwnerId,
  agronomistId,
}: {
  currentStatus: AccessStatus | null;
  action: AccessAction;
  actor: AdvisoryActor;
  farmOwnerId: string;
  agronomistId: string;
}): AccessStatus {
  if (action === "REQUEST") {
    if (!actor.roles.includes("AGRONOMIST") || actor.userId !== agronomistId) {
      throw new AdvisoryPolicyError("An assigned Agronomist role is required to request access.");
    }
    if (actor.userId === farmOwnerId) {
      throw new AdvisoryPolicyError("An Agronomist cannot request access to their own farm.");
    }
    if (currentStatus === "PENDING" || currentStatus === "ACTIVE") {
      throw new AdvisoryPolicyError("Access is already pending or active.");
    }
    return "PENDING";
  }

  if (!actor.roles.includes("FARMER") || actor.userId !== farmOwnerId) {
    throw new AdvisoryPolicyError("Only the Farmer who owns the farm can decide access.");
  }
  if (action === "APPROVE" || action === "DECLINE") {
    if (currentStatus !== "PENDING") {
      throw new AdvisoryPolicyError("Only a pending access request can be decided.");
    }
    return action === "APPROVE" ? "ACTIVE" : "DECLINED";
  }
  if (currentStatus !== "ACTIVE") {
    throw new AdvisoryPolicyError("Only active access can be revoked.");
  }
  return "REVOKED";
}

export function canCreateAdvisoryNote({
  actor,
  agronomistId,
  accessStatus,
}: {
  actor: AdvisoryActor;
  agronomistId: string;
  accessStatus: AccessStatus;
}): boolean {
  return (
    actor.userId === agronomistId &&
    actor.roles.includes("AGRONOMIST") &&
    accessStatus === "ACTIVE"
  );
}

export function nextRecommendationReviewStatus({
  currentStatus,
  action,
  actor,
  farmerId,
  agronomistId,
  hasActiveFarmAccess,
}: {
  currentStatus: ReviewStatus | null;
  action: ReviewAction;
  actor: AdvisoryActor;
  farmerId: string;
  agronomistId: string;
  hasActiveFarmAccess: boolean;
}): ReviewStatus {
  if (action === "SUBMIT") {
    if (
      !actor.roles.includes("FARMER") ||
      actor.userId !== farmerId ||
      !hasActiveFarmAccess
    ) {
      throw new AdvisoryPolicyError("The Farmer owner and active Agronomist access are required.");
    }
    if (currentStatus !== null) {
      throw new AdvisoryPolicyError("A review already exists.");
    }
    return "PENDING";
  }

  const agronomistActions: ReviewAction[] = ["APPROVE", "REQUEST_CHANGES", "NOT_RECOMMENDED"];
  if (agronomistActions.includes(action)) {
    if (
      !actor.roles.includes("AGRONOMIST") ||
      actor.userId !== agronomistId ||
      !hasActiveFarmAccess ||
      currentStatus !== "PENDING"
    ) {
      throw new AdvisoryPolicyError("An assigned Agronomist with active access must review a pending request.");
    }
    if (action === "APPROVE") return "APPROVED";
    if (action === "REQUEST_CHANGES") return "CHANGES_REQUESTED";
    return "NOT_RECOMMENDED";
  }

  if (
    !actor.roles.includes("FARMER") ||
    actor.userId !== farmerId ||
    currentStatus !== "APPROVED"
  ) {
    throw new AdvisoryPolicyError("Only the Farmer owner can decide an approved review.");
  }
  return action === "ACCEPT" ? "ACCEPTED_BY_FARMER" : "DECLINED_BY_FARMER";
}
