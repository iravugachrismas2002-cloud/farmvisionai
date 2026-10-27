import "server-only";
import {
  FarmVisionRole,
  MarketplaceProductCategory,
  MarketplaceProductStatus,
} from "../../generated/prisma/client";
import { getPrismaClient } from "../../server/db/prisma";
import { MarketplaceServiceError, isUniqueConstraintError } from "./errors";
import { requireMarketplaceOwner, type MarketplaceActor } from "./policy";
import type {
  MarketplaceProductCreateInput,
  MarketplaceProductQuery,
  MarketplaceProductUpdateInput,
  SupplierProfileInput,
} from "./schema";

function requireEntrepreneur(actor: MarketplaceActor) {
  if (!actor.roles.includes(FarmVisionRole.ENTREPRENEUR)) {
    throw new MarketplaceServiceError("ROLE_REQUIRED", "The Entrepreneur role is required for marketplace management.");
  }
}

export async function getOwnSupplierProfile(actor: MarketplaceActor) {
  requireEntrepreneur(actor);
  return getPrismaClient().supplierProfile.findUnique({
    where: { userId: actor.userId },
    select: { id: true, businessName: true, description: true, contactEmail: true, status: true, createdAt: true, updatedAt: true },
  });
}

export async function createSupplierProfile(actor: MarketplaceActor, input: SupplierProfileInput) {
  requireEntrepreneur(actor);
  try {
    return await getPrismaClient().supplierProfile.create({
      data: { userId: actor.userId, ...input },
      select: { id: true, businessName: true, description: true, contactEmail: true, status: true, createdAt: true, updatedAt: true },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new MarketplaceServiceError("CONFLICT", "You already have a supplier profile.");
    throw error;
  }
}

export async function updateSupplierProfile(actor: MarketplaceActor, input: SupplierProfileInput) {
  requireEntrepreneur(actor);
  const profile = await getPrismaClient().supplierProfile.findUnique({ where: { userId: actor.userId }, select: { id: true } });
  if (!profile) throw new MarketplaceServiceError("NOT_FOUND", "Create a supplier profile before updating it.");
  return getPrismaClient().supplierProfile.update({
    where: { id: profile.id },
    data: input,
    select: { id: true, businessName: true, description: true, contactEmail: true, status: true, createdAt: true, updatedAt: true },
  });
}

export async function listPublishedProducts(query: MarketplaceProductQuery) {
  return getPrismaClient().marketplaceProduct.findMany({
    where: { status: MarketplaceProductStatus.PUBLISHED, ...(query.category ? { category: query.category as MarketplaceProductCategory } : {}) },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    take: query.limit,
    select: {
      id: true, name: true, category: true, description: true, unitLabel: true, priceMinor: true, currency: true, status: true, createdAt: true, updatedAt: true,
      supplierProfile: { select: { id: true, businessName: true, description: true } },
    },
  });
}

export async function createMarketplaceProduct(actor: MarketplaceActor, input: MarketplaceProductCreateInput) {
  requireEntrepreneur(actor);
  const profile = await getPrismaClient().supplierProfile.findUnique({ where: { userId: actor.userId }, select: { id: true, status: true } });
  if (!profile) throw new MarketplaceServiceError("NOT_FOUND", "Create a supplier profile before creating products.");
  if (profile.status !== "ACTIVE") throw new MarketplaceServiceError("FORBIDDEN", "The supplier profile is not active.");
  return getPrismaClient().marketplaceProduct.create({
    data: { supplierProfileId: profile.id, ...input },
    select: { id: true, supplierProfileId: true, name: true, category: true, description: true, unitLabel: true, priceMinor: true, currency: true, status: true, createdAt: true, updatedAt: true },
  });
}

export async function updateMarketplaceProduct(actor: MarketplaceActor, productId: string, input: MarketplaceProductUpdateInput) {
  requireEntrepreneur(actor);
  const product = await getPrismaClient().marketplaceProduct.findUnique({ where: { id: productId }, select: { id: true, supplierProfile: { select: { userId: true } } } });
  if (!product) throw new MarketplaceServiceError("NOT_FOUND", "Marketplace product was not found.");
  try {
    requireMarketplaceOwner({ actor, supplierOwnerId: product.supplierProfile.userId });
  } catch (error) {
    if (error instanceof Error) throw new MarketplaceServiceError("FORBIDDEN", error.message);
    throw error;
  }
  return getPrismaClient().marketplaceProduct.update({
    where: { id: product.id },
    data: input,
    select: { id: true, supplierProfileId: true, name: true, category: true, description: true, unitLabel: true, priceMinor: true, currency: true, status: true, createdAt: true, updatedAt: true },
  });
}
