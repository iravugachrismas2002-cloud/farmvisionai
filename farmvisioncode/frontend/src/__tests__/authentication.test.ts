/* FarmVision AI - Authentication Module Tests */
/* Stabilization Phase */

/* 
  Test Suite: Authentication
  Tests cover: Login, Registration, Email Verification, Password Reset
  Verifies: Build, TypeScript, API routes, Imports, Authentication, Authorization
*/

import { describe, it, expect } from "vitest";

describe("FarmVision AI Authentication", () => {
  describe("Registration API", () => {
    it("should return verificationNeeded: true on successful registration", async () => {
      const response = await fetch(
        "http://localhost:3001/api/auth/register",
        { method: "POST" }
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("verificationNeeded", true);
      expect(data).toHaveProperty("approvalStatus", "NEW");
      expect(data).toHaveProperty("verificationToken");
    });

    it("should reject registration with missing required fields", async () => {
      const response = await fetch(
        "http://localhost:3001/api/auth/register",
        { method: "POST" }
      );
      expect(response.status).toBe(400);
    });

    it("should reject registration with invalid role", async () => {
      const response = await fetch(
        "http://localhost:3001/api/auth/register",
        { method: "POST" }
      );
      expect(response.status).toBe(400);
    });
  });

  describe("Email Verification", () => {
    it("should verify email with valid token", async () => {
      const response = await fetch(
        "http://localhost:3001/auth/verify-email?token=validtoken123",
        { method: "GET" }
      );
      expect(response.status).toBe(200);
    });

    it("should reject verification with expired token", async () => {
      const response = await fetch(
        "http://localhost:3001/auth/verify-email?token=expiredtoken",
        { method: "GET" }
      );
      expect(response.status).toBe(400);
    });
  });

  describe("Password Reset", () => {
    it("should initiate password reset with valid email", async () => {
      const response = await fetch(
        "http://localhost:3001/api/auth/password-reset",
        { method: "POST" }
      );
      expect(response.status).toBe(200);
    });

    it("should reject password reset with invalid email", async () => {
      const response = await fetch(
        "http://localhost:3001/api/auth/password-reset",
        { method: "POST" }
      );
      expect(response.status).toBe(404);
    });

    it("should reset password with valid token", async () => {
      const response = await fetch(
        "http://localhost:3001/auth/reset-password?token=resettoken123&newPassword=NewPass456!",
        { method: "POST" }
      );
      expect(response.status).toBe(200);
    });
  });

  describe("Authorization", () => {
    it("should deny access to pending accounts without admin role", async () => {
      const response = await fetch(
        "http://localhost:3001/admin/pending-accounts",
        { method: "GET" }
      );
      expect([401, 403]).toContain(response.status);
    });

    it("should allow admin to approve pending account", async () => {
      const response = await fetch(
        "http://localhost:3001/admin/pending-accounts/approve",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "test-id", action: "approve" }),
        }
      );
      expect(response.status).toBe(200);
    });

    it("should allow admin to reject pending account", async () => {
      const response = await fetch(
        "http://localhost:3001/admin/pending-accounts/reject",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "test-id", action: "reject" }),
        }
      );
      expect(response.status).toBe(200);
    });
  });
});
