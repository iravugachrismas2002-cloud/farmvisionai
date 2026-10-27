import "server-only";
import { cookies } from "next/headers";
import { getPrismaClient } from "../../server/db/prisma";
import {
  SESSION_COOKIE_NAME,
} from "../../server/auth/oauth-state";
import { verifyApplicationSession } from "../../server/auth/session";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const session = await verifyApplicationSession(token);
  if (!session) {
    return null;
  }

  return getPrismaClient().user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      openId: true,
      name: true,
      email: true,
      roles: {
        select: { role: true },
      },
    },
  });
}
