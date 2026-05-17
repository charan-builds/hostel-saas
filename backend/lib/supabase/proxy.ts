import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getLoginUrl, isAuthRoute, isProtectedRoute } from "@/lib/auth/routes";
import { publicEnv } from "@/lib/config/public-env";
import {
  enforceRequestRateLimit,
  enforceSameOriginRequest,
  isMutationRequest,
} from "@/lib/security/request-protection";
import type { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims.sub);
  const { pathname } = request.nextUrl;
  const requestId =
    request.headers.get("x-request-id") ??
    request.headers.get("x-correlation-id") ??
    crypto.randomUUID();
  const shouldProtectMutation =
    isMutationRequest(request) && (isProtectedRoute(pathname) || isAuthRoute(pathname));

  if (shouldProtectMutation) {
    const originResponse = enforceSameOriginRequest(request, [
      request.nextUrl.origin,
      publicEnv.NEXT_PUBLIC_APP_URL,
    ], {
      requireOrigin: process.env.NODE_ENV === "production",
    });

    if (originResponse) {
      originResponse.headers.set("x-request-id", requestId);

      return originResponse;
    }

    const rateLimitResponse = await enforceRequestRateLimit(request, {
      keyPrefix: isAuthRoute(pathname) ? "auth" : "protected",
      limit: isAuthRoute(pathname) ? 20 : 120,
    });

    if (rateLimitResponse) {
      rateLimitResponse.headers.set("x-request-id", requestId);

      return rateLimitResponse;
    }
  }

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const response = NextResponse.redirect(getLoginUrl(request.url, pathname));

    response.headers.set("x-request-id", requestId);

    return response;
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    response.headers.set("x-request-id", requestId);

    return response;
  }

  supabaseResponse.headers.set("x-request-id", requestId);

  return supabaseResponse;
}
