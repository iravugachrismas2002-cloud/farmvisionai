export type MarketplaceActor = { userId: string; roles: readonly string[] };

export class MarketplacePolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketplacePolicyError";
  }
}

export function canBrowseCatalog(): boolean {
  return true;
}

export function canManageMarketplace(actor: MarketplaceActor): boolean {
  return actor.roles.includes("ENTREPRENEUR");
}

export function requireMarketplaceOwner(input: {
  actor: MarketplaceActor;
  supplierOwnerId: string;
}) {
  if (!canManageMarketplace(input.actor)) {
    throw new MarketplacePolicyError("The Entrepreneur role is required for marketplace management.");
  }
  if (input.actor.userId !== input.supplierOwnerId) {
    throw new MarketplacePolicyError("Only the supplier profile owner can manage this marketplace resource.");
  }
}

export function canReadProduct(input: {
  actor: MarketplaceActor | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  supplierOwnerId: string;
}): boolean {
  return input.status === "PUBLISHED" || Boolean(input.actor && input.actor.userId === input.supplierOwnerId && canManageMarketplace(input.actor));
}
