import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getSessionCookieName } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string; password?: string };
  const allowedEmail = process.env.DASHBOARD_EMAIL || "admin@localhost";
  const allowedPassword = process.env.DASHBOARD_PASSWORD || "changeme";

  if (body.email !== allowedEmail || body.password !== allowedPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getSessionCookieName(), await createSessionToken(body.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });
  return response;
}
