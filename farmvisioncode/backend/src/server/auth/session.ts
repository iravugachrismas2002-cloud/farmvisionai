import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { getFarmVisionAuthConfig } from "./config";
import { SESSION_MAX_AGE_SECONDS } from "./oauth-state";

export interface ApplicationSession {
  userId: string;
}

export async function createApplicationSession(userId: string): Promise<string> {
  const { jwtSecret } = getFarmVisionAuthConfig();
  const key = new TextEncoder().encode(jwtSecret);

  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(key);
}

export async function verifyApplicationSession(
  token: string,
): Promise<ApplicationSession | null> {
  try {
    const { jwtSecret } = getFarmVisionAuthConfig();
    const { payload, protectedHeader } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret),
      { algorithms: ["HS256"] },
    );

    if (
      protectedHeader.alg !== "HS256" ||
      typeof payload.userId !== "string" ||
      payload.userId.trim() === "" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
}
