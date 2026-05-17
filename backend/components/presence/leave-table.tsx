import {
  recordLeaveRequestEventAction,
  reviewLeaveRequestAction,
} from "@/modules/presence/actions";
import type { LeaveListItem } from "@/modules/presence/presence.service";

type LeaveTableProps = {
  canManage: boolean;
  leaveRequests: LeaveListItem[];
};

const statusClasses: Record<string, string> = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-600",
  checked_out: "border-sky-200 bg-sky-50 text-sky-700",
  overdue: "border-rose-200 bg-rose-50 text-rose-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  returned: "border-slate-200 bg-slate-50 text-slate-600",
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

export function LeaveTable({ canManage, leaveRequests }: LeaveTableProps) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Window</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Reason</th>
            {canManage ? <th className="px-4 py-3 font-medium">Review</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {leaveRequests.length === 0 ? (
            <tr>
              <td
                className="px-4 py-6 text-center text-slate-500"
                colSpan={canManage ? 6 : 5}
              >
                No leave requests found.
              </td>
            </tr>
          ) : (
            leaveRequests.map((leaveRequest) => (
              <tr key={leaveRequest.id} className="align-top">
                <td className="px-4 py-3 font-medium">
                  {studentLabel(leaveRequest)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {leaveRequest.leave_type.replaceAll("_", " ")}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <p>{formatDateTime(leaveRequest.starts_at)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Return {formatDateTime(leaveRequest.expected_return_at)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded border px-2 py-1 text-xs font-medium ${
                      statusClasses[leaveRequest.status] ?? statusClasses.pending
                    }`}
                  >
                    {leaveRequest.status.replaceAll("_", " ")}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-3 text-slate-600">
                  <p className="line-clamp-2">{leaveRequest.reason}</p>
                  {leaveRequest.destination_address ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {leaveRequest.destination_address}
                    </p>
                  ) : null}
                </td>
                {canManage ? (
                  <td className="px-4 py-3">
                    {leaveRequest.status === "pending" ? (
                      <form action={reviewLeaveRequestAction} className="space-y-2">
                        <input
                          name="leaveRequestId"
                          type="hidden"
                          value={leaveRequest.id}
                        />
                        <input
                          className="w-52 rounded border border-slate-300 px-2 py-1 text-xs"
                          name="notes"
                          placeholder="Notes"
                        />
                        <div className="flex gap-2">
                          <button
                            className="rounded bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white"
                            name="decision"
                            type="submit"
                            value="approved"
                          >
                            Approve
                          </button>
                          <button
                            className="rounded border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700"
                            name="decision"
                            type="submit"
                            value="rejected"
                          >
                            Reject
                          </button>
                        </div>
                      </form>
                    ) : ["approved", "checked_out", "overdue"].includes(
                        leaveRequest.status,
                      ) ? (
                      <form
                        action={recordLeaveRequestEventAction}
                        className="space-y-2"
                      >
                        <input
                          name="leaveRequestId"
                          type="hidden"
                          value={leaveRequest.id}
                        />
                        <input
                          className="w-52 rounded border border-slate-300 px-2 py-1 text-xs"
                          name="notes"
                          placeholder="Notes"
                        />
                        <div className="flex flex-wrap gap-2">
                          {leaveRequest.status === "approved" ? (
                            <button
                              className="rounded border border-sky-300 px-3 py-1.5 text-xs font-medium text-sky-700"
                              name="eventType"
                              type="submit"
                              value="checked_out"
                            >
                              Check out
                            </button>
                          ) : null}
                          {["approved", "checked_out", "overdue"].includes(
                            leaveRequest.status,
                          ) ? (
                            <button
                              className="rounded bg-slate-950 px-3 py-1.5 text-xs font-medium text-white"
                              name="eventType"
                              type="submit"
                              value="returned"
                            >
                              Return
                            </button>
                          ) : null}
                          {["approved", "checked_out"].includes(
                            leaveRequest.status,
                          ) ? (
                            <button
                              className="rounded border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700"
                              name="eventType"
                              type="submit"
                              value="overdue"
                            >
                              Overdue
                            </button>
                          ) : null}
                          {leaveRequest.status === "approved" ? (
                            <button
                              className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
                              name="eventType"
                              type="submit"
                              value="cancelled"
                            >
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-500">Reviewed</span>
                    )}
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
