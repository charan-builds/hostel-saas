"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { recordAuditEvent } from "@/lib/audit/log";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateInput } from "@/lib/validation/zod";
import {
  sendStudentPhoneOtp,
  verifyStudentPhoneOtp,
} from "@/modules/auth/phone-auth.service";
import {
  signInWithPasswordSchema,
  studentPhoneOtpRequestSchema,
  studentPhoneOtpVerifySchema,
} from "@/modules/auth/schemas";

export async function signInWithPasswordAction(formData: FormData) {
  const input = validateInput(
    signInWithPasswordSchema,
    Object.fromEntries(formData),
  );
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(input);

  if (error) {
    const params = new URLSearchParams({
      error: "invalid_credentials",
    });

    if (input.redirectTo) {
      params.set("next", input.redirectTo);
    }

    redirect(`/login?${params.toString()}` as Route);
  }

  await recordAuditEvent({
    action: "auth.sign_in",
    actorUserId: data.user.id,
    metadata: {
      provider: "password",
    },
  });
  redirect((input.redirectTo ?? "/dashboard") as Route);
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

export async function requestStudentPhoneOtpAction(formData: FormData) {
  const input = validateInput(
    studentPhoneOtpRequestSchema,
    Object.fromEntries(formData),
  );
  let redirectPath: Route;

  try {
    const data = await sendStudentPhoneOtp(input);
    const params = new URLSearchParams({
      phone: data.phone,
      sent: "1",
    });

    if (input.redirectTo) {
      params.set("next", input.redirectTo);
    }

    redirectPath = `/student-login?${params.toString()}` as Route;
  } catch {
    const params = new URLSearchParams({
      error: "otp_request_failed",
    });

    if (input.redirectTo) {
      params.set("next", input.redirectTo);
    }

    redirectPath = `/student-login?${params.toString()}` as Route;
  }

  redirect(redirectPath);
}

export async function verifyStudentPhoneOtpAction(formData: FormData) {
  const input = validateInput(
    studentPhoneOtpVerifySchema,
    Object.fromEntries(formData),
  );
  let redirectPath: Route;

  try {
    const data = await verifyStudentPhoneOtp(input);

    redirectPath = data.redirectTo as Route;
  } catch {
    const params = new URLSearchParams({
      error: "otp_verify_failed",
      phone: input.phone,
      sent: "1",
    });

    if (input.redirectTo) {
      params.set("next", input.redirectTo);
    }

    redirectPath = `/student-login?${params.toString()}` as Route;
  }

  redirect(redirectPath);
}
