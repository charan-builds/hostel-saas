import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";

import { z } from "zod";

import { recordAuditEvent } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/guards";
import { normalizePhoneForAuth } from "@/lib/auth/phone-normalization";
import { publicEnv } from "@/lib/config/public-env";
import { AppError } from "@/lib/http/errors";
import type { PaymentSession } from "@/lib/payments/payment-provider";
import { createCashfreePaymentProvider } from "@/lib/payments/providers/cashfree/cashfree-provider";
import type { CashfreeWebhookPayload } from "@/lib/payments/providers/cashfree/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getBookingPaymentByCashfreeOrderId,
  getBookingRequestById,
  getBranchByScope,
  getOrganizationByScope,
  getPendingBookingPayment,
  getPublicBookingByToken,
  getRoomForPublicBooking,
  listActiveAssignmentsForRooms,
  listAvailabilityRooms,
  listAvailableBedsForRooms,
  listBookingCollections,
  listBookingRequestRows,
  listRoomSelectionOptions,
} from "@/modules/bookings/bookings.repository";
import type {
  BookingAvailabilityQuery,
  BookingPaymentSessionInput,
  ConvertBookingToStudentInput,
  CreateBookingNoteInput,
  CreatePublicBookingRequestInput,
  ListBookingsQuery,
  UpdateBookingStatusInput,
} from "@/modules/bookings/schemas";
import type { Database, Json } from "@/types/database.types";

type BookingRequestRow =
  Database["public"]["Tables"]["booking_requests"]["Row"];

const convertBookingResultSchema = z.object({
  assignmentId: z.string().uuid().nullable(),
  studentCode: z.string(),
  studentId: z.string().uuid(),
});

const bookingPaymentSessionResultSchema = z.object({
  amountCents: z.number().int().positive(),
  checkoutMode: z.literal("cashfree_payment_session"),
  currencyCode: z.string(),
  expiresAt: z.string().optional(),
  orderId: z.string(),
  paymentSessionId: z.string(),
  provider: z.literal("cashfree"),
});

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function createPublicAccessToken() {
  return randomBytes(32).toString("base64url");
}

function toJson(value: unknown): Json {
  try {
    return JSON.parse(JSON.stringify(value ?? {})) as Json;
  } catch {
    return {
      serialization_error: "Booking metadata was not JSON-safe.",
    };
  }
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
      expose: false,
      message,
      statusCode: 500,
    });
  }

  return parsed.data;
}

function mapDatabaseError(error: { code?: string; message?: string }) {
  if (error.code === "02000" || error.code === "PGRST116") {
    return new AppError({
      code: "NOT_FOUND",
      details: error.code,
      message: "The requested booking was not found.",
      statusCode: 404,
    });
  }

  if (error.code === "23505") {
    return new AppError({
      code: "CONFLICT",
      details: error.code,
      message: "An active booking or payment already exists for this request.",
      statusCode: 409,
    });
  }

  if (error.code === "23503" || error.code === "23514") {
    return new AppError({
      code: "BAD_REQUEST",
      details: error.code,
      message: "The booking request contains an invalid tenant, room, or payment selection.",
      statusCode: 400,
    });
  }

  if (error.code === "42501") {
    return new AppError({
      code: "FORBIDDEN",
      message: "You are not allowed to manage bookings in this tenant.",
      statusCode: 403,
    });
  }

  return new AppError({
    code: "INTERNAL_ERROR",
    details: error.code,
    expose: false,
    message: "Booking operation failed.",
    statusCode: 500,
  });
}

function isActiveBookingStatus(status: string) {
  return ["pending", "contacted", "approved"].includes(status);
}

function buildCashfreeBookingOrderId(bookingRequestId: string, suffix?: string) {
  const compactId = bookingRequestId.replaceAll("-", "");

  if (!suffix) {
    return `b_${compactId}`;
  }

  return `b_${compactId.slice(0, 26)}_${suffix.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12)}`;
}

function buildAbsoluteUrl(pathname: string) {
  return new URL(pathname, publicEnv.NEXT_PUBLIC_APP_URL);
}

function getBookingName(booking: Pick<BookingRequestRow, "first_name" | "last_name">) {
  return [booking.first_name, booking.last_name].filter(Boolean).join(" ");
}

function cashfreeAmountToCents(amount: number) {
  return Math.round(amount * 100);
}

async function resolvePublicScope(
  input: Pick<
    BookingAvailabilityQuery | CreatePublicBookingRequestInput,
    "hostelBranchId" | "hostelBranchSlug" | "organizationId" | "organizationSlug"
  >,
) {
  const supabase = createSupabaseAdminClient();
  const organizationResult = await getOrganizationByScope(supabase, input);

  if (organizationResult.error) {
    throw mapDatabaseError(organizationResult.error);
  }

  if (!organizationResult.data) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "This hostel is not accepting public booking requests.",
      statusCode: 404,
    });
  }

  const branchResult = await getBranchByScope(supabase, {
    hostelBranchId: input.hostelBranchId,
    hostelBranchSlug: input.hostelBranchSlug,
    organizationId: organizationResult.data.id,
  });

  if (branchResult.error) {
    throw mapDatabaseError(branchResult.error);
  }

  if (!branchResult.data) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "This hostel branch is not accepting public booking requests.",
      statusCode: 404,
    });
  }

  return {
    branch: branchResult.data,
    organization: organizationResult.data,
    supabase,
  };
}

export async function getPublicBookingAvailability(
  input: BookingAvailabilityQuery,
) {
  const { branch, organization, supabase } = await resolvePublicScope(input);
  const [roomsResult, optionResults] = await Promise.all([
    listAvailabilityRooms(supabase, {
      categoryId: input.categoryId,
      hostelBranchId: branch.id,
      organizationId: organization.id,
      requestedBedCount: input.requestedBedCount,
      roomTemplateId: input.roomTemplateId,
      roomType: input.roomType,
    }),
    listRoomSelectionOptions(supabase, {
      hostelBranchId: branch.id,
      organizationId: organization.id,
    }),
  ]);

  if (roomsResult.error) {
    throw mapDatabaseError(roomsResult.error);
  }

  if (optionResults.categories.error) {
    throw mapDatabaseError(optionResults.categories.error);
  }

  if (optionResults.templates.error) {
    throw mapDatabaseError(optionResults.templates.error);
  }

  const roomRows = roomsResult.data ?? [];
  const roomIds = roomRows.map((room) => room.id);
  const [bedsResult, assignmentsResult] = await Promise.all([
    listAvailableBedsForRooms(supabase, roomIds),
    listActiveAssignmentsForRooms(supabase, roomIds),
  ]);

  if (bedsResult.error) {
    throw mapDatabaseError(bedsResult.error);
  }

  if (assignmentsResult.error) {
    throw mapDatabaseError(assignmentsResult.error);
  }

  const assignedBedIds = new Set(
    (assignmentsResult.data ?? []).map((assignment) => assignment.bed_id),
  );
  const availableBedsByRoom = new Map<string, number>();

  for (const bed of bedsResult.data ?? []) {
    if (!assignedBedIds.has(bed.id)) {
      availableBedsByRoom.set(
        bed.room_id,
        (availableBedsByRoom.get(bed.room_id) ?? 0) + 1,
      );
    }
  }

  const rooms = roomRows
    .map((room) => ({
      availableBeds: availableBedsByRoom.get(room.id) ?? 0,
      capacity: room.capacity,
      categoryId: room.category_id,
      currencyCode: room.currency_code,
      hostelBranchId: room.hostel_branch_id,
      id: room.id,
      monthlyRateCents: room.monthly_rate_cents,
      name: room.name,
      organizationId: room.organization_id,
      roomCode: room.room_code,
      roomType: room.room_type,
      securityDepositCents: room.security_deposit_cents,
      templateId: room.template_id,
    }))
    .filter((room) => room.availableBeds >= input.requestedBedCount);

  return {
    branch: {
      id: branch.id,
      name: branch.name,
      slug: branch.slug,
    },
    categories: optionResults.categories.data ?? [],
    organization: {
      id: organization.id,
      slug: organization.slug,
    },
    rooms,
    templates: optionResults.templates.data ?? [],
  };
}

export async function createPublicBookingRequest(
  input: CreatePublicBookingRequestInput,
  options?: {
    ipAddress?: string | undefined;
    requestId?: string | undefined;
    userAgent?: string | undefined;
  },
) {
  if (input.companyName) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "Booking request failed validation.",
      statusCode: 400,
    });
  }

  const { branch, organization, supabase } = await resolvePublicScope(input);
  const normalizedPhone = normalizePhoneForAuth(input.phone).e164;
  let roomMetadata = {};
  let roomType = input.roomType;
  let roomCategoryId = input.categoryId;
  let roomTemplateId = input.roomTemplateId;

  if (input.roomId) {
    const roomResult = await getRoomForPublicBooking(supabase, {
      hostelBranchId: branch.id,
      organizationId: organization.id,
      roomId: input.roomId,
    });

    if (roomResult.error) {
      throw mapDatabaseError(roomResult.error);
    }

    if (!roomResult.data) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Selected room is not available for booking.",
        statusCode: 400,
      });
    }

    roomMetadata = {
      selected_room_status: roomResult.data.status,
    };
    roomType = roomType ?? roomResult.data.room_type;
    roomCategoryId = roomCategoryId ?? roomResult.data.category_id ?? undefined;
    roomTemplateId = roomTemplateId ?? roomResult.data.template_id ?? undefined;
  }

  const publicAccessToken = createPublicAccessToken();
  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      advance_amount_cents: input.advanceAmountCents,
      advance_currency_code: input.advanceCurrencyCode,
      advance_refundable: input.advanceRefundable,
      advance_required: input.advanceAmountCents > 0,
      email: input.email ?? null,
      expected_stay_months: input.expectedStayMonths ?? null,
      first_name: input.firstName,
      guardian_name: input.guardianName ?? null,
      guardian_phone: input.guardianPhone ?? null,
      hostel_branch_id: branch.id,
      ip_hash: options?.ipAddress ? hashValue(options.ipAddress) : null,
      last_name: input.lastName,
      message: input.message ?? null,
      metadata: toJson({
        ...roomMetadata,
        request_id: options?.requestId,
      }),
      move_in_date: input.moveInDate ?? null,
      organization_id: organization.id,
      phone: normalizedPhone,
      public_access_token_hash: hashValue(publicAccessToken),
      requested_bed_count: input.requestedBedCount,
      room_category_id: roomCategoryId ?? null,
      room_id: input.roomId ?? null,
      room_template_id: roomTemplateId ?? null,
      room_type: roomType ?? null,
      source: input.source,
      user_agent: options?.userAgent ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  if (input.message) {
    const noteResult = await supabase.from("booking_notes").insert({
      body: input.message,
      booking_request_id: data.id,
      hostel_branch_id: data.hostel_branch_id,
      metadata: {
        source: input.source,
      },
      note_type: "public_contact",
      organization_id: data.organization_id,
    });

    if (noteResult.error) {
      throw mapDatabaseError(noteResult.error);
    }
  }

  await recordAuditEvent({
    action: "booking.request.create",
    durable: true,
    entityId: data.id,
    entityTable: "booking_requests",
    hostelBranchId: data.hostel_branch_id,
    ipAddress: options?.ipAddress,
    metadata: {
      booking_code: data.booking_code,
      source: input.source,
    },
    organizationId: data.organization_id,
    requestId: options?.requestId,
    userAgent: options?.userAgent,
  });

  return {
    advanceAmountCents: data.advance_amount_cents,
    advanceCurrencyCode: data.advance_currency_code,
    advanceRefundable: data.advance_refundable,
    advanceRequired: data.advance_required,
    bookingCode: data.booking_code,
    bookingRequestId: data.id,
    publicAccessToken,
    status: data.status,
  };
}

export async function listBookingRequests(input: ListBookingsQuery) {
  const context = await requirePermission("booking:read", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = context.organizationId;

  if (!organizationId) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "An active organization is required.",
      statusCode: 400,
    });
  }

  const supabase = await createSupabaseServerClient();
  const { count, data, error } = await listBookingRequestRows({
    input,
    organizationId,
    supabase,
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  return {
    count: count ?? 0,
    data: data ?? [],
    page: input.page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / input.limit)),
  };
}

export async function getBookingRequest(bookingRequestId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: booking, error } = await getBookingRequestById(
    supabase,
    bookingRequestId,
  );

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!booking) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Booking request was not found.",
      statusCode: 404,
    });
  }

  await requirePermission("booking:read", {
    hostelBranchId: booking.hostel_branch_id,
    organizationId: booking.organization_id,
    product: "hostel_erp",
  });

  const collections = await listBookingCollections(supabase, booking.id);

  if (collections.history.error) {
    throw mapDatabaseError(collections.history.error);
  }

  if (collections.payments.error) {
    throw mapDatabaseError(collections.payments.error);
  }

  if (collections.notes.error) {
    throw mapDatabaseError(collections.notes.error);
  }

  return {
    booking,
    history: collections.history.data ?? [],
    notes: collections.notes.data ?? [],
    payments: collections.payments.data ?? [],
  };
}

export async function updateBookingStatus(input: UpdateBookingStatusInput) {
  const supabase = await createSupabaseServerClient();
  const { data: booking, error } = await getBookingRequestById(
    supabase,
    input.bookingRequestId,
  );

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!booking) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Booking request was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("booking:manage", {
    hostelBranchId: booking.hostel_branch_id,
    organizationId: booking.organization_id,
    product: "hostel_erp",
  });
  const advanceAmount =
    input.advanceAmountCents ?? booking.advance_amount_cents;
  const { data, error: updateError } = await supabase
    .from("booking_requests")
    .update({
      advance_amount_cents: advanceAmount,
      advance_currency_code:
        input.advanceCurrencyCode ?? booking.advance_currency_code,
      advance_refundable:
        input.advanceRefundable ?? booking.advance_refundable,
      advance_required: advanceAmount > 0,
      assigned_to: input.assignedTo ?? booking.assigned_to,
      last_contacted_at:
        input.status === "contacted" ? new Date().toISOString() : booking.last_contacted_at,
      status: input.status,
      updated_by: context.identity.userId,
    })
    .eq("id", booking.id)
    .eq("organization_id", booking.organization_id)
    .eq("hostel_branch_id", booking.hostel_branch_id)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (updateError) {
    throw mapDatabaseError(updateError);
  }

  if (input.note) {
    await addBookingNote({
      bookingRequestId: data.id,
      body: input.note,
      noteType: input.status === "contacted" ? "follow_up" : "internal",
    });
  }

  await recordAuditEvent({
    action: "booking.status.update",
    actorUserId: context.identity.userId,
    durable: true,
    entityId: booking.id,
    entityTable: "booking_requests",
    hostelBranchId: booking.hostel_branch_id,
    metadata: {
      from_status: booking.status,
      to_status: input.status,
    },
    organizationId: booking.organization_id,
  });

  return data;
}

export async function addBookingNote(input: CreateBookingNoteInput) {
  const supabase = await createSupabaseServerClient();
  const { data: booking, error } = await getBookingRequestById(
    supabase,
    input.bookingRequestId,
  );

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!booking) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Booking request was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("booking:manage", {
    hostelBranchId: booking.hostel_branch_id,
    organizationId: booking.organization_id,
    product: "hostel_erp",
  });
  const { data, error: insertError } = await supabase
    .from("booking_notes")
    .insert({
      actor_user_id: context.identity.userId,
      body: input.body,
      booking_request_id: booking.id,
      hostel_branch_id: booking.hostel_branch_id,
      note_type: input.noteType,
      organization_id: booking.organization_id,
    })
    .select("*")
    .single();

  if (insertError) {
    throw mapDatabaseError(insertError);
  }

  await recordAuditEvent({
    action: "booking.note.create",
    actorUserId: context.identity.userId,
    entityId: booking.id,
    entityTable: "booking_requests",
    hostelBranchId: booking.hostel_branch_id,
    metadata: {
      note_type: input.noteType,
    },
    organizationId: booking.organization_id,
  });

  return data;
}

export async function convertBookingToStudent(input: ConvertBookingToStudentInput) {
  const supabase = await createSupabaseServerClient();
  const { data: booking, error } = await getBookingRequestById(
    supabase,
    input.bookingRequestId,
  );

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!booking) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Booking request was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("booking:manage", {
    hostelBranchId: booking.hostel_branch_id,
    organizationId: booking.organization_id,
    product: "hostel_erp",
  });
  const { data, error: rpcError } = await supabase.rpc(
    "convert_booking_to_student",
    {
      p_actor_user_id: context.identity.userId,
      p_booking_request_id: booking.id,
      p_hostel_branch_id: booking.hostel_branch_id,
      p_organization_id: booking.organization_id,
      ...(input.bedId === undefined ? {} : { p_bed_id: input.bedId }),
      ...(input.roomId === undefined ? {} : { p_room_id: input.roomId }),
    },
  );

  if (rpcError) {
    throw mapDatabaseError(rpcError);
  }

  return parseRpcResult(
    convertBookingResultSchema,
    data,
    "Booking conversion returned an invalid response.",
  );
}

export async function createBookingPaymentSession(
  input: BookingPaymentSessionInput,
) {
  const supabase = createSupabaseAdminClient();
  const { data: booking, error } = await getPublicBookingByToken(supabase, {
    bookingRequestId: input.bookingRequestId,
    tokenHash: hashValue(input.accessToken),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!booking) {
    throw new AppError({
      code: "FORBIDDEN",
      message: "Booking payment link is invalid or expired.",
      statusCode: 403,
    });
  }

  if (!isActiveBookingStatus(booking.status)) {
    throw new AppError({
      code: "CONFLICT",
      message: "This booking is no longer payable.",
      statusCode: 409,
    });
  }

  if (!booking.advance_required || booking.advance_amount_cents <= 0) {
    throw new AppError({
      code: "CONFLICT",
      message: "This booking does not require an advance payment.",
      statusCode: 409,
    });
  }

  const provider = createCashfreePaymentProvider();
  const existingPaymentResult = await getPendingBookingPayment(supabase, booking.id);

  if (existingPaymentResult.error) {
    throw mapDatabaseError(existingPaymentResult.error);
  }

  const existingPayment = existingPaymentResult.data;

  if (existingPayment?.cashfree_order_id) {
    const existingOrder = await provider.getOrder(
      existingPayment.cashfree_order_id,
      input.requestId ?? randomUUID(),
    );

    if (
      existingOrder?.paymentSessionId &&
      (existingOrder.status === "active" || existingOrder.status === "unknown")
    ) {
      return bookingPaymentSessionResultSchema.parse({
        amountCents: existingOrder.amountCents,
        checkoutMode: "cashfree_payment_session",
        currencyCode: existingOrder.currencyCode,
        orderId: existingOrder.orderId,
        paymentSessionId: existingOrder.paymentSessionId,
        provider: "cashfree",
      });
    }
  }

  const returnUrl = buildAbsoluteUrl("/book");
  returnUrl.searchParams.set("booking_id", booking.id);
  returnUrl.searchParams.set("payment_provider", "cashfree");

  const orderId = buildCashfreeBookingOrderId(
    booking.id,
    existingPayment ? Date.now().toString(36) : undefined,
  );
  const idempotencyKey = input.idempotencyKey ?? booking.id;
  let paymentSession: PaymentSession | undefined;

  try {
    paymentSession = await provider.createPaymentSession({
      amountCents: booking.advance_amount_cents,
      bookingRequestId: booking.id,
      currencyCode: booking.advance_currency_code,
      customer: {
        email: booking.email,
        id: booking.id,
        name: getBookingName(booking),
        phone: booking.phone,
      },
      idempotencyKey,
      notifyUrl: buildAbsoluteUrl("/api/webhooks/cashfree").toString(),
      orderId,
      orderNote: `Booking advance ${booking.booking_code}`,
      orderTags: {
        booking_code: booking.booking_code,
        booking_request_id: booking.id,
        reference_type: "booking",
      },
      referenceId: booking.id,
      referenceType: "booking",
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

  const { error: paymentError } = await supabase.from("booking_payments").insert({
    amount_cents: paymentSession.amountCents,
    booking_request_id: booking.id,
    cashfree_order_id: paymentSession.orderId,
    cashfree_payment_session_id: paymentSession.paymentSessionId,
    currency_code: paymentSession.currencyCode,
    idempotency_key: idempotencyKey,
    metadata: {
      booking_code: booking.booking_code,
      provider: "cashfree",
    },
    organization_id: booking.organization_id,
    hostel_branch_id: booking.hostel_branch_id,
    refundable: booking.advance_refundable,
  });

  if (paymentError) {
    if (paymentError.code === "23505") {
      const existing = await getPendingBookingPayment(supabase, booking.id);

      if (existing.data?.cashfree_payment_session_id && existing.data.cashfree_order_id) {
        return bookingPaymentSessionResultSchema.parse({
          amountCents: existing.data.amount_cents,
          checkoutMode: "cashfree_payment_session",
          currencyCode: existing.data.currency_code,
          orderId: existing.data.cashfree_order_id,
          paymentSessionId: existing.data.cashfree_payment_session_id,
          provider: "cashfree",
        });
      }
    }

    throw mapDatabaseError(paymentError);
  }

  const updateResult = await supabase
    .from("booking_requests")
    .update({
      cashfree_order_id: paymentSession.orderId,
      cashfree_payment_session_id: paymentSession.paymentSessionId,
    })
    .eq("id", booking.id);

  if (updateResult.error) {
    throw mapDatabaseError(updateResult.error);
  }

  await recordAuditEvent({
    action: "booking.payment_session.create",
    durable: true,
    entityId: booking.id,
    entityTable: "booking_requests",
    hostelBranchId: booking.hostel_branch_id,
    metadata: {
      amount_cents: paymentSession.amountCents,
      booking_code: booking.booking_code,
      cashfree_order_id: paymentSession.orderId,
      provider: "cashfree",
    },
    organizationId: booking.organization_id,
    requestId: input.requestId,
  });

  return bookingPaymentSessionResultSchema.parse(paymentSession);
}

export async function processBookingCashfreeWebhook(input: {
  eventId: string;
  eventTime?: string | undefined;
  eventType: string;
  payload: CashfreeWebhookPayload;
  requestId: string;
}) {
  const paymentStatus = input.payload.data.payment.payment_status.toUpperCase();
  const order = input.payload.data.order;
  const payment = input.payload.data.payment;
  const supabase = createSupabaseAdminClient();
  const paymentResult = await getBookingPaymentByCashfreeOrderId(
    supabase,
    order.order_id,
  );

  if (paymentResult.error) {
    throw mapDatabaseError(paymentResult.error);
  }

  if (!paymentResult.data) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Booking payment for Cashfree order was not found.",
      statusCode: 404,
    });
  }

  const bookingPayment = paymentResult.data;

  if (paymentStatus !== "SUCCESS") {
    await supabase
      .from("booking_payments")
      .update({
        metadata: {
          ...((bookingPayment.metadata ?? {}) as object),
          cashfree_payment_status: paymentStatus,
        },
        status: paymentStatus === "FAILED" ? "failed" : bookingPayment.status,
      })
      .eq("id", bookingPayment.id);

    await recordAuditEvent({
      action: "booking.cashfree_webhook.ignored",
      durable: true,
      entityId: bookingPayment.booking_request_id,
      entityTable: "booking_requests",
      hostelBranchId: bookingPayment.hostel_branch_id,
      metadata: {
        cashfree_order_id: order.order_id,
        event_id: input.eventId,
        event_type: input.eventType,
        payment_status: paymentStatus,
      },
      organizationId: bookingPayment.organization_id,
      requestId: input.requestId,
    });

    return {
      processed: false,
      reason: `ignored_${paymentStatus.toLowerCase()}`,
    };
  }

  if (
    bookingPayment.status === "succeeded" &&
    bookingPayment.provider_event_id === input.eventId
  ) {
    return {
      bookingPaymentId: bookingPayment.id,
      idempotent: true,
      processed: true,
    };
  }

  const paymentAmountCents = cashfreeAmountToCents(payment.payment_amount);

  if (payment.payment_currency !== bookingPayment.currency_code) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "Cashfree webhook currency does not match the booking payment.",
      statusCode: 400,
    });
  }

  if (paymentAmountCents !== bookingPayment.amount_cents) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "Cashfree webhook amount does not match the booking payment.",
      statusCode: 400,
    });
  }

  const { data: updatedPayment, error: updateError } = await supabase
    .from("booking_payments")
    .update({
      idempotency_key: input.eventId,
      metadata: {
        ...((bookingPayment.metadata ?? {}) as object),
        bank_reference: payment.bank_reference ?? null,
        cashfree_payment_time: payment.payment_time ?? null,
        cashfree_payment_status: paymentStatus,
      },
      provider_event_id: input.eventId,
      provider_reference: payment.cf_payment_id,
      received_at: payment.payment_time ?? input.eventTime ?? new Date().toISOString(),
      status: "succeeded",
    })
    .eq("id", bookingPayment.id)
    .select("*")
    .single();

  if (updateError) {
    if (updateError.code === "23505") {
      return {
        bookingPaymentId: bookingPayment.id,
        idempotent: true,
        processed: true,
      };
    }

    throw mapDatabaseError(updateError);
  }

  const bookingResult = await getBookingRequestById(
    supabase,
    updatedPayment.booking_request_id,
  );

  if (bookingResult.error) {
    throw mapDatabaseError(bookingResult.error);
  }

  const bookingUpdateResult = await supabase
    .from("booking_requests")
    .update({
      metadata: {
        ...((bookingResult.data?.metadata ?? {}) as object),
        advance_paid: true,
        advance_payment_id: updatedPayment.id,
        advance_paid_at: updatedPayment.received_at,
      },
    })
    .eq("id", updatedPayment.booking_request_id)
    .eq("organization_id", updatedPayment.organization_id)
    .eq("hostel_branch_id", updatedPayment.hostel_branch_id);

  if (bookingUpdateResult.error) {
    throw mapDatabaseError(bookingUpdateResult.error);
  }

  await recordAuditEvent({
    action: "booking.payment.succeeded",
    durable: true,
    entityId: updatedPayment.booking_request_id,
    entityTable: "booking_requests",
    hostelBranchId: updatedPayment.hostel_branch_id,
    metadata: {
      amount_cents: updatedPayment.amount_cents,
      cashfree_order_id: order.order_id,
      event_id: input.eventId,
      payment_id: updatedPayment.id,
      provider_reference: payment.cf_payment_id,
    },
    organizationId: updatedPayment.organization_id,
    requestId: input.requestId,
  });

  return {
    bookingPaymentId: updatedPayment.id,
    idempotent: false,
    processed: true,
  };
}

export function shouldProcessCashfreeWebhookAsBooking(
  payload: CashfreeWebhookPayload,
) {
  const tags = payload.data.order.order_tags;
  const referenceType = typeof tags?.reference_type === "string"
    ? tags.reference_type
    : undefined;
  const bookingRequestId = typeof tags?.booking_request_id === "string"
    ? tags.booking_request_id
    : undefined;

  return (
    referenceType === "booking" ||
    Boolean(bookingRequestId) ||
    payload.data.order.order_id.startsWith("b_")
  );
}
