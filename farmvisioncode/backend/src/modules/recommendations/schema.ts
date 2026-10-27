import { z } from "zod";

export const recommendationStatusFilterSchema = z.enum(["OPEN", "ACKNOWLEDGED", "RESOLVED"]).optional();
export const recommendationLimitSchema = z.coerce.number().int().min(1).max(100).default(100);
