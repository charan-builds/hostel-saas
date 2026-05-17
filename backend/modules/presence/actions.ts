"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateInput } from "@/lib/validation/zod";
import {
  createGatePass,
  createLeaveRequest,
  createVisitorPass,
  markAttendance,
  recordGatePassEvent,
  recordLeaveRequestEvent,
  recordVisitorPassEvent,
  reviewLeaveRequest,
} from "@/modules/presence/presence.service";
import {
  createGatePassSchema,
  createLeaveRequestSchema,
  createVisitorPassSchema,
  markAttendanceSchema,
  recordGatePassEventSchema,
  recordLeaveRequestEventSchema,
  recordVisitorPassEventSchema,
  reviewLeaveRequestSchema,
} from "@/modules/presence/schemas";

export async function createLeaveRequestAction(formData: FormData) {
  const input = validateInput(
    createLeaveRequestSchema,
    Object.fromEntries(formData),
  );

  await createLeaveRequest(input);
  revalidatePath("/leave");
  revalidatePath("/notifications");
  redirect("/leave");
}

export async function reviewLeaveRequestAction(formData: FormData) {
  const input = validateInput(
    reviewLeaveRequestSchema,
    Object.fromEntries(formData),
  );

  await reviewLeaveRequest(input);
  revalidatePath("/leave");
  revalidatePath("/notifications");
  redirect("/leave");
}

export async function recordLeaveRequestEventAction(formData: FormData) {
  const input = validateInput(
    recordLeaveRequestEventSchema,
    Object.fromEntries(formData),
  );

  await recordLeaveRequestEvent(input);
  revalidatePath("/leave");
  revalidatePath("/notifications");
  redirect("/leave");
}

export async function markAttendanceAction(formData: FormData) {
  const input = validateInput(markAttendanceSchema, Object.fromEntries(formData));

  await markAttendance(input);
  revalidatePath("/attendance");
  redirect("/attendance");
}

export async function createGatePassAction(formData: FormData) {
  const input = validateInput(createGatePassSchema, Object.fromEntries(formData));

  await createGatePass(input);
  revalidatePath("/gate-passes");
  revalidatePath("/notifications");
  redirect("/gate-passes");
}

export async function recordGatePassEventAction(formData: FormData) {
  const input = validateInput(
    recordGatePassEventSchema,
    Object.fromEntries(formData),
  );

  await recordGatePassEvent(input);
  revalidatePath("/gate-passes");
  revalidatePath("/notifications");
  redirect("/gate-passes");
}

export async function createVisitorPassAction(formData: FormData) {
  const input = validateInput(
    createVisitorPassSchema,
    Object.fromEntries(formData),
  );

  await createVisitorPass(input);
  revalidatePath("/gate-passes");
  revalidatePath("/notifications");
  redirect("/gate-passes");
}

export async function recordVisitorPassEventAction(formData: FormData) {
  const input = validateInput(
    recordVisitorPassEventSchema,
    Object.fromEntries(formData),
  );

  await recordVisitorPassEvent(input);
  revalidatePath("/gate-passes");
  revalidatePath("/notifications");
  redirect("/gate-passes");
}
