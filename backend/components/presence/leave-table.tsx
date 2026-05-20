import Link from "next/link";
import type { Route } from "next";
import { CalendarClock, MapPin, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/state";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  recordLeaveRequestEventAction,
  reviewLeaveRequestAction,
} from "@/modules/presence/actions";
import type { LeaveListItem } from "@/modules/presence/presence.service";

type LeaveTableProps = {
  branchNames?: Record<string, string>;
  canManage: boolean;
  leaveRequests: LeaveListItem[];
};

const compactInputClassName = "erp-control h-9 text-xs";

function studentRoute(studentId: string) {
  return `/students/${studentId}` as Route;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function studentLabel(leaveRequest: LeaveListItem) {
  if (!leaveRequest.student) {
    return leaveRequest.student_id.slice(0, 8);
  }

  return `${leaveRequest.student.student_code} - ${leaveRequest.student.first_name} ${leaveRequest.student.last_name}`;
}

function branchLabel(
  leaveRequest: LeaveListItem,
  branchNames: Record<string, string>,
) {
  return branchNames[leaveRequest.hostel_branch_id] ?? "Assigned branch";
}

function leaveTypeLabel(value: string) {
  return value.replaceAll("_", " ");
}

function ReviewActions({ leaveRequest }: { leaveRequest: LeaveListItem }) {
  if (leaveRequest.status === "pending") {
    return (
      <form action={reviewLeaveRequestAction} className="space-y-2">
        <input name="leaveRequestId" type="hidden" value={leaveRequest.id} />
        <Input
          className={compactInputClassName}
          name="notes"
          placeholder="Review notes"
        />
        <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap">
          <Button name="decision" size="sm" type="submit" value="approved">
            Approve
          </Button>
          <Button
            name="decision"
            size="sm"
            type="submit"
            value="rejected"
            variant="destructive"
          >
            Reject
          </Button>
        </div>
      </form>
    );
  }

  if (!["approved", "checked_out", "overdue"].includes(leaveRequest.status)) {
    return <span className="text-xs text-muted-foreground">Reviewed</span>;
  }

  return (
    <form action={recordLeaveRequestEventAction} className="space-y-2">
      <input name="leaveRequestId" type="hidden" value={leaveRequest.id} />
      <Input
        className={compactInputClassName}
        name="notes"
        placeholder="Event notes"
      />
      <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap">
        {leaveRequest.status === "approved" ? (
          <Button
            name="eventType"
            size="sm"
            type="submit"
            value="checked_out"
            variant="outline"
          >
            Check out
          </Button>
        ) : null}
        {["approved", "checked_out", "overdue"].includes(
          leaveRequest.status,
        ) ? (
          <Button name="eventType" size="sm" type="submit" value="returned">
            Return
          </Button>
        ) : null}
        {["approved", "checked_out"].includes(leaveRequest.status) ? (
          <Button
            name="eventType"
            size="sm"
            type="submit"
            value="overdue"
            variant="destructive"
          >
            Overdue
          </Button>
        ) : null}
        {leaveRequest.status === "approved" ? (
          <Button
            name="eventType"
            size="sm"
            type="submit"
            value="cancelled"
            variant="outline"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function LeaveMobileCard({
  branchNames,
  canManage,
  leaveRequest,
}: {
  branchNames: Record<string, string>;
  canManage: boolean;
  leaveRequest: LeaveListItem;
}) {
  return (
    <article className="space-y-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-[var(--erp-shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            className="inline-flex items-center gap-1.5 font-semibold hover:underline"
            href={studentRoute(leaveRequest.student_id)}
          >
            <UserRound className="size-4" aria-hidden="true" />
            {studentLabel(leaveRequest)}
          </Link>
          <p className="mt-1 text-xs capitalize text-muted-foreground">
            {leaveTypeLabel(leaveRequest.leave_type)} · {branchLabel(leaveRequest, branchNames)}
          </p>
        </div>
        <StatusBadge status={leaveRequest.status} />
      </div>
      <dl className="grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="inline-flex items-center gap-1 text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden="true" />
            Starts
          </dt>
          <dd className="text-right font-medium">
            {formatDateTime(leaveRequest.starts_at)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Expected return</dt>
          <dd className="text-right font-medium">
            {formatDateTime(leaveRequest.expected_return_at)}
          </dd>
        </div>
      </dl>
      <div className="rounded-md border border-border bg-muted/60 p-3 text-sm">
        <p className="line-clamp-2 text-foreground">{leaveRequest.reason}</p>
        {leaveRequest.destination_address ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden="true" />
            {leaveRequest.destination_address}
          </p>
        ) : null}
      </div>
      {canManage ? (
        <div className="border-t border-border pt-3">
          <ReviewActions leaveRequest={leaveRequest} />
        </div>
      ) : null}
    </article>
  );
}

export function LeaveTable({
  branchNames = {},
  canManage,
  leaveRequests,
}: LeaveTableProps) {
  if (leaveRequests.length === 0) {
    return (
      <EmptyState
        description="Try a different branch, status, or search term."
        title="No leave requests found"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {leaveRequests.map((leaveRequest) => (
          <LeaveMobileCard
            branchNames={branchNames}
            canManage={canManage}
            key={leaveRequest.id}
            leaveRequest={leaveRequest}
          />
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card text-card-foreground md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-muted/85 text-muted-foreground backdrop-blur">
          <tr>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Student / branch</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Type</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Window</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Status</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Reason</th>
                {canManage ? <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Review</th> : null}
          </tr>
        </thead>
            <tbody className="divide-y divide-border">
          {leaveRequests.map((leaveRequest) => (
            <tr
              key={leaveRequest.id}
                  className="align-top hover:bg-muted/50"
            >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      className="inline-flex items-center gap-1.5 hover:underline"
                      href={studentRoute(leaveRequest.student_id)}
                    >
                      <UserRound className="size-4" aria-hidden="true" />
                      {studentLabel(leaveRequest)}
                    </Link>
                    <p className="mt-1 text-xs font-normal text-muted-foreground">
                      {branchLabel(leaveRequest, branchNames)}
                    </p>
              </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {leaveTypeLabel(leaveRequest.leave_type)}
              </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{formatDateTime(leaveRequest.starts_at)}</p>
                <p className="mt-1 text-xs">
                  Return {formatDateTime(leaveRequest.expected_return_at)}
                </p>
              </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={leaveRequest.status} />
              </td>
                  <td className="max-w-xs px-4 py-3 text-sm text-muted-foreground">
                <p className="line-clamp-2">{leaveRequest.reason}</p>
                {leaveRequest.destination_address ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs">
                        <MapPin className="size-3.5" aria-hidden="true" />
                    {leaveRequest.destination_address}
                  </p>
                ) : null}
              </td>
              {canManage ? (
                    <td className="px-4 py-3">
                  <ReviewActions leaveRequest={leaveRequest} />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      </div>
    </div>
  );
}
