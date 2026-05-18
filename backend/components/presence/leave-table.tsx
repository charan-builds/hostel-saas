import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/state";
import { StatusChip } from "@/components/ui/status-chip";
import {
  recordLeaveRequestEventAction,
  reviewLeaveRequestAction,
} from "@/modules/presence/actions";
import type { LeaveListItem } from "@/modules/presence/presence.service";

type LeaveTableProps = {
  canManage: boolean;
  leaveRequests: LeaveListItem[];
};

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

function ReviewActions({ leaveRequest }: { leaveRequest: LeaveListItem }) {
  if (leaveRequest.status === "pending") {
    return (
      <form action={reviewLeaveRequestAction} className="space-y-2">
        <input name="leaveRequestId" type="hidden" value={leaveRequest.id} />
        <Input
          className="h-8 w-full text-xs lg:w-52"
          name="notes"
          placeholder="Review notes"
        />
        <div className="flex flex-wrap gap-2">
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
        className="h-8 w-full text-xs lg:w-52"
        name="notes"
        placeholder="Event notes"
      />
      <div className="flex flex-wrap gap-2">
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

export function LeaveTable({ canManage, leaveRequests }: LeaveTableProps) {
  if (leaveRequests.length === 0) {
    return (
      <EmptyState
        description="Try a different branch, status, or search term."
        title="No leave requests found"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="hidden bg-muted/70 text-muted-foreground md:table-header-group">
          <tr>
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Window</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Reason</th>
            {canManage ? <th className="px-4 py-3 font-medium">Review</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border md:divide-y">
          {leaveRequests.map((leaveRequest) => (
            <tr
              key={leaveRequest.id}
              className="grid gap-3 p-4 align-top md:table-row md:p-0"
            >
              <td className="px-0 py-0 font-medium md:px-4 md:py-3">
                {studentLabel(leaveRequest)}
                <p className="mt-1 text-xs font-normal text-muted-foreground md:hidden">
                  {leaveRequest.leave_type.replaceAll("_", " ")}
                </p>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {leaveRequest.leave_type.replaceAll("_", " ")}
              </td>
              <td className="px-0 py-0 text-sm text-muted-foreground md:px-4 md:py-3">
                <p>{formatDateTime(leaveRequest.starts_at)}</p>
                <p className="mt-1 text-xs">
                  Return {formatDateTime(leaveRequest.expected_return_at)}
                </p>
              </td>
              <td className="px-0 py-0 md:px-4 md:py-3">
                <StatusChip status={leaveRequest.status} />
              </td>
              <td className="max-w-xs px-0 py-0 text-sm text-muted-foreground md:px-4 md:py-3">
                <p className="line-clamp-2">{leaveRequest.reason}</p>
                {leaveRequest.destination_address ? (
                  <p className="mt-1 text-xs">
                    {leaveRequest.destination_address}
                  </p>
                ) : null}
              </td>
              {canManage ? (
                <td className="px-0 py-0 md:px-4 md:py-3">
                  <ReviewActions leaveRequest={leaveRequest} />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
