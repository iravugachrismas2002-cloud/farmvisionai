import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../../../backend/src/server/auth/oauth-state";

export async function POST() {
  const response = NextResponse.json({ message: "Signed out successfully." });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}