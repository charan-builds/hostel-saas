import "server-only";

import { z } from "zod";

import { AppError } from "@/lib/http/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

const claimsSchema = z
  .object({
    email: z.string().email().optional(),
    sub: z.string().uuid(),
  })
  .passthrough();

export type AuthIdentity = {
  email?: string | undefined;
  userId: string;
};

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export async function getCurrentIdentity(): Promise<AuthIdentity> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "Authentication is required.",
      statusCode: 401,
    });
  }

  const parsedClaims = claimsSchema.safeParse(data.claims);

  if (!parsedClaims.success) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "Invalid authentication claims.",
      statusCode: 401,
    });
  }

  return {
    email: parsedClaims.data.email,
    userId: parsedClaims.data.sub,
  };
}

export async function getOptionalIdentity() {
  try {
    return await getCurrentIdentity();
  } catch (error) {
    if (error instanceof AppError && error.code === "UNAUTHORIZED") {
      return null;
    }

    throw error;
  }
}

export async function getCurrentUserProfile(userId: string): Promise<UserProfile> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Unable to load the authenticated user profile.",
      statusCode: 500,
      expose: false,
    });
  }

  if (!data) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "Authenticated user profile was not found.",
      statusCode: 401,
    });
  }

  return data;
}
