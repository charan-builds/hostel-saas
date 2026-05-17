"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateInput } from "@/lib/validation/zod";
import {
  assignStudentBedSchema,
  createStudentSchema,
  softDeleteStudentSchema,
  updateStudentSchema,
} from "@/modules/students/schemas";
import {
  assignStudentBed,
  createStudent,
  softDeleteStudent,
  updateStudent,
} from "@/modules/students/students.service";

export async function createStudentAction(formData: FormData) {
  const input = validateInput(createStudentSchema, Object.fromEntries(formData));

  await createStudent(input);
  revalidatePath("/students");
  redirect("/students");
}

export async function updateStudentAction(formData: FormData) {
  const input = validateInput(updateStudentSchema, Object.fromEntries(formData));

  await updateStudent(input);
  revalidatePath("/students");
  redirect("/students");
}

export async function assignStudentBedAction(formData: FormData) {
  const input = validateInput(assignStudentBedSchema, Object.fromEntries(formData));

  await assignStudentBed(input);
  revalidatePath("/students");
  redirect("/students");
}

export async function softDeleteStudentAction(formData: FormData) {
  const input = validateInput(softDeleteStudentSchema, Object.fromEntries(formData));

  await softDeleteStudent(input);
  revalidatePath("/students");
  redirect("/students");
}
