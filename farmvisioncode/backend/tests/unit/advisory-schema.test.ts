import { describe, expect, it } from "vitest";
import {
  advisoryNoteCreateSchema,
  farmAccessRequestSchema,
  recommendationReviewActionSchema,
  recommendationReviewRequestSchema,
} from "@/modules/advisory/schema";

const uuid1 = "46d9baba-05db-4ce8-b3f9-c3df54a60f91";
const uuid2 = "a7b4e3b4-3d65-46ef-9c8e-19d3e4fc9b8a";

describe("advisory API schemas", () => {
  it("accepts only a valid farm identifier for access requests", () => {
    expect(farmAccessRequestSchema.safeParse({ farmId: uuid1 }).success).toBe(true);
    expect(farmAccessRequestSchema.safeParse({ farmId: uuid1, ownerId: uuid2 }).success).toBe(false);
    expect(farmAccessRequestSchema.safeParse({ farmId: "not-a-uuid" }).success).toBe(false);
  });

  it("requires a note to cite server-verifiable telemetry or recommendation evidence", () => {
    expect(advisoryNoteCreateSchema.safeParse({ farmId: uuid1, title: "Feed supply", body: "Please review the recent observed trend.", readingIds: [], recommendationIds: [] }).success).toBe(false);
    expect(advisoryNoteCreateSchema.safeParse({ farmId: uuid1, title: "Feed supply", body: "Please review the recent observed trend.", readingIds: [uuid2], recommendationIds: [] }).success).toBe(true);
    expect(advisoryNoteCreateSchema.safeParse({ farmId: uuid1, title: "Feed supply", body: "Please review the recent observed trend.", readingIds: [uuid2, uuid2], recommendationIds: [] }).success).toBe(false);
  });

  it("accepts review requests/actions only with recognized fields and transitions", () => {
    expect(recommendationReviewRequestSchema.safeParse({ recommendationId: uuid1, agronomistId: uuid2 }).success).toBe(true);
    expect(recommendationReviewRequestSchema.safeParse({ recommendationId: uuid1, agronomistId: uuid2, farmerId: uuid1 }).success).toBe(false);
    expect(recommendationReviewActionSchema.safeParse({ action: "REQUEST_CHANGES", message: "Please include another observation." }).success).toBe(true);
    expect(recommendationReviewActionSchema.safeParse({ action: "RESOLVE" }).success).toBe(false);
  });
});
