import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, getSessionCookieName } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getSessionCookieName())?.value;

  if (await verifySessionToken(token)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
