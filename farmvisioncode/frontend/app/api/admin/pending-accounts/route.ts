import { NextResponse } from "next/server";
import { z } from "zod";
import { ApprovalStatus } from "../../../../../backend/src/generated/prisma/enums";
import { isTrustedAuthRequest } from "../../../../../backend/src/server/auth/request";
import { getCurrentUser } from "../../../../../backend/src/server/auth/current-user";
import { approveUser, rejectUser } from "../../../../../backend/src/server/auth/service";
import { getPrismaClient } from "../../../../../backend/src/server/db/prisma";

const actionSchema = z
  .object({
    userId: z.string().uuid("Invalid user id."),
    action: z.enum(["approve", "reject"]),
  })
  .strict();

function requireAdmin(user: { roles?: Array<{ role: string }> } | null) {
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const isAdmin = user.roles?.some((r) => r.role === "ADMINISTRATOR");
  if (!isAdmin) {
    return NextResponse.json({ error: "Administrator role required." }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  if (!isTrustedAuthRequest(request)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const adminCheck = requireAdmin(await getCurrentUser());
  if (adminCheck) return adminCheck;

  const pending = await getPrismaClient().user.findMany({
    where: { approvalStatus: ApprovalStatus.PENDING },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      roles: { select: { role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ pending });
}

export async function POST(request: Request) {
  if (!isTrustedAuthRequest(request)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const adminCheck = requireAdmin(await getCurrentUser());
  if (adminCheck) return adminCheck;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
      { status: 400 },
    );
  }

  if (parsed.data.action === "approve") {
    await approveUser(parsed.data.userId);
  } else {
    await rejectUser(parsed.data.userId);
  }

  return NextResponse.json({ message: `Account ${parsed.data.action}d successfully.` });
}
