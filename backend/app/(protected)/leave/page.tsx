import type { Route } from "next";
import Link from "next/link";
import { AlertTriangle, ClipboardList, Clock, UserCheck } from "lucide-react";

import { LeaveRequestForm } from "@/components/presence/leave-request-form";
import { LeaveTable } from "@/components/presence/leave-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
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
  "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2";

function leavePageHref(
  query: {
    hostelBranchId?: string | undefined;
    limit: number;
    q?: string | undefined;
    status?: string | undefined;
    studentId?: string | undefined;
  },
  page: number,
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(page),
  });

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  if (query.q) {
    params.set("q", query.q);
  }

  if (query.status) {
    params.set("status", query.status);
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

  return (
    <section className="space-y-6">
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Total requests"
          value={String(leaveRequests.summary.total)}
        />
        <StatCard
          icon={Clock}
          label="Pending approval"
          tone={leaveRequests.summary.pending > 0 ? "warning" : "default"}
          value={String(leaveRequests.summary.pending)}
        />
        <StatCard
          icon={UserCheck}
          label="Active leaves"
          tone="info"
          value={String(leaveRequests.summary.active)}
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue returns"
          tone={leaveRequests.summary.overdue > 0 ? "danger" : "default"}
          value={String(leaveRequests.summary.overdue)}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <form action="/leave">
            <SearchFilterBar
              actions={
                <Button type="submit" variant="outline">
                  Apply filters
                </Button>
              }
              defaultValue={query.q ?? ""}
              placeholder="Search reason or destination"
            >
              <select
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
            </SearchFilterBar>
          </form>
          <LeaveTable
            canManage={canManage}
            leaveRequests={leaveRequests.data}
          />
          <PaginationControls
            count={leaveRequests.count}
            hrefForPage={(page) => leavePageHref(query, page)}
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
    </section>
  );
}
