import { NextResponse } from "next/server";
import { z } from "zod";
import { isTrustedAuthRequest } from "../../../../../backend/src/server/auth/request";
import { resetPassword } from "../../../../../backend/src/server/auth/service";

const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(256),
    password: z.string().min(12).max(128),
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

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid reset request.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const success = await resetPassword(parsed.data.token, parsed.data.password);
  if (!success) {
    return NextResponse.json(
      { error: "This password reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: "Your password has been reset successfully. You can now sign in.",
  });
}
