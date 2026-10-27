-- Phase 8 additive migration: Entrepreneur suppliers and marketplace catalog.
-- This draft is intentionally unapplied until the existing farmvision_dev target is confirmed.

ALTER TYPE "FarmVisionRole" ADD VALUE 'ENTREPRENEUR';
CREATE TYPE "SupplierProfileStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "MarketplaceProductCategory" AS ENUM ('FEED', 'VETERINARY_MEDICINE', 'SEEDS', 'FERTILIZER', 'EQUIPMENT');
CREATE TYPE "MarketplaceProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "SupplierProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "businessName" VARCHAR(160) NOT NULL,
    "description" VARCHAR(2000),
    "contactEmail" VARCHAR(320),
    "status" "SupplierProfileStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "SupplierProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceProduct" (
    "id" UUID NOT NULL,
    "supplierProfileId" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "category" "MarketplaceProductCategory" NOT NULL,
    "description" VARCHAR(4000) NOT NULL,
    "unitLabel" VARCHAR(80) NOT NULL,
    "priceMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "status" "MarketplaceProductStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "MarketplaceProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SupplierProfile_userId_key" ON "SupplierProfile"("userId");
CREATE INDEX "SupplierProfile_status_updatedAt_idx" ON "SupplierProfile"("status", "updatedAt");
CREATE INDEX "MarketplaceProduct_status_category_updatedAt_idx" ON "MarketplaceProduct"("status", "category", "updatedAt");
CREATE INDEX "MarketplaceProduct_supplierProfileId_status_updatedAt_idx" ON "MarketplaceProduct"("supplierProfileId", "status", "updatedAt");

ALTER TABLE "SupplierProfile" ADD CONSTRAINT "SupplierProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceProduct" ADD CONSTRAINT "MarketplaceProduct_supplierProfileId_fkey" FOREIGN KEY ("supplierProfileId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
