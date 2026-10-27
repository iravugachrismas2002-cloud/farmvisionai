import { describe, expect, it } from "vitest";
import { marketplaceProductCreateSchema, marketplaceProductUpdateSchema, marketplaceProductQuerySchema, supplierProfileSchema } from "@/modules/marketplace/schema";

const validProduct = {
  name: "Drought-resistant seed pack",
  category: "SEEDS",
  description: "Catalog description only.",
  unitLabel: "pack",
  priceMinor: 1250,
  currency: "USD",
};

describe("marketplace schemas", () => {
  it("accepts supported product categories and rejects unsupported values", () => {
    expect(marketplaceProductCreateSchema.safeParse(validProduct).success).toBe(true);
    expect(marketplaceProductCreateSchema.safeParse({ ...validProduct, category: "ANIMALS" }).success).toBe(false);
  });

  it("keeps lifecycle status separate from product creation", () => {
    expect(marketplaceProductCreateSchema.safeParse({ ...validProduct, status: "PUBLISHED" }).success).toBe(false);
    expect(marketplaceProductUpdateSchema.safeParse({ status: "PUBLISHED" }).success).toBe(true);
  });

  it("bounds catalog filters and validates supplier profile fields", () => {
    expect(marketplaceProductQuerySchema.safeParse({ category: "FEED", limit: "25" }).success).toBe(true);
    expect(marketplaceProductQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
    expect(supplierProfileSchema.safeParse({ businessName: "Agri Supply", contactEmail: "sales@example.com" }).success).toBe(true);
    expect(supplierProfileSchema.safeParse({ businessName: "A" }).success).toBe(false);
  });
});
