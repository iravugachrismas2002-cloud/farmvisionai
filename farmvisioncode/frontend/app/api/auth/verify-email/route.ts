import { NextResponse } from "next/server";
import { z } from "zod";
import { isTrustedAuthRequest } from "../../../../../backend/src/server/auth/request";
import { verifyEmail } from "../../../../../backend/src/server/auth/service";

const verificationSchema = z.object({ token: z.string().min(32).max(256) }).strict();

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

  const parsed = verificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Verification link is invalid or expired." }, { status: 400 });
  }

  const result = await verifyEmail(parsed.data.token);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    message: "Email verified. Your account must be approved before you can sign in.",
  });
}
