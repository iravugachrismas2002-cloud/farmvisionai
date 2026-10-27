import { NextResponse } from "next/server";
import { z } from "zod";
import { FarmVisionRole } from "../../../../../backend/src/generated/prisma/enums";
import { isTrustedAuthRequest } from "../../../../../backend/src/server/auth/request";
import {
  createUser,
  sendVerificationEmail,
} from "../../../../../backend/src/server/auth/service";

const registrationSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(12).max(128),
}).strict();

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

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

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Check the registration details and try again.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  let created: Awaited<ReturnType<typeof createUser>>;
  try {
    created = await createUser({
      ...parsed.data,
      role: FarmVisionRole.FARMER,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    throw error;
  }

  let emailSent = true;
  try {
    await sendVerificationEmail(parsed.data.email, created.verificationToken);
  } catch {
    emailSent = false;
  }

  return NextResponse.json(
    {
      message: emailSent
        ? "Registration received. Check your email to verify your account. Sign-in is available after verification and account approval."
        : "Account created. Email delivery is not configured locally. Use the verification token below to verify via /api/auth/verify-email, then an administrator can approve your account.",
      email: created.user.email,
      emailSent,
      ...(!emailSent ? { verificationToken: created.verificationToken } : {}),
    },
    { status: 201 },
  );
}
