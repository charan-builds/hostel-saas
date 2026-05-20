import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildOrIlikeFilter } from "@/lib/db/postgrest-filters";
import type { ListBookingsQuery } from "@/modules/bookings/schemas";
import type { Database } from "@/types/database.types";

type SupabaseServerClient = SupabaseClient<Database>;

export async function getOrganizationByScope(
  supabase: SupabaseServerClient,
  input: {
    organizationId?: string | undefined;
    organizationSlug?: string | undefined;
  },
) {
  let query = supabase
    .from("organizations")
    .select("id,slug,status")
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(1);

  if (input.organizationId) {
    query = query.eq("id", input.organizationId);
  } else {
    query = query.eq("slug", input.organizationSlug ?? "");
  }

  return query.maybeSingle();
}

export async function getBranchByScope(
  supabase: SupabaseServerClient,
  input: {
    hostelBranchId?: string | undefined;
    hostelBranchSlug?: string | undefined;
    organizationId: string;
  },
) {
  let query = supabase
    .from("hostel_branches")
    .select("id,organization_id,slug,status,name")
    .eq("organization_id", input.organizationId)
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(1);

  if (input.hostelBranchId) {
    query = query.eq("id", input.hostelBranchId);
  } else {
    query = query.eq("slug", input.hostelBranchSlug ?? "");
  }

  return query.maybeSingle();
}

export async function listAvailabilityRooms(
  supabase: SupabaseServerClient,
  input: {
    categoryId?: string | undefined;
    hostelBranchId: string;
    organizationId: string;
    requestedBedCount: number;
    roomTemplateId?: string | undefined;
    roomType?: string | undefined;
  },
) {
  let query = supabase
    .from("rooms")
    .select(
      "id,organization_id,hostel_branch_id,room_code,name,room_type,capacity,status,monthly_rate_cents,security_deposit_cents,currency_code,category_id,template_id",
    )
    .eq("organization_id", input.organizationId)
    .eq("hostel_branch_id", input.hostelBranchId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("room_code", { ascending: true })
    .limit(100);

  if (input.categoryId) {
    query = query.eq("category_id", input.categoryId);
  }

  if (input.roomTemplateId) {
    query = query.eq("template_id", input.roomTemplateId);
  }

  if (input.roomType) {
    query = query.eq("room_type", input.roomType);
  }

  return query;
}

export async function listAvailableBedsForRooms(
  supabase: SupabaseServerClient,
  roomIds: string[],
) {
  if (roomIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("room_beds")
    .select("id,room_id,organization_id,hostel_branch_id,status")
    .in("room_id", roomIds)
    .eq("status", "available")
    .is("deleted_at", null);
}

export async function listActiveAssignmentsForRooms(
  supabase: SupabaseServerClient,
  roomIds: string[],
) {
  if (roomIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("student_room_assignments")
    .select("id,room_id,bed_id")
    .in("room_id", roomIds)
    .eq("status", "active")
    .is("end_date", null)
    .is("deleted_at", null);
}

export async function listRoomSelectionOptions(
  supabase: SupabaseServerClient,
  input: {
    hostelBranchId: string;
    organizationId: string;
  },
) {
  const [categories, templates] = await Promise.all([
    supabase
      .from("room_categories")
      .select("id,name,slug,monthly_rate_cents,security_deposit_cents,currency_code")
      .eq("organization_id", input.organizationId)
      .eq("hostel_branch_id", input.hostelBranchId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("room_templates")
      .select(
        "id,name,slug,room_type_key,default_capacity,monthly_rate_cents,security_deposit_cents,currency_code",
      )
      .eq("organization_id", input.organizationId)
      .eq("hostel_branch_id", input.hostelBranchId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ]);

  return { categories, templates };
}

export async function getRoomForPublicBooking(
  supabase: SupabaseServerClient,
  input: {
    hostelBranchId: string;
    organizationId: string;
    roomId: string;
  },
) {
  return supabase
    .from("rooms")
    .select("id,room_type,category_id,template_id,status")
    .eq("id", input.roomId)
    .eq("organization_id", input.organizationId)
    .eq("hostel_branch_id", input.hostelBranchId)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();
}

export async function getBookingRequestById(
  supabase: SupabaseServerClient,
  bookingRequestId: string,
) {
  return supabase
    .from("booking_requests")
    .select("*")
    .eq("id", bookingRequestId)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function getPublicBookingByToken(
  supabase: SupabaseServerClient,
  input: {
    bookingRequestId: string;
    tokenHash: string;
  },
) {
  return supabase
    .from("booking_requests")
    .select("*")
    .eq("id", input.bookingRequestId)
    .eq("public_access_token_hash", input.tokenHash)
    .gt("public_access_expires_at", new Date().toISOString())
    .is("deleted_at", null)
    .maybeSingle();
}

export async function listBookingRequestRows({
  input,
  organizationId,
  supabase,
}: {
  input: ListBookingsQuery;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  const from = (input.page - 1) * input.limit;
  const to = from + input.limit - 1;
  let query = supabase
    .from("booking_requests")
    .select("*", { count: "exact" })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (input.hostelBranchId) {
    query = query.eq("hostel_branch_id", input.hostelBranchId);
  }

  if (input.status) {
    query = query.eq("status", input.status);
  }

  if (input.q) {
    const filter = buildOrIlikeFilter(
      ["booking_code", "first_name", "last_name", "email", "phone"],
      input.q,
    );

    if (filter) {
      query = query.or(filter);
    }
  }

  return query;
}

export async function listBookingCollections(
  supabase: SupabaseServerClient,
  bookingRequestId: string,
) {
  const [history, payments, notes] = await Promise.all([
    supabase
      .from("booking_status_history")
      .select("*")
      .eq("booking_request_id", bookingRequestId)
      .order("created_at", { ascending: false }),
    supabase
      .from("booking_payments")
      .select("*")
      .eq("booking_request_id", bookingRequestId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("booking_notes")
      .select("*")
      .eq("booking_request_id", bookingRequestId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  return { history, notes, payments };
}

export async function getPendingBookingPayment(
  supabase: SupabaseServerClient,
  bookingRequestId: string,
) {
  return supabase
    .from("booking_payments")
    .select("*")
    .eq("booking_request_id", bookingRequestId)
    .eq("provider", "cashfree")
    .eq("status", "pending")
    .is("deleted_at", null)
    .maybeSingle();
}

export async function getBookingPaymentByCashfreeOrderId(
  supabase: SupabaseServerClient,
  orderId: string,
) {
  return supabase
    .from("booking_payments")
    .select("*")
    .eq("cashfree_order_id", orderId)
    .is("deleted_at", null)
    .maybeSingle();
}
