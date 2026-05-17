"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";

import { validateInput } from "@/lib/validation/zod";
import {
  createHostelBranchSchema,
  createHostelFloorSchema,
  createRoomBedSchema,
  createRoomSchema,
  createRoomTemplateSchema,
  softDeleteRoomSchema,
  transferStudentBedSchema,
  unassignStudentBedSchema,
  updateRoomBedStatusSchema,
  updateRoomSchema,
} from "@/modules/rooms/schemas";
import {
  createHostelBranch,
  createHostelFloor,
  createRoom,
  createRoomBed,
  createRoomTemplate,
  softDeleteRoom,
  transferStudentBed,
  unassignStudentBed,
  updateRoom,
  updateRoomBedStatus,
} from "@/modules/rooms/rooms.service";

function getRoomRedirect(formData: FormData) {
  const roomId = formData.get("redirectRoomId");

  return typeof roomId === "string" && roomId.length > 0
    ? (`/rooms/${roomId}` as Route)
    : "/rooms";
}

export async function createRoomAction(formData: FormData) {
  const input = validateInput(createRoomSchema, Object.fromEntries(formData));
  const room = await createRoom(input);

  revalidatePath("/rooms");
  redirect(`/rooms/${room.roomId}`);
}

export async function createHostelBranchAction(formData: FormData) {
  const input = validateInput(
    createHostelBranchSchema,
    Object.fromEntries(formData),
  );

  await createHostelBranch(input);
  revalidatePath("/rooms/settings");
  revalidatePath("/rooms/new");
  redirect("/rooms/settings");
}

export async function createHostelFloorAction(formData: FormData) {
  const input = validateInput(
    createHostelFloorSchema,
    Object.fromEntries(formData),
  );

  await createHostelFloor(input);
  revalidatePath("/rooms/settings");
  revalidatePath("/rooms/new");
  redirect("/rooms/settings");
}

export async function createRoomTemplateAction(formData: FormData) {
  const input = validateInput(
    createRoomTemplateSchema,
    Object.fromEntries(formData),
  );

  await createRoomTemplate(input);
  revalidatePath("/rooms/settings");
  revalidatePath("/rooms/new");
  redirect("/rooms/settings");
}

export async function updateRoomAction(formData: FormData) {
  const input = validateInput(updateRoomSchema, Object.fromEntries(formData));

  await updateRoom(input);
  revalidatePath("/rooms");
  revalidatePath(`/rooms/${input.roomId}`);
  redirect(`/rooms/${input.roomId}`);
}

export async function softDeleteRoomAction(formData: FormData) {
  const input = validateInput(softDeleteRoomSchema, Object.fromEntries(formData));

  await softDeleteRoom(input);
  revalidatePath("/rooms");
  redirect("/rooms");
}

export async function createRoomBedAction(formData: FormData) {
  const input = validateInput(createRoomBedSchema, Object.fromEntries(formData));

  await createRoomBed(input);
  revalidatePath("/rooms");
  revalidatePath(`/rooms/${input.roomId}`);
  redirect(`/rooms/${input.roomId}`);
}

export async function updateRoomBedStatusAction(formData: FormData) {
  const input = validateInput(
    updateRoomBedStatusSchema,
    Object.fromEntries(formData),
  );

  await updateRoomBedStatus(input);
  const redirectTo = getRoomRedirect(formData);
  revalidatePath("/rooms");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function transferStudentBedAction(formData: FormData) {
  const input = validateInput(
    transferStudentBedSchema,
    Object.fromEntries(formData),
  );

  await transferStudentBed(input);
  const redirectTo = getRoomRedirect(formData);
  revalidatePath("/rooms");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function unassignStudentBedAction(formData: FormData) {
  const input = validateInput(
    unassignStudentBedSchema,
    Object.fromEntries(formData),
  );

  await unassignStudentBed(input);
  const redirectTo = getRoomRedirect(formData);
  revalidatePath("/rooms");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}
