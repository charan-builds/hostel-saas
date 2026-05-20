import type { Route } from "next";
import Link from "next/link";
import { Megaphone, Pin, Send, Timer } from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { NoticeList } from "@/components/notifications/notice-list";
import { ActionToolbar } from "@/components/ui/action-toolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateInput } from "@/lib/validation/zod";
import { listNotices } from "@/modules/notifications/notifications.service";
import { listNoticesQuerySchema } from "@/modules/notifications/schemas";

type NoticesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const selectClassName =
  "erp-control";

type BranchOption = {
  id: string;
  name: string;
};

type NoticeStatus = "draft" | "scheduled" | "published" | "archived";

function noticesHref(
  query: {
    audienceType?: string | undefined;
    hostelBranchId?: string | undefined;
    limit: number;
    q?: string | undefined;
    status: NoticeStatus;
  },
  overrides: {
    page?: number;
    status?: NoticeStatus;
  } = {},
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(overrides.page ?? 1),
    status: overrides.status ?? query.status,
  });

  if (query.audienceType) {
    params.set("audienceType", query.audienceType);
  }

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  if (query.q) {
    params.set("q", query.q);
  }

  return `/notices?${params.toString()}` as Route;
}

async function listNoticeBranches(organizationId: string | undefined) {
  if (!organizationId) {
    return [] satisfies BranchOption[];
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("hostel_branches")
    .select("id,name")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return data ?? [];
}

export default async function NoticesPage({ searchParams }: NoticesPageProps) {
  const context = await requireTenantPageAccess({
    permission: "notice:read",
    product: "hostel_erp",
  });
  const query = validateInput(listNoticesQuerySchema, await searchParams);
  const [notices, branches] = await Promise.all([
    listNotices(query),
    listNoticeBranches(context.organizationId),
  ]);
  const branchById = new Map(branches.map((branch) => [branch.id, branch.name]));
  const selectedBranchName = query.hostelBranchId
    ? branchById.get(query.hostelBranchId)
    : undefined;
  const canManage = context.role === "admin" || context.role === "superadmin";
  const urgentCount = notices.data.filter((notice) => notice.priority === "urgent").length;
  const pinnedCount = notices.data.filter((notice) => notice.pinned).length;
  const scheduledCount = notices.data.filter(
    (notice) => notice.status === "scheduled",
  ).length;
  const unacknowledgedCount = notices.data.filter(
    (notice) => !notice.acknowledgement?.acknowledged_at,
  ).length;
  const quickFilters: { label: string; status: NoticeStatus }[] = [
    { label: "Published", status: "published" },
    { label: "Scheduled", status: "scheduled" },
    { label: "Drafts", status: "draft" },
    { label: "Archived", status: "archived" },
  ];
  const activeFilters = [
    query.q ? `Search: ${query.q}` : undefined,
    selectedBranchName ? `Branch: ${selectedBranchName}` : undefined,
    query.audienceType ? `Audience: ${query.audienceType}` : undefined,
    `Status: ${query.status}`,
  ].filter((value): value is string => Boolean(value));

  return (
    <ErpPage>
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/notifications">Notifications</Link>
            </Button>
            {canManage ? (
              <Button asChild>
                <Link href="/notices/manage">Manage notices</Link>
              </Button>
            ) : null}
          </>
        }
        description="Review tenant-wide and branch-level announcements with acknowledgement status visible."
        eyebrow="Hostel ERP"
        title="Notice board"
      />

      <ErpPageGrid>
        <StatCard
          description="Matching the current filters"
          icon={Megaphone}
          label="Visible notices"
          tone="info"
          value={String(notices.count)}
        />
        <StatCard
          description="Requires reader attention"
          icon={Send}
          label="Unread here"
          tone={unacknowledgedCount > 0 ? "warning" : "success"}
          value={String(unacknowledgedCount)}
        />
        <StatCard
          description="Pinned to the board"
          icon={Pin}
          label="Pinned"
          tone={pinnedCount > 0 ? "warning" : "default"}
          value={String(pinnedCount)}
        />
        <StatCard
          description="Visible in this page result"
          icon={Timer}
          label={query.status === "scheduled" ? "Scheduled" : "Urgent"}
          tone={urgentCount > 0 ? "danger" : "default"}
          value={String(query.status === "scheduled" ? scheduledCount : urgentCount)}
        />
      </ErpPageGrid>

      <ActionToolbar
        description="Switch between publication states without losing search, branch, or audience context."
        title="Notice board views"
      >
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <Button
              asChild
              key={filter.status}
              size="sm"
              variant={query.status === filter.status ? "default" : "outline"}
            >
              <Link href={noticesHref(query, { status: filter.status })}>
                {filter.label}
              </Link>
            </Button>
          ))}
        </div>
      </ActionToolbar>

      <SectionCard
        contentClassName="space-y-4"
        description="Search announcements and narrow by branch, audience, status, or page size."
        title="Notice filters"
      >
        <form action="/notices">
          <SearchFilterBar
            actions={
              <>
                <Button type="submit" variant="outline">
                  Apply filters
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/notices">Reset</Link>
                </Button>
              </>
            }
            defaultValue={query.q ?? ""}
            placeholder="Search notices"
            surface="embedded"
          >
            <select
              aria-label="Filter notices by audience"
              className={selectClassName}
              defaultValue={query.audienceType ?? ""}
              name="audienceType"
            >
              <option value="">All audiences</option>
              <option value="tenant">Tenant</option>
              <option value="branch">Branch</option>
              <option value="admins">Admins</option>
              <option value="students">Students</option>
            </select>
            <select
              aria-label="Filter notices by branch"
              className={selectClassName}
              defaultValue={query.hostelBranchId ?? ""}
              name="hostelBranchId"
            >
              <option value="">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter notices by status"
              className={selectClassName}
              defaultValue={query.status}
              name="status"
            >
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              aria-label="Rows per page"
              className={selectClassName}
              defaultValue={String(query.limit)}
              name="limit"
            >
              <option value="10">10 rows</option>
              <option value="20">20 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
            </select>
          </SearchFilterBar>
        </form>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters</span>
          {activeFilters.map((filter) => (
            <span
              className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium capitalize"
              key={filter}
            >
              {filter}
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        contentClassName="space-y-4"
        description="Read operational notices, confirm acknowledgement, and see audience, branch, priority, and schedule context."
        title="Notice board"
      >
        <NoticeList branchNames={Object.fromEntries(branchById)} notices={notices.data} />
      </SectionCard>
      <PaginationControls
        count={notices.count}
        hrefForPage={(page) => noticesHref(query, { page })}
        itemLabel="notices"
        page={notices.page}
        pageCount={notices.pageCount}
      />
    </ErpPage>
  );
}
