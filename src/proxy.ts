import { type NextRequest, NextResponse } from "next/server";

/** The admin sign-in page's real route. It is never served at this address, only at ADMIN_LOGIN_PATH. */
const ADMIN_LOGIN_ROUTE = "/admin/injira";
const ADMIN_LOGIN_PATH_PATTERN = /^\/admin\/[A-Za-z0-9_-]{12,}$/;

/** Private URL of the admin sign-in page (server-only env). Unset or invalid: admin sign-in is switched off. */
function adminLoginPath(): string | null {
  const path = process.env.ADMIN_LOGIN_PATH;
  return path && ADMIN_LOGIN_PATH_PATTERN.test(path) && path !== ADMIN_LOGIN_ROUTE ? path : null;
}

/** The site's ordinary 404 page, so the admin area looks exactly like a URL that does not exist. */
function notFound(request: NextRequest) {
  return NextResponse.rewrite(new URL("/404", request.url));
}

/**
 * Route protection. Learner pages bounce visitors without a session cookie to /injira. The admin area is internal:
 * nothing on the site links to it and, without an admin session, every /admin URL answers 404. Its sign-in page is
 * served only at ADMIN_LOGIN_PATH. The API still verifies every request; pages also check the session itself.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === adminLoginPath()) return NextResponse.rewrite(new URL(ADMIN_LOGIN_ROUTE, request.url));
    if (pathname === ADMIN_LOGIN_ROUTE || !request.cookies.has("gp_admin")) return notFound(request);
    return NextResponse.next();
  }

  if (request.cookies.has("gp_session")) return NextResponse.next();
  const url = new URL("/injira", request.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/ikibaho/:path*",
    "/imyitozo/:path*",
    "/ikizamini/:id+",
    "/ibizamini/:path*",
    "/umwirondoro/:path*",
    "/admin/:path*",
  ],
};
