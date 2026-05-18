export const AUTH_ROUTES = ["/login", "/student-login"] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/admin",
  "/super-admin",
  "/students",
  "/rooms",
  "/billing",
  "/notifications",
  "/notices",
  "/analytics",
  "/reports",
  "/leave",
  "/attendance",
  "/gate-passes",
  "/student-portal",
  "/api/v1",
] as const;

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route);
}

export function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getLoginUrl(requestUrl: string, pathname: string) {
  const url = new URL("/login", requestUrl);

  if (pathname !== "/") {
    url.searchParams.set("next", pathname);
  }

  return url;
}
