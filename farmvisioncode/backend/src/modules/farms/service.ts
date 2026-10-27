import "server-only";
import { FarmVisionRole } from "../../generated/prisma/enums";
import { getPrismaClient } from "../../server/db/prisma";
import type { CreateFarmInput } from "./schema";

export class FarmRoleRequiredError extends Error {
  constructor() {
    super("A Farmer role is required to manage farms.");
    this.name = "FarmRoleRequiredError";
  }
}

async function requireFarmRole(ownerId: string) {
  const assignment = await getPrismaClient().userRole.findFirst({
    where: {
      userId: ownerId,
      role: { in: [FarmVisionRole.FARMER, FarmVisionRole.ADMINISTRATOR] },
    },
    select: { userId: true },
  });

  if (!assignment) {
    throw new FarmRoleRequiredError();
  }
}

export async function listFarmsForOwner(ownerId: string) {
  await requireFarmRole(ownerId);

  return getPrismaClient().farm.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      locationLabel: true,
      createdAt: true,
    },
  });
}

export async function createFarmForOwner(
  ownerId: string,
  input: CreateFarmInput,
) {
  await requireFarmRole(ownerId);

  return getPrismaClient().farm.create({
    data: {
      ownerId,
      name: input.name,
      locationLabel: input.locationLabel,
    },
    select: {
      id: true,
      name: true,
      locationLabel: true,
      createdAt: true,
    },
  });
}
