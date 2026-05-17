"use server";

import { redirect } from "next/navigation";

import { recordAuditEvent } from "@/lib/audit/log";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateInput } from "@/lib/validation/zod";
import { signInWithPasswordSchema } from "@/modules/auth/schemas";

export async function signInWithPasswordAction(formData: FormData) {
  const input = validateInput(
    signInWithPasswordSchema,
    Object.fromEntries(formData),
  );
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(input);

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  await recordAuditEvent({
    action: "auth.sign_in",
    actorUserId: data.user.id,
    metadata: {
      provider: "password",
    },
  });

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user) {
    await recordAuditEvent({
      action: "auth.sign_out",
      actorUserId: user.id,
    });
  }

  redirect("/login");
}
