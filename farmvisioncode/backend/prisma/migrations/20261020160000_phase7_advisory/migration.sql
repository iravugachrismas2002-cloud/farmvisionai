-- Phase 7 additive migration: Agronomist consent, advisory notes, and recommendation reviews.
-- This draft is intentionally unapplied until the existing farmvision_dev target is confirmed.

ALTER TYPE "FarmVisionRole" ADD VALUE 'AGRONOMIST';

CREATE TYPE "FarmAdvisorAccessStatus" AS ENUM ('PENDING', 'ACTIVE', 'DECLINED', 'REVOKED');
CREATE TYPE "FarmAdvisorAccessEventType" AS ENUM ('REQUESTED', 'APPROVED', 'DECLINED', 'REVOKED');
CREATE TYPE "RecommendationReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'NOT_RECOMMENDED', 'ACCEPTED_BY_FARMER', 'DECLINED_BY_FARMER');
CREATE TYPE "RecommendationReviewEventType" AS ENUM ('SUBMITTED', 'APPROVED', 'CHANGES_REQUESTED', 'NOT_RECOMMENDED', 'ACCEPTED_BY_FARMER', 'DECLINED_BY_FARMER');

CREATE TABLE "FarmAdvisorAccess" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "agronomistId" UUID NOT NULL,
    "status" "FarmAdvisorAccessStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "FarmAdvisorAccess_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FarmAdvisorAccessEvent" (
    "id" UUID NOT NULL,
    "accessId" UUID NOT NULL,
    "eventType" "FarmAdvisorAccessEventType" NOT NULL,
    "actorId" UUID,
    "message" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FarmAdvisorAccessEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdvisoryNote" (
    "id" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "body" VARCHAR(5000) NOT NULL,
    "evidence" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdvisoryNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecommendationReview" (
    "id" UUID NOT NULL,
    "recommendationId" UUID NOT NULL,
    "farmId" UUID NOT NULL,
    "farmerId" UUID NOT NULL,
    "agronomistId" UUID NOT NULL,
    "status" "RecommendationReviewStatus" NOT NULL DEFAULT 'PENDING',
    "activeKey" VARCHAR(80),
    "submissionNote" VARCHAR(1000),
    "reviewerNote" VARCHAR(1000),
    "farmerDecisionNote" VARCHAR(1000),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "decidedAt" TIMESTAMPTZ(6),
    CONSTRAINT "RecommendationReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecommendationReviewEvent" (
    "id" UUID NOT NULL,
    "reviewId" UUID NOT NULL,
    "eventType" "RecommendationReviewEventType" NOT NULL,
    "actorId" UUID,
    "message" VARCHAR(1000),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecommendationReviewEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FarmAdvisorAccess_farmId_agronomistId_key" ON "FarmAdvisorAccess"("farmId", "agronomistId");
CREATE INDEX "FarmAdvisorAccess_farmId_status_updatedAt_idx" ON "FarmAdvisorAccess"("farmId", "status", "updatedAt");
CREATE INDEX "FarmAdvisorAccess_agronomistId_status_updatedAt_idx" ON "FarmAdvisorAccess"("agronomistId", "status", "updatedAt");
CREATE INDEX "FarmAdvisorAccessEvent_accessId_createdAt_idx" ON "FarmAdvisorAccessEvent"("accessId", "createdAt");
CREATE INDEX "FarmAdvisorAccessEvent_actorId_createdAt_idx" ON "FarmAdvisorAccessEvent"("actorId", "createdAt");
CREATE INDEX "AdvisoryNote_farmId_createdAt_idx" ON "AdvisoryNote"("farmId", "createdAt");
CREATE INDEX "AdvisoryNote_authorId_createdAt_idx" ON "AdvisoryNote"("authorId", "createdAt");
CREATE UNIQUE INDEX "RecommendationReview_activeKey_key" ON "RecommendationReview"("activeKey");
CREATE INDEX "RecommendationReview_recommendationId_createdAt_idx" ON "RecommendationReview"("recommendationId", "createdAt");
CREATE INDEX "RecommendationReview_farmId_status_createdAt_idx" ON "RecommendationReview"("farmId", "status", "createdAt");
CREATE INDEX "RecommendationReview_agronomistId_status_createdAt_idx" ON "RecommendationReview"("agronomistId", "status", "createdAt");
CREATE INDEX "RecommendationReviewEvent_reviewId_createdAt_idx" ON "RecommendationReviewEvent"("reviewId", "createdAt");
CREATE INDEX "RecommendationReviewEvent_actorId_createdAt_idx" ON "RecommendationReviewEvent"("actorId", "createdAt");

ALTER TABLE "FarmAdvisorAccess" ADD CONSTRAINT "FarmAdvisorAccess_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FarmAdvisorAccess" ADD CONSTRAINT "FarmAdvisorAccess_agronomistId_fkey" FOREIGN KEY ("agronomistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FarmAdvisorAccessEvent" ADD CONSTRAINT "FarmAdvisorAccessEvent_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "FarmAdvisorAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FarmAdvisorAccessEvent" ADD CONSTRAINT "FarmAdvisorAccessEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdvisoryNote" ADD CONSTRAINT "AdvisoryNote_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdvisoryNote" ADD CONSTRAINT "AdvisoryNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecommendationReview" ADD CONSTRAINT "RecommendationReview_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecommendationReview" ADD CONSTRAINT "RecommendationReview_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecommendationReview" ADD CONSTRAINT "RecommendationReview_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecommendationReview" ADD CONSTRAINT "RecommendationReview_agronomistId_fkey" FOREIGN KEY ("agronomistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecommendationReviewEvent" ADD CONSTRAINT "RecommendationReviewEvent_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "RecommendationReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecommendationReviewEvent" ADD CONSTRAINT "RecommendationReviewEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
