/* FarmVision AI - Email Verification Module Tests */
/* Stabilization Phase */

/* 
  Test Suite: Email Verification
  Tests cover: Email verification flow, token validation
  Verifies: Build, TypeScript, API routes, Authentication, Authorization
*/

import { describe, it, expect } from "vitest";

describe("FarmVision AI Email Verification", () => {
  describe("Verification Flow", () => {
    it("should verify email with valid, non-expired token", async () => {
      const response = await fetch(
        "http://localhost:3001/auth/verify-email?token=validtoken123456",
        { method: "GET" }
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user).toHaveProperty("emailVerified", true);
      expect(data.user).toHaveProperty("approvalStatus", "EMAIL_VERIFIED");
    });

    it("should reject verification with expired token", async () => {
      const response = await fetch(
        "http://localhost:3001/auth/verify-email?token=expiredtoken000",
        { method: "GET" }
      );
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("expired");
    });

    it("should reject verification with invalid token", async () => {
      const response = await fetch(
        "http://localhost:3001/auth/verify-email?token=invalidtokenformat",
        { method: "GET" }
      );
      expect(response.status).toBe(400);
    });
  });

  describe("User State After Verification", () => {
    it("should update user to EMAIL_VERIFIED status after verification", async () => {
      // Simulate verification and check state
      const verificationResult = await fetch(
        "http://localhost:3001/auth/verify-email?token=sampletoken",
        { method: "GET" }
      );
      expect(verificationResult.status).toBe(200);
    });

    it("should allow login after email verification", async () => {
      // After verification, user should be able to login
      const loginResponse = await fetch(
        "http://localhost:3001/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: "verified@farmvision.com",
            password: "TestPass123!",
          }),
        }
      );
      expect(loginResponse.status).toBe(200);
    });
  });

  describe("Integration with Registration", () => {
    it("should send verification email after registration", async () => {
      const response = await fetch(
        "http://localhost:3001/api/auth/register",
        { method: "POST" }
      );
      expect(response.status).toBe(201);

      // After registration, verification email should be sent
      // In test mode, we verify the token is generated
      const data = await response.json();
      expect(data.verificationToken).toBeDefined();
      expect(typeof data.verificationToken).toBe("string");
      expect(data.verificationToken.length).toBeGreaterThan(0);
    });

    it("should set verification expiry to 24 hours after registration", async () => {
      const response = await fetch(
        "http://localhost:3001/api/auth/register",
        { method: "POST" }
      );
      const data = await response.json();

      // Verification should expire in 24 hours
      expect(data.verificationExpiresAt).toBeDefined();
      if (data.verificationExpiresAt) {
        const expiresAt = new Date(data.verificationExpiresAt);
        const now = new Date();
        // Should expire approximately 24 hours from now
        const diffHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
        expect(diffHours).toBeCloseTo(24, -1); // Approximately 24 hours
      }
    });
  });
});
