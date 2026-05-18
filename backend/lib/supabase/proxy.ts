import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getLoginUrl, isAuthRoute, isProtectedRoute } from "@/lib/auth/routes";
import { publicEnv } from "@/lib/config/public-env";
import {
  enforceRequestRateLimit,
  enforceSameOriginRequest,
  isMutationRequest,
} from "@/lib/security/request-protection";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import type { Database } from "@/types/database.types";

function finalizeProxyResponse(response: NextResponse, requestId: string) {
  response.headers.set("x-request-id", requestId);
  applySecurityHeaders(response.headers);

  return response;
}

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
    const originResponse = enforceSameOriginRequest(request, {
      requireOrigin: process.env.NODE_ENV === "production",
      requestId,
    });

    if (originResponse) {
      return finalizeProxyResponse(originResponse, requestId);
    }

    const rateLimitResponse = await enforceRequestRateLimit(request, {
      keyPrefix: isAuthRoute(pathname) ? "auth" : "protected",
      limit: isAuthRoute(pathname) ? 20 : 120,
    });

    if (rateLimitResponse) {
      return finalizeProxyResponse(rateLimitResponse, requestId);
    }
  }

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const response = NextResponse.redirect(getLoginUrl(request.url, pathname));

    return finalizeProxyResponse(response, requestId);
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    return finalizeProxyResponse(response, requestId);
  }

  return finalizeProxyResponse(supabaseResponse, requestId);
}
