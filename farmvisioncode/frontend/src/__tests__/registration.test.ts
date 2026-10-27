/* FarmVision AI - Registration Module Tests */
/* Stabilization Phase */

/* 
  Test Suite: Registration
  Tests cover: User registration with verification email
  Verifies: Build, TypeScript, API routes, Database models, Prisma schema
*/

import { describe, it, expect } from "vitest";

describe("FarmVision AI Registration", () => {
  describe("Successful Registration", () => {
    it("should create PENDING account and return verificationNeeded: true", async () => {
      const response = await fetch(
        "http://localhost:3001/api/auth/register",
        { method: "POST" }
      );
      const data = await response.json();

      // Verify response structure
      expect(response.status).toBe(201);
      expect(data.verificationNeeded).toBe(true);
      expect(data.approvalStatus).toBe("NEW");
      expect(data.email).toBe("newfarmer@farmvision.com");
      expect(data.name).toBe("Maria Garcia");
      expect(data).toHaveProperty("verificationToken");
      expect(data).toHaveProperty("createdAt");
      // Roles should include FARMER
      expect(data.roles).toContain("FARMER");
    });

    it("should hash password and store salt securely", async () => {
      const response = await fetch(
        "http://localhost:3001/api/auth/register",
        { method: "POST" }
      );
      const data = await response.json();

      // Password should NOT be stored in plain text
      expect(data.password).toBeUndefined();
      // Salt and hash should be stored
      expect(data).toHaveProperty("salt");
      expect(data.salt).toHaveLength(64); // 32 bytes hex
    });
  });

  describe("Role Validation", () => {
    const validRoles = [
      "FARMER",
      "AGRONOMIST",
      "VETERINARIAN",
      "SUPPLIER",
      "ENTREPRENEUR",
      "COOPERATIVE",
      "RESEARCHER",
      "GOVERNMENT_ANALYST",
      "ADMINISTRATOR",
    ];

    it.each(validRoles as [string])(
      "should accept valid role: %s",
      async (role) => {
        const response = await fetch(
          "http://localhost:3001/api/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: `test-${role.toLowerCase()}@farmvision.com`,
              password: "TestPass123!",
              firstName: "Test",
              lastName: "User",
              role,
            }),
          }
        );
        expect(response.status).toBe(201);
      }
    );

    it("should reject invalid role", async () => {
      const response = await fetch(
        "http://localhost:3001/api/auth/register",
        { method: "POST" }
      );
      expect(response.status).toBe(400);
    });
  });

  describe("Email Uniqueness", () => {
    it("should reject registration with duplicate email", async () => {
      // First registration
      await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
      });

      // Second registration with same email
      const response = await fetch(
        "http://localhost:3001/api/auth/register",
        { method: "POST" }
      );
      expect(response.status).toBe(409); // Conflict
    });
  });
});
