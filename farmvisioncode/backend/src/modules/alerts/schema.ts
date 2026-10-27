import { z } from "zod";

export const alertStatusFilterSchema = z.enum(["OPEN", "ACKNOWLEDGED", "RESOLVED"]).optional();
export const alertIdSchema = z.string().uuid();
