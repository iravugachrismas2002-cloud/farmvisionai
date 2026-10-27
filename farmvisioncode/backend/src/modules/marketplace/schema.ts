import { z } from "zod";

const textId = z.string().uuid();
const currency = z.string().regex(/^[A-Z]{3}$/, "Currency must be a three-letter uppercase code.");

export const supplierProfileSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional(),
  contactEmail: z.email().max(320).optional(),
}).strict();

export const marketplaceCategorySchema = z.enum(["FEED", "VETERINARY_MEDICINE", "SEEDS", "FERTILIZER", "EQUIPMENT"]);
export const marketplaceStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const marketplaceProductCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  category: marketplaceCategorySchema,
  description: z.string().trim().min(1).max(4000),
  unitLabel: z.string().trim().min(1).max(80),
  priceMinor: z.number().int().nonnegative().max(2_147_483_647),
  currency,
}).strict();

export const marketplaceProductUpdateSchema = marketplaceProductCreateSchema.partial().extend({
  status: marketplaceStatusSchema.optional(),
}).strict();

export const marketplaceProductQuerySchema = z.object({
  category: marketplaceCategorySchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
}).strict();

export const marketplaceProductIdSchema = textId;
export type SupplierProfileInput = z.infer<typeof supplierProfileSchema>;
export type MarketplaceProductCreateInput = z.infer<typeof marketplaceProductCreateSchema>;
export type MarketplaceProductUpdateInput = z.infer<typeof marketplaceProductUpdateSchema>;
export type MarketplaceProductQuery = z.infer<typeof marketplaceProductQuerySchema>;
