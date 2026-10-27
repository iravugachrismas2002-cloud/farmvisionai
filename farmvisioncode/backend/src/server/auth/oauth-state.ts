import { z } from "zod";

export const OAUTH_NONCE_COOKIE_NAME = "farmvision_oauth_nonce";
export const OAUTH_NONCE_MAX_AGE_SECONDS = 10 * 60;
export const OAUTH_CALLBACK_PATH = "/api/auth/callback";
export const SESSION_COOKIE_NAME = "webdev_app_session";
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

const oauthStateSchema = z.object({
  redirectUri: z.string().url(),
  nonce: z.string().min(32).max(256),
});

export type OAuthState = z.infer<typeof oauthStateSchema>;

export function encodeOAuthState(state: OAuthState): string {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function decodeOAuthState(encoded: string): OAuthState | null {
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    const result = oauthStateSchema.safeParse(JSON.parse(json) as unknown);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function isAllowedAppOrigin(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (
      (parsed.protocol !== "https:" && parsed.protocol !== "http:") ||
      parsed.origin !== value ||
      parsed.pathname !== "/" ||
      parsed.search !== "" ||
      parsed.hash !== ""
    ) {
      return false;
    }

    const configuredOrigins = (process.env.APP_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    return configuredOrigins.includes(parsed.origin);
  } catch {
    return false;
  }
}
