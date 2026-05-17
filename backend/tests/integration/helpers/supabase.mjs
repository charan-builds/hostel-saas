import { createClient } from "@supabase/supabase-js";

import { requireIntegrationEnv } from "./env.mjs";

export function createServiceClient() {
  const env = requireIntegrationEnv();

  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createPublicClient() {
  const env = requireIntegrationEnv();

  return createClient(env.supabaseUrl, env.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function createSignedInClient(email, password) {
  const client = createPublicClient();
  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return client;
}
