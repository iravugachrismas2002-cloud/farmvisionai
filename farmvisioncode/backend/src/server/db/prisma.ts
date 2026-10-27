import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  farmVisionPrisma?: PrismaClient;
};

export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.farmVisionPrisma) {
    return globalForPrisma.farmVisionPrisma;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured for this runtime.");
  }

  const adapter = new PrismaPg({ connectionString });
  globalForPrisma.farmVisionPrisma = new PrismaClient({ adapter });
  return globalForPrisma.farmVisionPrisma;
}
