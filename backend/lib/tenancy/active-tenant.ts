import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { z } from "zod";

import { SAAS_PRODUCTS } from "@/types/domain";

export const ACTIVE_ORGANIZATION_COOKIE = "hostel_erp_active_organization_id";
export const ACTIVE_PRODUCT_COOKIE = "hostel_erp_active_product";

const activeTenantCookieSchema = z.object({
  organizationId: z.string().uuid().optional(),
  product: z.enum(SAAS_PRODUCTS).default("hostel_erp"),
});

export async function getActiveTenantCookie() {
  const cookieStore = await cookies();
  const parsed = activeTenantCookieSchema.safeParse({
    organizationId: cookieStore.get(ACTIVE_ORGANIZATION_COOKIE)?.value,
    product: cookieStore.get(ACTIVE_PRODUCT_COOKIE)?.value,
  });

  return parsed.success ? parsed.data : { product: "hostel_erp" as const };
}

export async function setActiveTenantCookie(input: {
  organizationId: string;
  product?: (typeof SAAS_PRODUCTS)[number];
}) {
  const cookieStore = await cookies();
  const product = input.product ?? "hostel_erp";
  const options = getActiveTenantCookieOptions();

  cookieStore.set(ACTIVE_ORGANIZATION_COOKIE, input.organizationId, options);
  cookieStore.set(ACTIVE_PRODUCT_COOKIE, product, options);
}

export function getActiveTenantCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function applyActiveTenantCookies(
  response: NextResponse,
  input: {
    organizationId: string;
    product?: (typeof SAAS_PRODUCTS)[number];
  },
) {
  const options = getActiveTenantCookieOptions();

  response.cookies.set(ACTIVE_ORGANIZATION_COOKIE, input.organizationId, options);
  response.cookies.set(ACTIVE_PRODUCT_COOKIE, input.product ?? "hostel_erp", options);

  return response;
}
