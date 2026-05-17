import "server-only";

import { buildOrIlikeFilter } from "@/lib/db/postgrest-filters";
import type { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ListRoomsQuery } from "@/modules/rooms/schemas";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type ListRoomRowsOptions = {
  input: ListRoomsQuery;
  organizationId: string;
  supabase: SupabaseServerClient;
};

export async function listRoomRows({
  input,
  organizationId,
  supabase,
}: ListRoomRowsOptions) {
  const from = (input.page - 1) * input.limit;
  const to = from + input.limit - 1;
  let query = supabase
    .from("rooms")
    .select("*", { count: "exact" })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("room_code", { ascending: true })
    .range(from, to);

  if (input.hostelBranchId) {
    query = query.eq("hostel_branch_id", input.hostelBranchId);
  }

  if (input.status) {
    query = query.eq("status", input.status);
  }

  if (input.roomType) {
    query = query.eq("room_type", input.roomType);
  }

  if (input.q) {
    const filter = buildOrIlikeFilter(["room_code", "name", "floor"], input.q);

    if (filter) {
      query = query.or(filter);
    }
  }

  return query;
}

export async function getRoomById(
  supabase: SupabaseServerClient,
  roomId: string,
) {
  return supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function listRoomCategories(
  supabase: SupabaseServerClient,
  organizationId: string,
  hostelBranchId?: string,
) {
  let query = supabase
    .from("room_categories")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (hostelBranchId) {
    query = query.eq("hostel_branch_id", hostelBranchId);
  }

  return query;
}

export async function listHostelFloors(
  supabase: SupabaseServerClient,
  organizationId: string,
  hostelBranchId?: string,
) {
  let query = supabase
    .from("hostel_floors")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("floor_code", { ascending: true });

  if (hostelBranchId) {
    query = query.eq("hostel_branch_id", hostelBranchId);
  }

  return query;
}

export async function listRoomTemplates(
  supabase: SupabaseServerClient,
  organizationId: string,
  hostelBranchId?: string,
) {
  let query = supabase
    .from("room_templates")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (hostelBranchId) {
    query = query.eq("hostel_branch_id", hostelBranchId);
  }

  return query;
}

export async function listHostelBranches(
  supabase: SupabaseServerClient,
  organizationId: string,
) {
  return supabase
    .from("hostel_branches")
    .select("id,name,slug")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });
}

export async function listBedsForRoomIds(
  supabase: SupabaseServerClient,
  roomIds: string[],
) {
  if (roomIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("room_beds")
    .select("*")
    .in("room_id", roomIds)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("bed_code", { ascending: true });
}

export async function listActiveAssignmentsForRoomIds(
  supabase: SupabaseServerClient,
  roomIds: string[],
) {
  if (roomIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("student_room_assignments")
    .select("*")
    .in("room_id", roomIds)
    .eq("status", "active")
    .is("end_date", null)
    .is("deleted_at", null);
}

export async function listStudentsByIds(
  supabase: SupabaseServerClient,
  studentIds: string[],
) {
  if (studentIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("students")
    .select("id,student_code,first_name,last_name,status,hostel_branch_id,organization_id")
    .in("id", studentIds)
    .is("deleted_at", null);
}

export async function listAvailableBedsForBranch(
  supabase: SupabaseServerClient,
  organizationId: string,
  hostelBranchId: string,
) {
  return supabase
    .from("room_beds")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("hostel_branch_id", hostelBranchId)
    .eq("status", "available")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("bed_code", { ascending: true });
}

export async function listRoomsForBranch(
  supabase: SupabaseServerClient,
  organizationId: string,
  hostelBranchId: string,
) {
  return supabase
    .from("rooms")
    .select("id,room_code,name,hostel_branch_id,organization_id,status")
    .eq("organization_id", organizationId)
    .eq("hostel_branch_id", hostelBranchId)
    .is("deleted_at", null)
    .order("room_code", { ascending: true });
}
