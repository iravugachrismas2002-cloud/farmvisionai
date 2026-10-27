import { describe, expect, it } from "vitest";
import { canManageMarketplace, canReadProduct, requireMarketplaceOwner, MarketplacePolicyError } from "@/modules/marketplace/policy";

const entrepreneur = { userId: "supplier-1", roles: ["ENTREPRENEUR"] };
const dualRole = { userId: "supplier-1", roles: ["FARMER", "ENTREPRENEUR"] };
const farmer = { userId: "farmer-1", roles: ["FARMER"] };

describe("marketplace authorization policy", () => {
  it("requires the Entrepreneur role for management", () => {
    expect(canManageMarketplace(entrepreneur)).toBe(true);
    expect(canManageMarketplace(farmer)).toBe(false);
    expect(canManageMarketplace(dualRole)).toBe(true);
  });

  it("limits writes to the supplier owner even for dual-role users", () => {
    expect(() => requireMarketplaceOwner({ actor: dualRole, supplierOwnerId: "supplier-1" })).not.toThrow();
    expect(() => requireMarketplaceOwner({ actor: dualRole, supplierOwnerId: "other-supplier" })).toThrow(MarketplacePolicyError);
    expect(() => requireMarketplaceOwner({ actor: farmer, supplierOwnerId: "farmer-1" })).toThrow(MarketplacePolicyError);
  });

  it("exposes published products but not another supplier's drafts", () => {
    expect(canReadProduct({ actor: null, status: "PUBLISHED", supplierOwnerId: "supplier-1" })).toBe(true);
    expect(canReadProduct({ actor: farmer, status: "DRAFT", supplierOwnerId: "supplier-1" })).toBe(false);
    expect(canReadProduct({ actor: entrepreneur, status: "DRAFT", supplierOwnerId: "supplier-1" })).toBe(true);
  });
});
