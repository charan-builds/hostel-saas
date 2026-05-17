import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/config/server-env";
import type { Database } from "@/types/database.types";

export function createSupabaseAdminClient() {
  const secretKey =
    serverEnv.SUPABASE_SECRET_KEY ?? serverEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY or legacy SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient<Database>(serverEnv.NEXT_PUBLIC_SUPABASE_URL, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "hostel-erp-admin",
      },
    },
  });
}
