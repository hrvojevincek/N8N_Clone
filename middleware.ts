import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token");

  if (sessionToken) {
    return NextResponse.redirect(new URL("/workflows", request.url));
  } else {
    return NextResponse.redirect(new URL("/n8n", request.url));
  }
}

export const config = {
  matcher: ["/"],
};
