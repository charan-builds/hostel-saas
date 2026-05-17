"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateInput } from "@/lib/validation/zod";
import {
  acknowledgeNotice,
  createNotice,
  dismissNotification,
  enqueueBillingReminders,
  markNotificationRead,
  updateNotificationPreferences,
} from "@/modules/notifications/notifications.service";
import {
  acknowledgeNoticeSchema,
  createNoticeSchema,
  dismissNotificationSchema,
  enqueueBillingRemindersSchema,
  markNotificationReadSchema,
  updateNotificationPreferencesSchema,
} from "@/modules/notifications/schemas";

export async function createNoticeAction(formData: FormData) {
  const input = validateInput(createNoticeSchema, Object.fromEntries(formData));

  await createNotice(input);
  revalidatePath("/notices");
  revalidatePath("/notices/manage");
  revalidatePath("/notifications");
  redirect("/notices/manage");
}

export async function acknowledgeNoticeAction(formData: FormData) {
  const input = validateInput(
    acknowledgeNoticeSchema,
    Object.fromEntries(formData),
  );

  await acknowledgeNotice(input);
  revalidatePath("/notices");
  redirect("/notices");
}

export async function markNotificationReadAction(formData: FormData) {
  const input = validateInput(
    markNotificationReadSchema,
    Object.fromEntries(formData),
  );

  await markNotificationRead(input);
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  redirect("/notifications");
}

export async function dismissNotificationAction(formData: FormData) {
  const input = validateInput(
    dismissNotificationSchema,
    Object.fromEntries(formData),
  );

  await dismissNotification(input);
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  redirect("/notifications");
}

export async function updateNotificationPreferencesAction(formData: FormData) {
  const input = validateInput(
    updateNotificationPreferencesSchema,
    Object.fromEntries(formData),
  );

  await updateNotificationPreferences(input);
  revalidatePath("/notifications");
  redirect("/notifications");
}

export async function enqueueBillingRemindersAction(formData: FormData) {
  const input = validateInput(
    enqueueBillingRemindersSchema,
    Object.fromEntries(formData),
  );

  await enqueueBillingReminders(input);
  revalidatePath("/notifications");
  revalidatePath("/notices/manage");
  redirect("/notices/manage");
}
