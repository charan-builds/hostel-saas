import "server-only";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import { recordAuditEvent } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/guards";
import { publicEnv } from "@/lib/config/public-env";
import { AppError } from "@/lib/http/errors";
import type { PaymentSession } from "@/lib/payments/payment-provider";
import {
  createCashfreePaymentProvider,
} from "@/lib/payments/providers/cashfree/cashfree-provider";
import type { CashfreeWebhookPayload } from "@/lib/payments/providers/cashfree/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getInvoiceByCashfreeOrderId,
  getInvoiceById,
  listBillingFormOptions,
  listInvoiceItems,
  listInvoiceRows,
  listInvoiceSummaryRows,
  listPaymentAllocationsForInvoice,
  listPaymentsByIds,
  listReceiptsByPaymentIds,
  listStudentsByIds,
  listStudentIdsForInvoiceSearch,
} from "@/modules/billing/billing.repository";
import type {
  AddInvoiceAdjustmentInput,
  CreatePaymentSessionInput,
  CreateRentPlanInput,
  GenerateMonthlyInvoicesInput,
  ListInvoicesQuery,
  RecordInvoicePaymentInput,
  VoidBillingInvoiceInput,
} from "@/modules/billing/schemas";
import type { Database, Json } from "@/types/database.types";

export type BillingInvoice = Database["public"]["Tables"]["billing_invoices"]["Row"];
export type BillingInvoiceItem =
  Database["public"]["Tables"]["billing_invoice_items"]["Row"];
export type BillingPayment = Database["public"]["Tables"]["billing_payments"]["Row"];
export type BillingPaymentAllocation =
  Database["public"]["Tables"]["billing_payment_allocations"]["Row"];
export type BillingReceipt = Database["public"]["Tables"]["billing_receipts"]["Row"];
export type RentPlan = Database["public"]["Tables"]["rent_plans"]["Row"];

export type BillingStudentSummary = Pick<
  Database["public"]["Tables"]["students"]["Row"],
  | "first_name"
  | "email"
  | "hostel_branch_id"
  | "id"
  | "last_name"
  | "organization_id"
  | "phone"
  | "status"
  | "student_code"
>;

export type InvoiceListItem = BillingInvoice & {
  student?: BillingStudentSummary | undefined;
};

export type BillingSummary = {
  balanceCents: number;
  currencyCode: string;
  overdueCount: number;
  paidCents: number;
  pendingCount: number;
  totalCents: number;
};

const monthlyInvoiceGenerationResultSchema = z.object({
  generatedCount: z.number().int().min(0),
  invoiceMonth: z.string(),
  skippedCount: z.number().int().min(0),
});

const paymentRecordResultSchema = z.object({
  idempotent: z.boolean().optional(),
  paymentId: z.string().uuid(),
  receiptId: z.string().uuid(),
  receiptNumber: z.string(),
});

const paymentSessionResultSchema = z.object({
  amountCents: z.number().int().positive(),
  checkoutMode: z.literal("cashfree_payment_session"),
  currencyCode: z.string(),
  expiresAt: z.string().optional(),
  orderId: z.string(),
  paymentSessionId: z.string(),
  provider: z.literal("cashfree"),
});

const invoiceAdjustmentResultSchema = z.object({
  invoiceItemId: z.string().uuid(),
});

const voidInvoiceResultSchema = z.object({
  invoiceId: z.string().uuid(),
});

function requireOrganizationId(organizationId: string | undefined) {
  if (!organizationId) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "An active organization is required.",
      statusCode: 400,
    });
  }

  return organizationId;
}

function mapDatabaseError(error: { code?: string; message?: string }) {
  if (error.code === "02000" || error.code === "PGRST116") {
    return new AppError({
      code: "NOT_FOUND",
      details: error.code,
      message: "The requested invoice, payment, or rent plan was not found.",
      statusCode: 404,
    });
  }

  if (error.code === "23505") {
    return new AppError({
      code: "CONFLICT",
      details: error.code,
      message: "A matching invoice, receipt, or rent plan already exists.",
      statusCode: 409,
    });
  }

  if (error.code === "23503" || error.code === "23514") {
    return new AppError({
      code: "BAD_REQUEST",
      details: error.code,
      message: error.message ?? "The billing request is invalid.",
      statusCode: 400,
    });
  }

  if (error.code === "42501") {
    return new AppError({
      code: "FORBIDDEN",
      message: "You are not allowed to manage billing in this tenant.",
      statusCode: 403,
    });
  }

  return new AppError({
    code: "INTERNAL_ERROR",
    details: error.code,
    message: "Billing operation failed.",
    statusCode: 500,
    expose: false,
  });
}

function parseRpcResult<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
  message: string,
): z.output<TSchema> {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message,
      statusCode: 500,
      expose: false,
    });
  }

  return parsed.data;
}

function buildBillingSummary(
  rows: Pick<
    BillingInvoice,
    "balance_cents" | "currency_code" | "due_date" | "paid_cents" | "status" | "total_cents"
  >[],
): BillingSummary {
  const today = new Date().toISOString().slice(0, 10);

  return rows.reduce<BillingSummary>(
    (summary, row) => {
      if (row.status !== "void") {
        summary.totalCents += row.total_cents;
        summary.paidCents += row.paid_cents;
        summary.balanceCents += row.balance_cents;
      }

      if (row.status !== "void" && row.balance_cents > 0) {
        if (row.due_date < today || row.status === "overdue") {
          summary.overdueCount += 1;
        } else {
          summary.pendingCount += 1;
        }
      }

      summary.currencyCode = row.currency_code;

      return summary;
    },
    {
      balanceCents: 0,
      currencyCode: "INR",
      overdueCount: 0,
      paidCents: 0,
      pendingCount: 0,
      totalCents: 0,
    },
  );
}

function isPayableInvoice(invoice: BillingInvoice) {
  return ["pending", "partially_paid", "overdue"].includes(invoice.status);
}

function buildCashfreeOrderId(invoiceId: string, suffix?: string) {
  const compactInvoiceId = invoiceId.replaceAll("-", "");

  if (!suffix) {
    return `h_${compactInvoiceId}`;
  }

  return `h_${compactInvoiceId.slice(0, 26)}_${suffix.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12)}`;
}

function buildAbsoluteUrl(pathname: string) {
  return new URL(pathname, publicEnv.NEXT_PUBLIC_APP_URL);
}

function formatStudentName(student: BillingStudentSummary | undefined) {
  if (!student) {
    return undefined;
  }

  return [student.first_name, student.last_name].filter(Boolean).join(" ") || undefined;
}

function cashfreeAmountToCents(amount: number) {
  return Math.round(amount * 100);
}

export async function listInvoices(input: ListInvoicesQuery) {
  const context = await requirePermission("billing:read", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const studentSearchResult = await listStudentIdsForInvoiceSearch(
    supabase,
    organizationId,
    input.q,
    input.hostelBranchId,
  );

  if (studentSearchResult.error) {
    throw mapDatabaseError(studentSearchResult.error);
  }

  const [invoiceRowsResult, summaryRowsResult] = await Promise.all([
    listInvoiceRows({
      input,
      organizationId,
      studentSearchIds: (studentSearchResult.data ?? []).map((student) => student.id),
      supabase,
    }),
    listInvoiceSummaryRows(supabase, organizationId, input.hostelBranchId),
  ]);

  if (invoiceRowsResult.error) {
    throw mapDatabaseError(invoiceRowsResult.error);
  }

  if (summaryRowsResult.error) {
    throw mapDatabaseError(summaryRowsResult.error);
  }

  const invoiceRows = invoiceRowsResult.data ?? [];
  const studentIds = [
    ...new Set(invoiceRows.map((invoice) => invoice.student_id)),
  ];
  const studentsResult = await listStudentsByIds(supabase, studentIds);

  if (studentsResult.error) {
    throw mapDatabaseError(studentsResult.error);
  }

  const studentsById = new Map(
    (studentsResult.data ?? []).map((student) => [student.id, student]),
  );
  const invoices: InvoiceListItem[] = invoiceRows.map((invoice) => ({
    ...invoice,
    student: studentsById.get(invoice.student_id),
  }));

  return {
    count: invoiceRowsResult.count ?? 0,
    data: invoices,
    page: input.page,
    pageCount: Math.max(1, Math.ceil((invoiceRowsResult.count ?? 0) / input.limit)),
    summary: buildBillingSummary(summaryRowsResult.data ?? []),
  };
}

export async function getInvoice(invoiceId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: invoice, error } = await getInvoiceById(supabase, invoiceId);

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!invoice) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Invoice was not found.",
      statusCode: 404,
    });
  }

  await requirePermission("billing:read", {
    hostelBranchId: invoice.hostel_branch_id,
    organizationId: invoice.organization_id,
    product: "hostel_erp",
  });

  const [itemsResult, allocationsResult, studentsResult] = await Promise.all([
    listInvoiceItems(supabase, invoice.id),
    listPaymentAllocationsForInvoice(supabase, invoice.id),
    listStudentsByIds(supabase, [invoice.student_id]),
  ]);

  if (itemsResult.error) {
    throw mapDatabaseError(itemsResult.error);
  }

  if (allocationsResult.error) {
    throw mapDatabaseError(allocationsResult.error);
  }

  if (studentsResult.error) {
    throw mapDatabaseError(studentsResult.error);
  }

  const paymentIds = [
    ...new Set((allocationsResult.data ?? []).map((allocation) => allocation.payment_id)),
  ];
  const [paymentsResult, receiptsResult] = await Promise.all([
    listPaymentsByIds(supabase, paymentIds),
    listReceiptsByPaymentIds(supabase, paymentIds),
  ]);

  if (paymentsResult.error) {
    throw mapDatabaseError(paymentsResult.error);
  }

  if (receiptsResult.error) {
    throw mapDatabaseError(receiptsResult.error);
  }

  return {
    allocations: allocationsResult.data ?? [],
    invoice,
    items: itemsResult.data ?? [],
    payments: paymentsResult.data ?? [],
    receipts: receiptsResult.data ?? [],
    student: studentsResult.data?.[0],
  };
}

export async function getBillingFormOptions(hostelBranchId?: string) {
  const context = await requirePermission("billing:manage", {
    hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const effectiveBranchId = hostelBranchId ?? context.hostelBranchId;
  const supabase = await createSupabaseServerClient();
  const options = await listBillingFormOptions(
    supabase,
    organizationId,
    effectiveBranchId,
  );

  if (options.branches.error) {
    throw mapDatabaseError(options.branches.error);
  }

  if (options.students.error) {
    throw mapDatabaseError(options.students.error);
  }

  if (options.rooms.error) {
    throw mapDatabaseError(options.rooms.error);
  }

  if (options.beds.error) {
    throw mapDatabaseError(options.beds.error);
  }

  if (options.rentPlans.error) {
    throw mapDatabaseError(options.rentPlans.error);
  }

  return {
    beds: options.beds.data ?? [],
    branches: options.branches.data ?? [],
    organizationId,
    rentPlans: options.rentPlans.data ?? [],
    rooms: options.rooms.data ?? [],
    students: options.students.data ?? [],
  };
}

export async function createRentPlan(input: CreateRentPlanInput) {
  const context = await requirePermission("billing:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(
    input.organizationId ?? context.organizationId,
  );
  const supabase = await createSupabaseServerClient();
  const discountConfig: Json =
    input.monthlyDiscountCents > 0
      ? { monthly_discount_cents: input.monthlyDiscountCents }
      : {};
  const { data, error } = await supabase
    .from("rent_plans")
    .insert({
      amount_cents: input.amountCents,
      bed_id: input.scopeType === "bed" ? input.bedId ?? null : null,
      cashfree_config: {
        enabled: false,
        provider: "cashfree",
      },
      code: input.code,
      currency_code: input.currencyCode,
      discount_config: discountConfig,
      due_day: input.dueDay,
      ends_on: input.endsOn ?? null,
      hostel_branch_id: input.hostelBranchId,
      metadata: {},
      name: input.name,
      organization_id: organizationId,
      penalty_config: {},
      room_id:
        input.scopeType === "room" || input.scopeType === "bed"
          ? input.roomId ?? null
          : null,
      scope_type: input.scopeType,
      starts_on: input.startsOn,
      status: input.status,
      student_id: input.scopeType === "student" ? input.studentId ?? null : null,
      created_by: context.identity.userId,
      updated_by: context.identity.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  await recordAuditEvent({
    action: "billing.rent_plan.create",
    actorUserId: context.identity.userId,
    durable: true,
    entityId: data.id,
    entityTable: "rent_plans",
    hostelBranchId: input.hostelBranchId,
    metadata: {
      amount_cents: input.amountCents,
      due_day: input.dueDay,
      scope_type: input.scopeType,
    },
    organizationId,
  });

  return data;
}

export async function generateMonthlyInvoices(input: GenerateMonthlyInvoicesInput) {
  const context = await requirePermission("billing:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("generate_monthly_rent_invoices", {
    p_actor_user_id: context.identity.userId,
    p_hostel_branch_id: input.hostelBranchId,
    p_invoice_month: input.invoiceMonth,
    p_organization_id: input.organizationId,
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  return parseRpcResult(
    monthlyInvoiceGenerationResultSchema,
    data,
    "Invoice generation returned an invalid response.",
  );
}

export async function recordInvoicePayment(input: RecordInvoicePaymentInput) {
  const supabase = await createSupabaseServerClient();
  const { data: invoice, error: invoiceError } = await getInvoiceById(
    supabase,
    input.invoiceId,
  );

  if (invoiceError) {
    throw mapDatabaseError(invoiceError);
  }

  if (!invoice) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Invoice was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("payment:record", {
    hostelBranchId: invoice.hostel_branch_id,
    organizationId: invoice.organization_id,
    product: "hostel_erp",
  });
  const requestId = input.requestId ?? input.idempotencyKey;
  const { data, error } = await supabase.rpc("record_invoice_payment", {
    p_actor_user_id: context.identity.userId,
    p_amount_cents: input.amountCents,
    p_invoice_id: input.invoiceId,
    p_metadata: {
      source: "manual_offline",
    },
    p_payment_method: input.paymentMethod,
    p_received_at: input.receivedAt ?? new Date().toISOString(),
    ...(input.idempotencyKey === undefined
      ? {}
      : { p_idempotency_key: input.idempotencyKey }),
    ...(input.notes === undefined ? {} : { p_notes: input.notes }),
    ...(input.provider === undefined ? {} : { p_provider: input.provider }),
    ...(input.providerEventId === undefined
      ? {}
      : { p_provider_event_id: input.providerEventId }),
    ...(input.providerReference === undefined
      ? {}
      : { p_provider_reference: input.providerReference }),
    ...(requestId === undefined ? {} : { p_request_id: requestId }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  return parseRpcResult(
    paymentRecordResultSchema,
    data,
    "Payment recording returned an invalid response.",
  );
}

export async function createInvoicePaymentSession(input: CreatePaymentSessionInput) {
  const supabase = await createSupabaseServerClient();
  const { data: invoice, error: invoiceError } = await getInvoiceById(
    supabase,
    input.invoiceId,
  );

  if (invoiceError) {
    throw mapDatabaseError(invoiceError);
  }

  if (!invoice) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Invoice was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("payment:record", {
    hostelBranchId: invoice.hostel_branch_id,
    organizationId: invoice.organization_id,
    product: "hostel_erp",
  });

  if (!isPayableInvoice(invoice) || invoice.balance_cents <= 0) {
    throw new AppError({
      code: "CONFLICT",
      message: "Only unpaid, partially paid, or overdue invoices can be paid online.",
      statusCode: 409,
    });
  }

  const provider = createCashfreePaymentProvider();
  const existingOrderId = invoice.cashfree_order_id;

  if (existingOrderId) {
    const existingOrder = await provider.getOrder(
      existingOrderId,
      input.requestId ?? randomUUID(),
    );

    if (
      existingOrder?.paymentSessionId &&
      (existingOrder.status === "active" || existingOrder.status === "unknown")
    ) {
      if (invoice.cashfree_payment_session_id !== existingOrder.paymentSessionId) {
        const { error: updateError } = await supabase
          .from("billing_invoices")
          .update({
            cashfree_payment_session_id: existingOrder.paymentSessionId,
            updated_by: context.identity.userId,
          })
          .eq("id", invoice.id)
          .eq("organization_id", invoice.organization_id)
          .eq("hostel_branch_id", invoice.hostel_branch_id)
          .is("deleted_at", null);

        if (updateError) {
          throw mapDatabaseError(updateError);
        }
      }

      return paymentSessionResultSchema.parse({
        amountCents: existingOrder.amountCents,
        checkoutMode: "cashfree_payment_session",
        currencyCode: existingOrder.currencyCode,
        orderId: existingOrder.orderId,
        paymentSessionId: existingOrder.paymentSessionId,
        provider: "cashfree",
      });
    }

    if (existingOrder?.status === "paid") {
      throw new AppError({
        code: "CONFLICT",
        message: "This invoice already has a paid Cashfree order.",
        statusCode: 409,
      });
    }
  }

  const studentsResult = await listStudentsByIds(supabase, [invoice.student_id]);

  if (studentsResult.error) {
    throw mapDatabaseError(studentsResult.error);
  }

  const student = studentsResult.data?.[0];
  const returnUrl = buildAbsoluteUrl(`/billing/invoices/${invoice.id}`);
  returnUrl.searchParams.set("payment_provider", "cashfree");
  returnUrl.searchParams.set("invoice_id", invoice.id);

  const orderId = existingOrderId
    ? buildCashfreeOrderId(invoice.id, Date.now().toString(36))
    : buildCashfreeOrderId(invoice.id);

  const providerIdempotencyKey = existingOrderId ? randomUUID() : invoice.id;

  let paymentSession: PaymentSession | undefined;

  try {
    paymentSession = await provider.createPaymentSession({
      amountCents: invoice.balance_cents,
      currencyCode: invoice.currency_code,
      customer: {
        email: student?.email,
        id: invoice.student_id,
        name: formatStudentName(student),
        phone: student?.phone,
      },
      idempotencyKey: providerIdempotencyKey,
      invoiceId: invoice.id,
      notifyUrl: buildAbsoluteUrl("/api/webhooks/cashfree").toString(),
      orderId,
      requestId: input.requestId ?? randomUUID(),
      returnUrl: returnUrl.toString(),
    });
  } catch (error) {
    if (error instanceof AppError && error.code === "CONFLICT") {
      const existingOrder = await provider.getOrder(
        orderId,
        input.requestId ?? randomUUID(),
      );

      if (existingOrder?.paymentSessionId) {
        paymentSession = {
          amountCents: existingOrder.amountCents,
          checkoutMode: "cashfree_payment_session" as const,
          currencyCode: existingOrder.currencyCode,
          orderId: existingOrder.orderId,
          paymentSessionId: existingOrder.paymentSessionId,
          provider: "cashfree" as const,
        };
      }
    }

    if (!paymentSession) {
      throw error;
    }
  }

  const { error: updateError } = await supabase
    .from("billing_invoices")
    .update({
      cashfree_order_id: paymentSession.orderId,
      cashfree_payment_session_id: paymentSession.paymentSessionId,
      updated_by: context.identity.userId,
    })
    .eq("id", invoice.id)
    .eq("organization_id", invoice.organization_id)
    .eq("hostel_branch_id", invoice.hostel_branch_id)
    .is("deleted_at", null);

  if (updateError) {
    throw mapDatabaseError(updateError);
  }

  await recordAuditEvent({
    action: "billing.payment_session.create",
    actorUserId: context.identity.userId,
    durable: true,
    entityId: invoice.id,
    entityTable: "billing_invoices",
    hostelBranchId: invoice.hostel_branch_id,
    metadata: {
      amount_cents: paymentSession.amountCents,
      cashfree_order_id: paymentSession.orderId,
      has_cashfree_session: true,
      invoice_number: invoice.invoice_number,
      provider: "cashfree",
    },
    organizationId: invoice.organization_id,
    requestId: input.requestId,
  });

  return paymentSessionResultSchema.parse(paymentSession);
}

export async function processCashfreeWebhook(input: {
  eventId: string;
  eventTime?: string | undefined;
  eventType: string;
  payload: CashfreeWebhookPayload;
  requestId: string;
}) {
  const paymentStatus = input.payload.data.payment.payment_status.toUpperCase();
  const order = input.payload.data.order;
  const payment = input.payload.data.payment;
  const logMetadata = {
    cashfree_order_id: order.order_id,
    event_id: input.eventId,
    event_type: input.eventType,
    payment_status: paymentStatus,
    provider: "cashfree",
  };

  if (paymentStatus !== "SUCCESS") {
    await recordAuditEvent({
      action: "billing.cashfree_webhook.ignored",
      durable: true,
      entityTable: "billing_invoices",
      metadata: logMetadata,
      requestId: input.requestId,
    });

    return {
      processed: false,
      reason: `ignored_${paymentStatus.toLowerCase()}`,
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: invoice, error: invoiceError } = await getInvoiceByCashfreeOrderId(
    supabase,
    order.order_id,
  );

  if (invoiceError) {
    throw mapDatabaseError(invoiceError);
  }

  if (!invoice) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Invoice for Cashfree order was not found.",
      statusCode: 404,
    });
  }

  const paymentAmountCents = cashfreeAmountToCents(payment.payment_amount);

  if (payment.payment_currency !== invoice.currency_code) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "Cashfree webhook currency does not match the invoice.",
      statusCode: 400,
    });
  }

  if (paymentAmountCents <= 0) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "Cashfree webhook payment amount is invalid.",
      statusCode: 400,
    });
  }

  const { data, error } = await supabase.rpc("record_invoice_payment", {
    p_actor_user_id: null as unknown as string,
    p_amount_cents: paymentAmountCents,
    p_idempotency_key: input.eventId,
    p_invoice_id: invoice.id,
    p_metadata: {
      ...logMetadata,
      bank_reference: payment.bank_reference ?? null,
      cashfree_payment_time: payment.payment_time ?? null,
    },
    p_payment_method: "cashfree",
    p_provider: "cashfree",
    p_provider_event_id: input.eventId,
    p_provider_reference: payment.cf_payment_id,
    p_received_at: payment.payment_time ?? input.eventTime ?? new Date().toISOString(),
    p_request_id: input.requestId,
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const result = parseRpcResult(
    paymentRecordResultSchema,
    data,
    "Cashfree payment recording returned an invalid response.",
  );

  return {
    idempotent: result.idempotent ?? false,
    paymentId: result.paymentId,
    processed: true,
    receiptId: result.receiptId,
    receiptNumber: result.receiptNumber,
  };
}

export async function addInvoiceAdjustment(input: AddInvoiceAdjustmentInput) {
  const supabase = await createSupabaseServerClient();
  const { data: invoice, error: invoiceError } = await getInvoiceById(
    supabase,
    input.invoiceId,
  );

  if (invoiceError) {
    throw mapDatabaseError(invoiceError);
  }

  if (!invoice) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Invoice was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("billing:manage", {
    hostelBranchId: invoice.hostel_branch_id,
    organizationId: invoice.organization_id,
    product: "hostel_erp",
  });
  const { data, error } = await supabase.rpc("add_invoice_adjustment", {
    p_actor_user_id: context.identity.userId,
    p_amount_cents: input.amountCents,
    p_description: input.description,
    p_invoice_id: input.invoiceId,
    p_item_type: input.itemType,
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  return parseRpcResult(
    invoiceAdjustmentResultSchema,
    data,
    "Invoice adjustment returned an invalid response.",
  );
}

export async function voidBillingInvoice(input: VoidBillingInvoiceInput) {
  const supabase = await createSupabaseServerClient();
  const { data: invoice, error: invoiceError } = await getInvoiceById(
    supabase,
    input.invoiceId,
  );

  if (invoiceError) {
    throw mapDatabaseError(invoiceError);
  }

  if (!invoice) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Invoice was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("billing:manage", {
    hostelBranchId: invoice.hostel_branch_id,
    organizationId: invoice.organization_id,
    product: "hostel_erp",
  });
  const { data, error } = await supabase.rpc("void_billing_invoice", {
    p_actor_user_id: context.identity.userId,
    p_invoice_id: input.invoiceId,
    ...(input.reason === undefined ? {} : { p_reason: input.reason }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  return parseRpcResult(
    voidInvoiceResultSchema,
    data,
    "Invoice void returned an invalid response.",
  );
}
