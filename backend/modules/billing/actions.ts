"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateInput } from "@/lib/validation/zod";
import {
  addInvoiceAdjustment,
  createRentPlan,
  generateMonthlyInvoices,
  recordInvoicePayment,
  voidBillingInvoice,
} from "@/modules/billing/billing.service";
import {
  addInvoiceAdjustmentSchema,
  createRentPlanSchema,
  generateMonthlyInvoicesSchema,
  recordInvoicePaymentSchema,
  voidBillingInvoiceSchema,
} from "@/modules/billing/schemas";

function invoiceRedirect(invoiceId: string): Route {
  return `/billing/invoices/${invoiceId}` as Route;
}

export async function createRentPlanAction(formData: FormData) {
  const input = validateInput(createRentPlanSchema, Object.fromEntries(formData));

  await createRentPlan(input);
  revalidatePath("/billing");
  revalidatePath("/billing/rent-plans/new");
  redirect("/billing");
}

export async function generateMonthlyInvoicesAction(formData: FormData) {
  const input = validateInput(
    generateMonthlyInvoicesSchema,
    Object.fromEntries(formData),
  );

  await generateMonthlyInvoices(input);
  revalidatePath("/billing");
  redirect(`/billing?hostelBranchId=${input.hostelBranchId}` as Route);
}

export async function recordInvoicePaymentAction(formData: FormData) {
  const input = validateInput(
    recordInvoicePaymentSchema,
    Object.fromEntries(formData),
  );

  await recordInvoicePayment(input);
  revalidatePath("/billing");
  revalidatePath(invoiceRedirect(input.invoiceId));
  redirect(invoiceRedirect(input.invoiceId));
}

export async function addInvoiceAdjustmentAction(formData: FormData) {
  const input = validateInput(
    addInvoiceAdjustmentSchema,
    Object.fromEntries(formData),
  );

  await addInvoiceAdjustment(input);
  revalidatePath("/billing");
  revalidatePath(invoiceRedirect(input.invoiceId));
  redirect(invoiceRedirect(input.invoiceId));
}

export async function voidBillingInvoiceAction(formData: FormData) {
  const input = validateInput(
    voidBillingInvoiceSchema,
    Object.fromEntries(formData),
  );

  await voidBillingInvoice(input);
  revalidatePath("/billing");
  revalidatePath(invoiceRedirect(input.invoiceId));
  redirect("/billing");
}
