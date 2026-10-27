import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  decodeOAuthState,
  encodeOAuthState,
  isAllowedAppOrigin,
} from "../../src/server/auth/oauth-state";

describe("Manus OAuth state", () => {
  beforeEach(() => {
    vi.stubEnv(
      "APP_ALLOWED_ORIGINS",
      "http://localhost:3000,https://preview.example.test",
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips the callback URI and a single-use nonce", () => {
    const state = {
      redirectUri: "http://localhost:3000/api/auth/callback",
      nonce: "a".repeat(43),
    };

    expect(decodeOAuthState(encodeOAuthState(state))).toEqual(state);
  });

  it("rejects malformed or incomplete state", () => {
    expect(decodeOAuthState("not-base64-json")).toBeNull();
    expect(
      decodeOAuthState(
        Buffer.from(JSON.stringify({ redirectUri: "https://example.test" }))
          .toString("base64url"),
      ),
    ).toBeNull();
  });

  it("allows only an exact configured browser origin", () => {
    expect(isAllowedAppOrigin("http://localhost:3000")).toBe(true);
    expect(isAllowedAppOrigin("https://preview.example.test")).toBe(true);
    expect(isAllowedAppOrigin("https://attacker.example.test")).toBe(false);
    expect(isAllowedAppOrigin("http://localhost:3000/path")).toBe(false);
  });
});
