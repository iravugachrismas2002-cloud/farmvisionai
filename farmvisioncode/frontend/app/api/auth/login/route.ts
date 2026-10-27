import { NextResponse } from "next/server";
import { z } from "zod";
import { ApprovalStatus } from "../../../../../backend/src/generated/prisma/enums";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "../../../../../backend/src/server/auth/oauth-state";
import { isTrustedAuthRequest } from "../../../../../backend/src/server/auth/request";
import { createApplicationSession } from "../../../../../backend/src/server/auth/session";
import { findUserByEmail, verifyPassword } from "../../../../../backend/src/server/auth/service";

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(128),
}).strict();

export async function POST(request: Request) {
  if (!isTrustedAuthRequest(request)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address and password." },
      { status: 400 },
    );
  }

  const user = await findUserByEmail(parsed.data.email);
  if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "Verify your email address before signing in." },
      { status: 403 },
    );
  }
  if (user.approvalStatus !== ApprovalStatus.APPROVED) {
    return NextResponse.json(
      {
        error: user.approvalStatus === ApprovalStatus.REJECTED
          ? "This account was not approved. Contact the FarmVision administrator."
          : "Your email is verified. Your account is awaiting administrator approval.",
      },
      { status: 403 },
    );
  }

  const sessionToken = await createApplicationSession(user.id);
  const response = NextResponse.json({ message: "Signed in successfully." });
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
