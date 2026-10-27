import { z } from "zod";

export const createFarmSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a farm name.").max(160),
    locationLabel: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((value) => value || undefined),
  })
  .strict();

export type CreateFarmInput = z.infer<typeof createFarmSchema>;
