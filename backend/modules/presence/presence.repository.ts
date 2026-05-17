import "server-only";

import { buildOrIlikeFilter } from "@/lib/db/postgrest-filters";
import type { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ListAttendanceQuery,
  ListGatePassesQuery,
  ListLeaveRequestsQuery,
} from "@/modules/presence/schemas";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function listLeaveRows(options: {
  input: ListLeaveRequestsQuery;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  const from = (options.input.page - 1) * options.input.limit;
  const to = from + options.input.limit - 1;
  let query = options.supabase
    .from("student_leave_requests")
    .select("*", { count: "exact" })
    .eq("organization_id", options.organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.input.hostelBranchId) {
    query = query.eq("hostel_branch_id", options.input.hostelBranchId);
  }

  if (options.input.studentId) {
    query = query.eq("student_id", options.input.studentId);
  }

  if (options.input.status) {
    query = query.eq("status", options.input.status);
  }

  if (options.input.q) {
    const filter = buildOrIlikeFilter(
      ["reason", "destination_address"],
      options.input.q,
    );

    if (filter) {
      query = query.or(filter);
    }
  }

  return query;
}

export async function getLeaveById(
  supabase: SupabaseServerClient,
  leaveRequestId: string,
) {
  return supabase
    .from("student_leave_requests")
    .select("*")
    .eq("id", leaveRequestId)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function listAttendanceRows(options: {
  input: ListAttendanceQuery;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  const from = (options.input.page - 1) * options.input.limit;
  const to = from + options.input.limit - 1;
  let query = options.supabase
    .from("attendance_records")
    .select("*", { count: "exact" })
    .eq("organization_id", options.organizationId)
    .eq("attendance_date", options.input.attendanceDate)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.input.hostelBranchId) {
    query = query.eq("hostel_branch_id", options.input.hostelBranchId);
  }

  if (options.input.status) {
    query = query.eq("status", options.input.status);
  }

  return query;
}

export async function listGatePassRows(options: {
  input: ListGatePassesQuery;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  const from = (options.input.page - 1) * options.input.limit;
  const to = from + options.input.limit - 1;
  let query = options.supabase
    .from("gate_passes")
    .select("*", { count: "exact" })
    .eq("organization_id", options.organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.input.hostelBranchId) {
    query = query.eq("hostel_branch_id", options.input.hostelBranchId);
  }

  if (options.input.studentId) {
    query = query.eq("student_id", options.input.studentId);
  }

  if (options.input.status) {
    query = query.eq("status", options.input.status);
  }

  if (options.input.q) {
    const filter = buildOrIlikeFilter(
      ["purpose", "destination"],
      options.input.q,
    );

    if (filter) {
      query = query.or(filter);
    }
  }

  return query;
}

export async function getGatePassById(
  supabase: SupabaseServerClient,
  gatePassId: string,
) {
  return supabase
    .from("gate_passes")
    .select("*")
    .eq("id", gatePassId)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function listGatePassEvents(
  supabase: SupabaseServerClient,
  gatePassIds: string[],
) {
  if (gatePassIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("gate_pass_events")
    .select("*")
    .in("gate_pass_id", gatePassIds)
    .order("event_at", { ascending: false });
}

export async function listVisitorPassRows(options: {
  hostelBranchId?: string | undefined;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  let query = options.supabase
    .from("visitor_passes")
    .select("*")
    .eq("organization_id", options.organizationId)
    .is("deleted_at", null)
    .order("scheduled_at", { ascending: false })
    .limit(20);

  if (options.hostelBranchId) {
    query = query.eq("hostel_branch_id", options.hostelBranchId);
  }

  return query;
}

export async function getVisitorPassById(
  supabase: SupabaseServerClient,
  visitorPassId: string,
) {
  return supabase
    .from("visitor_passes")
    .select("*")
    .eq("id", visitorPassId)
    .is("deleted_at", null)
    .maybeSingle();
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
    .select("id,student_code,first_name,last_name,status,user_profile_id,hostel_branch_id,organization_id")
    .in("id", studentIds)
    .is("deleted_at", null);
}

export async function listPresenceFormOptions(
  supabase: SupabaseServerClient,
  organizationId: string,
  hostelBranchId?: string,
) {
  let studentsQuery = supabase
    .from("students")
    .select("id,student_code,first_name,last_name,status,user_profile_id,hostel_branch_id,organization_id")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("student_code", { ascending: true });

  if (hostelBranchId) {
    studentsQuery = studentsQuery.eq("hostel_branch_id", hostelBranchId);
  }

  const [branches, students] = await Promise.all([
    supabase
      .from("hostel_branches")
      .select("id,name,slug")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    studentsQuery,
  ]);

  return { branches, students };
}
