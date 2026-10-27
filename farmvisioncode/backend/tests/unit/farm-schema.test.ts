import { describe, expect, it } from "vitest";
import { createFarmSchema } from "../../src/modules/farms/schema";

describe("createFarmSchema", () => {
  it("trims a farm name and optional location label", () => {
    expect(
      createFarmSchema.parse({
        name: "  North Field  ",
        locationLabel: "  River Valley  ",
      }),
    ).toEqual({ name: "North Field", locationLabel: "River Valley" });
  });

  it("accepts an omitted location label", () => {
    expect(createFarmSchema.parse({ name: "South Field" })).toEqual({
      name: "South Field",
      locationLabel: undefined,
    });
  });

  it("rejects an empty name after trimming", () => {
    expect(createFarmSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("rejects names longer than the database field limit", () => {
    expect(
      createFarmSchema.safeParse({ name: "f".repeat(161) }).success,
    ).toBe(false);
  });

  it("rejects unknown input keys", () => {
    expect(
      createFarmSchema.safeParse({ name: "North Field", ownerId: "attacker" })
        .success,
    ).toBe(false);
  });
});
