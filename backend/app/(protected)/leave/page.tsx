import type { Route } from "next";
import Link from "next/link";
import { AlertTriangle, ClipboardList, Clock, ListChecks, UserCheck } from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { LeaveRequestForm } from "@/components/presence/leave-request-form";
import { LeaveTable } from "@/components/presence/leave-table";
import { ActionToolbar } from "@/components/ui/action-toolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import {
  getPresenceFormOptions,
  listLeaveRequests,
} from "@/modules/presence/presence.service";
import { listLeaveRequestsQuerySchema } from "@/modules/presence/schemas";

type LeavePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const selectClassName =
  "erp-control";

function leaveHref(
  query: {
    hostelBranchId?: string | undefined;
    limit: number;
    q?: string | undefined;
    status?: string | undefined;
    studentId?: string | undefined;
  },
  overrides: {
    page?: number;
    status?: string | null;
  } = {},
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(overrides.page ?? 1),
  });

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  if (query.q) {
    params.set("q", query.q);
  }

  const status = overrides.status === undefined ? query.status : overrides.status;

  if (status) {
    params.set("status", status);
  }

  if (query.studentId) {
    params.set("studentId", query.studentId);
  }

  return `/leave?${params.toString()}` as Route;
}

export default async function LeavePage({ searchParams }: LeavePageProps) {
  const context = await requireTenantPageAccess({
    permission: "leave:read",
    product: "hostel_erp",
  });
  const query = validateInput(listLeaveRequestsQuerySchema, await searchParams);
  const [leaveRequests, options] = await Promise.all([
    listLeaveRequests(query),
    getPresenceFormOptions(query.hostelBranchId),
  ]);
  const canManage = context.role === "admin" || context.role === "superadmin";
  const branchById = new Map(options.branches.map((branch) => [branch.id, branch.name]));
  const selectedBranchName = query.hostelBranchId
    ? branchById.get(query.hostelBranchId)
    : undefined;
  const activeFilters = [
    query.q ? `Search: ${query.q}` : undefined,
    selectedBranchName ? `Branch: ${selectedBranchName}` : undefined,
    query.status ? `Status: ${query.status.replaceAll("_", " ")}` : undefined,
  ].filter((value): value is string => Boolean(value));
  const quickFilters = [
    { label: "All", status: null },
    { label: "Pending", status: "pending" },
    { label: "Approved", status: "approved" },
    { label: "Checked out", status: "checked_out" },
    { label: "Overdue", status: "overdue" },
  ];

  return (
    <ErpPage>
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/attendance">Attendance</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/gate-passes">Gate passes</Link>
            </Button>
          </>
        }
        description="Approve requests, track active leave windows, and record student returns without leaving the workflow."
        eyebrow="Hostel ERP"
        title="Leave management"
      />

      <ErpPageGrid>
        <StatCard
          description="Matching the current filters"
          icon={ClipboardList}
          label="Total requests"
          value={String(leaveRequests.summary.total)}
        />
        <StatCard
          description="Needs admin decision"
          icon={Clock}
          label="Pending approval"
          tone={leaveRequests.summary.pending > 0 ? "warning" : "default"}
          value={String(leaveRequests.summary.pending)}
        />
        <StatCard
          description="Approved or outside hostel"
          icon={UserCheck}
          label="Active leaves"
          tone="info"
          value={String(leaveRequests.summary.active)}
        />
        <StatCard
          description="Return follow-up required"
          icon={AlertTriangle}
          label="Overdue returns"
          tone={leaveRequests.summary.overdue > 0 ? "danger" : "default"}
          value={String(leaveRequests.summary.overdue)}
        />
      </ErpPageGrid>

      <ActionToolbar
        description="Use these queues for approval checks, outgoing verification, and return follow-up."
        title="Leave work queue"
      >
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <Button
              asChild
              key={filter.label}
              size="sm"
              variant={(query.status ?? null) === filter.status ? "default" : "outline"}
            >
              <Link href={leaveHref(query, { status: filter.status })}>
                {filter.label}
              </Link>
            </Button>
          ))}
        </div>
      </ActionToolbar>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <SectionCard
            contentClassName="space-y-4"
            description="Search leave reasons, destinations, branch scope, or approval state."
            title="Leave filters"
          >
            <form action="/leave">
              <SearchFilterBar
                actions={
                  <>
                    <Button type="submit" variant="outline">
                      Apply filters
                    </Button>
                    <Button asChild variant="ghost">
                      <Link href="/leave">Reset</Link>
                    </Button>
                  </>
                }
                defaultValue={query.q ?? ""}
                placeholder="Search reason or destination"
                surface="embedded"
              >
                <select
                  aria-label="Filter leave by status"
                  className={selectClassName}
                  defaultValue={query.status ?? ""}
                  name="status"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="checked_out">Checked out</option>
                  <option value="returned">Returned</option>
                  <option value="overdue">Overdue</option>
                </select>
                <select
                  aria-label="Filter leave by branch"
                  className={selectClassName}
                  defaultValue={query.hostelBranchId ?? ""}
                  name="hostelBranchId"
                >
                  <option value="">All branches</option>
                  {options.branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
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
            {activeFilters.length > 0 ? (
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
            ) : null}
          </SectionCard>

          <SectionCard
            actions={
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium">
                <ListChecks className="size-3.5" aria-hidden="true" />
                {leaveRequests.summary.pending} pending
              </span>
            }
            contentClassName="space-y-4"
            description="Approve, reject, check out, or close returns from the same operational queue."
            title="Leave approval queue"
          >
            <LeaveTable
              branchNames={Object.fromEntries(branchById)}
              canManage={canManage}
              leaveRequests={leaveRequests.data}
            />
          </SectionCard>
          <PaginationControls
            count={leaveRequests.count}
            hrefForPage={(page) => leaveHref(query, { page })}
            itemLabel="leave requests"
            page={leaveRequests.page}
            pageCount={leaveRequests.pageCount}
          />
        </div>
        <LeaveRequestForm
          branches={options.branches}
          organizationId={options.organizationId}
          students={options.students}
        />
      </div>
    </ErpPage>
  );
}
