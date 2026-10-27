import { describe, expect, it } from "vitest";
import {
  AdvisoryPolicyError,
  canAccessFarm,
  canCreateAdvisoryNote,
  nextFarmAdvisorAccessStatus,
  nextRecommendationReviewStatus,
} from "@/modules/advisory/policy";

const farmer = { userId: "farmer-1", roles: ["FARMER"] };
const agronomist = { userId: "agronomist-1", roles: ["AGRONOMIST"] };
const dualRoleOwner = { userId: "farmer-1", roles: ["FARMER", "AGRONOMIST"] };

 describe("farm advisory access policy", () => {
  it("lets only the Farmer owner or assigned active Agronomist read a farm", () => {
    expect(canAccessFarm({ actor: farmer, farmOwnerId: farmer.userId, agronomistId: agronomist.userId, accessStatus: "PENDING" })).toBe(true);
    expect(canAccessFarm({ actor: agronomist, farmOwnerId: farmer.userId, agronomistId: agronomist.userId, accessStatus: "ACTIVE" })).toBe(true);
    expect(canAccessFarm({ actor: agronomist, farmOwnerId: farmer.userId, agronomistId: agronomist.userId, accessStatus: "PENDING" })).toBe(false);
    expect(canAccessFarm({ actor: { userId: "stranger", roles: ["FARMER", "AGRONOMIST"] }, farmOwnerId: farmer.userId, agronomistId: agronomist.userId, accessStatus: "ACTIVE" })).toBe(false);
  });

  it("requires farmer approval and allows only the owner to revoke active access", () => {
    expect(nextFarmAdvisorAccessStatus({ currentStatus: null, action: "REQUEST", actor: agronomist, farmOwnerId: farmer.userId, agronomistId: agronomist.userId })).toBe("PENDING");
    expect(nextFarmAdvisorAccessStatus({ currentStatus: "PENDING", action: "APPROVE", actor: farmer, farmOwnerId: farmer.userId, agronomistId: agronomist.userId })).toBe("ACTIVE");
    expect(nextFarmAdvisorAccessStatus({ currentStatus: "ACTIVE", action: "REVOKE", actor: farmer, farmOwnerId: farmer.userId, agronomistId: agronomist.userId })).toBe("REVOKED");
    expect(() => nextFarmAdvisorAccessStatus({ currentStatus: "PENDING", action: "APPROVE", actor: agronomist, farmOwnerId: farmer.userId, agronomistId: agronomist.userId })).toThrow(AdvisoryPolicyError);
  });

  it("does not allow role self-assignment or an Agronomist to request their own farm", () => {
    expect(() => nextFarmAdvisorAccessStatus({ currentStatus: null, action: "REQUEST", actor: farmer, farmOwnerId: "other", agronomistId: "other" })).toThrow(AdvisoryPolicyError);
    expect(() => nextFarmAdvisorAccessStatus({ currentStatus: null, action: "REQUEST", actor: dualRoleOwner, farmOwnerId: dualRoleOwner.userId, agronomistId: dualRoleOwner.userId })).toThrow(AdvisoryPolicyError);
  });

  it("allows note creation only for an active assigned Agronomist", () => {
    expect(canCreateAdvisoryNote({ actor: agronomist, agronomistId: agronomist.userId, accessStatus: "ACTIVE" })).toBe(true);
    expect(canCreateAdvisoryNote({ actor: agronomist, agronomistId: agronomist.userId, accessStatus: "REVOKED" })).toBe(false);
    expect(canCreateAdvisoryNote({ actor: farmer, agronomistId: agronomist.userId, accessStatus: "ACTIVE" })).toBe(false);
  });
});

describe("recommendation review state machine", () => {
  it("requires the farmer owner and active grant to submit", () => {
    expect(nextRecommendationReviewStatus({ currentStatus: null, action: "SUBMIT", actor: farmer, farmerId: farmer.userId, agronomistId: agronomist.userId, hasActiveFarmAccess: true })).toBe("PENDING");
    expect(() => nextRecommendationReviewStatus({ currentStatus: null, action: "SUBMIT", actor: farmer, farmerId: farmer.userId, agronomistId: agronomist.userId, hasActiveFarmAccess: false })).toThrow(AdvisoryPolicyError);
  });

  it("separates Agronomist advice from the Farmer's final decision", () => {
    expect(nextRecommendationReviewStatus({ currentStatus: "PENDING", action: "APPROVE", actor: agronomist, farmerId: farmer.userId, agronomistId: agronomist.userId, hasActiveFarmAccess: true })).toBe("APPROVED");
    expect(nextRecommendationReviewStatus({ currentStatus: "APPROVED", action: "ACCEPT", actor: farmer, farmerId: farmer.userId, agronomistId: agronomist.userId, hasActiveFarmAccess: false })).toBe("ACCEPTED_BY_FARMER");
    expect(() => nextRecommendationReviewStatus({ currentStatus: "PENDING", action: "ACCEPT", actor: farmer, farmerId: farmer.userId, agronomistId: agronomist.userId, hasActiveFarmAccess: false })).toThrow(AdvisoryPolicyError);
    expect(() => nextRecommendationReviewStatus({ currentStatus: "PENDING", action: "APPROVE", actor: agronomist, farmerId: farmer.userId, agronomistId: agronomist.userId, hasActiveFarmAccess: false })).toThrow(AdvisoryPolicyError);
  });
});
