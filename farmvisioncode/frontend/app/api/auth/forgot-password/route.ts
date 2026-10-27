import { NextResponse } from "next/server";
import { z } from "zod";
import { isTrustedAuthRequest } from "../../../../../backend/src/server/auth/request";
import {
  initiatePasswordReset,
  sendPasswordResetEmail,
} from "../../../../../backend/src/server/auth/service";

const forgotPasswordSchema = z
  .object({
    email: z.email().trim().toLowerCase(),
  })
  .strict();

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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  // Return the same shape for unknown addresses so callers do not disclose account existence.
  const result = await initiatePasswordReset(parsed.data.email);

  // If no reset token was generated (unknown email), still return success to prevent email enumeration.
  if (!result.resetToken) {
    return NextResponse.json({
      message: "If an account exists for this email, a password reset link has been sent.",
    });
  }

  let emailSent = true;
  try {
    await sendPasswordResetEmail(parsed.data.email, result.resetToken);
  } catch {
    emailSent = false;
  }

  return NextResponse.json({
    message: emailSent
      ? "If an account exists for this email, a password reset link has been sent."
      : "Password reset token generated. Email delivery is not configured locally; use the token below to reset your password.",
    emailSent,
    ...(!emailSent ? { resetToken: result.resetToken } : {}),
  });
}
