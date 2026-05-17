import "server-only";

import { buildOrIlikeFilter } from "@/lib/db/postgrest-filters";
import type { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ListNoticesQuery,
  ListNotificationsQuery,
} from "@/modules/notifications/schemas";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type ListRecipientRowsOptions = {
  input: ListNotificationsQuery;
  notificationIds: string[] | undefined;
  supabase: SupabaseServerClient;
  userId: string;
};

type ListNoticeRowsOptions = {
  input: ListNoticesQuery;
  organizationId: string;
  supabase: SupabaseServerClient;
};

export async function findNotificationIdsForSearch(
  supabase: SupabaseServerClient,
  organizationId: string,
  q: string | undefined,
) {
  if (!q) {
    return null;
  }

  const filter = buildOrIlikeFilter(["title", "body"], q);

  if (!filter) {
    return { data: [], error: null };
  }

  return supabase
    .from("notifications")
    .select("id")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .or(filter);
}

export async function listRecipientRows({
  input,
  notificationIds,
  supabase,
  userId,
}: ListRecipientRowsOptions) {
  const from = (input.page - 1) * input.limit;
  const to = from + input.limit - 1;
  let query = supabase
    .from("notification_recipients")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .is("deleted_at", null)
    .is("dismissed_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (input.readState === "read") {
    query = query.not("read_at", "is", null);
  }

  if (input.readState === "unread") {
    query = query.is("read_at", null);
  }

  if (notificationIds) {
    if (notificationIds.length === 0) {
      return { count: 0, data: [], error: null };
    }

    query = query.in("notification_id", notificationIds);
  }

  return query;
}

export async function listNotificationsByIds(
  supabase: SupabaseServerClient,
  notificationIds: string[],
) {
  if (notificationIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("notifications")
    .select("*")
    .in("id", notificationIds)
    .is("deleted_at", null);
}

export async function listNoticeRows({
  input,
  organizationId,
  supabase,
}: ListNoticeRowsOptions) {
  const from = (input.page - 1) * input.limit;
  const to = from + input.limit - 1;
  let query = supabase
    .from("notice_boards")
    .select("*", { count: "exact" })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (input.hostelBranchId) {
    query = query.eq("hostel_branch_id", input.hostelBranchId);
  }

  if (input.status) {
    query = query.eq("status", input.status);
  }

  if (input.audienceType) {
    query = query.eq("audience_type", input.audienceType);
  }

  if (input.q) {
    const filter = buildOrIlikeFilter(["title", "body"], input.q);

    if (filter) {
      query = query.or(filter);
    }
  }

  return query;
}

export async function getNoticeById(
  supabase: SupabaseServerClient,
  noticeId: string,
) {
  return supabase
    .from("notice_boards")
    .select("*")
    .eq("id", noticeId)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function listNoticeAcknowledgementsForIds(
  supabase: SupabaseServerClient,
  noticeIds: string[],
  userId: string,
) {
  if (noticeIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("notice_acknowledgements")
    .select("*")
    .in("notice_id", noticeIds)
    .eq("user_id", userId)
    .is("deleted_at", null);
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

export async function getNotificationPreference(
  supabase: SupabaseServerClient,
  organizationId: string,
  userId: string,
  hostelBranchId?: string,
) {
  let query = supabase
    .from("notification_preferences")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("app", "hostel_erp")
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (hostelBranchId) {
    query = query.eq("hostel_branch_id", hostelBranchId);
  } else {
    query = query.is("hostel_branch_id", null);
  }

  return query.maybeSingle();
}

export async function listAdminMembershipRecipients(
  supabase: SupabaseServerClient,
  organizationId: string,
  hostelBranchId?: string,
) {
  let query = supabase
    .from("tenant_memberships")
    .select("user_id,role,hostel_branch_id,organization_id")
    .eq("organization_id", organizationId)
    .eq("app", "hostel_erp")
    .eq("role", "admin")
    .eq("status", "active")
    .is("deleted_at", null);

  if (hostelBranchId) {
    query = query.or(`hostel_branch_id.is.null,hostel_branch_id.eq.${hostelBranchId}`);
  }

  return query;
}

export async function listStudentUserRecipients(
  supabase: SupabaseServerClient,
  organizationId: string,
  hostelBranchId?: string,
) {
  let query = supabase
    .from("students")
    .select("id,user_profile_id,hostel_branch_id,organization_id,student_code,first_name,last_name")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .not("user_profile_id", "is", null)
    .is("deleted_at", null);

  if (hostelBranchId) {
    query = query.eq("hostel_branch_id", hostelBranchId);
  }

  return query;
}
