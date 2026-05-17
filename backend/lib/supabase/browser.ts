import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/config/public-env";
import type { Database } from "@/types/database.types";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
