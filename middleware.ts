import { NextResponse, type NextRequest } from "next/server";
import {
  readSessionFromCookieValue,
  SESSION_COOKIE_KEY,
} from "@/lib/auth";

const repository = "dreamkit";
const basePath =
  process.env.GITHUB_PAGES === "true" ? `/${repository}` : "";

function withBasePath(path: string): string {
  return `${basePath}${path}`;
}

function isAdminPath(pathname: string): boolean {
  const adminRoot = withBasePath("/admin");
  return pathname === adminRoot || pathname.startsWith(`${adminRoot}/`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  // The login page itself must stay reachable while signed out. Compared
  // loosely because `trailingSlash: true` normalizes "/admin/login" to
  // "/admin/login/".
  const loginPath = withBasePath("/admin/login");
  if (pathname === loginPath || pathname === `${loginPath}/`) {
    return NextResponse.next();
  }

  const user = readSessionFromCookieValue(
    request.cookies.get(SESSION_COOKIE_KEY)?.value,
  );

  if (!user || user.role !== "admin") {
    return NextResponse.redirect(new URL(`${loginPath}/`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
