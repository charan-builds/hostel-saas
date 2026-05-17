import { recordGatePassEventAction } from "@/modules/presence/actions";
import type { GatePassListItem } from "@/modules/presence/presence.service";

type GatePassTableProps = {
  canManage: boolean;
  gatePasses: GatePassListItem[];
};

const statusClasses: Record<string, string> = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-600",
  checked_in: "border-slate-200 bg-slate-50 text-slate-600",
  checked_out: "border-sky-200 bg-sky-50 text-sky-700",
  expired: "border-rose-200 bg-rose-50 text-rose-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  requested: "border-amber-200 bg-amber-50 text-amber-700",
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

function studentLabel(gatePass: GatePassListItem) {
  if (!gatePass.student) {
    return gatePass.student_id.slice(0, 8);
  }

  return `${gatePass.student.student_code} - ${gatePass.student.first_name} ${gatePass.student.last_name}`;
}

export function GatePassTable({ canManage, gatePasses }: GatePassTableProps) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Purpose</th>
            <th className="px-4 py-3 font-medium">Window</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Events</th>
            {canManage ? <th className="px-4 py-3 font-medium">Update</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {gatePasses.length === 0 ? (
            <tr>
              <td
                className="px-4 py-6 text-center text-slate-500"
                colSpan={canManage ? 6 : 5}
              >
                No gate passes found.
              </td>
            </tr>
          ) : (
            gatePasses.map((gatePass) => (
              <tr key={gatePass.id} className="align-top">
                <td className="px-4 py-3 font-medium">{studentLabel(gatePass)}</td>
                <td className="max-w-xs px-4 py-3 text-slate-600">
                  <p className="line-clamp-2">{gatePass.purpose}</p>
                  {gatePass.destination ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {gatePass.destination}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <p>{formatDateTime(gatePass.expected_exit_at)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Return {formatDateTime(gatePass.expected_return_at)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded border px-2 py-1 text-xs font-medium ${
                      statusClasses[gatePass.status] ?? statusClasses.requested
                    }`}
                  >
                    {gatePass.status.replaceAll("_", " ")}
                  </span>
                  {gatePass.late_entry ? (
                    <p className="mt-2 text-xs font-medium text-rose-700">
                      {gatePass.late_minutes} minutes late
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <p>{gatePass.events.length} event(s)</p>
                  {gatePass.events[0] ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Latest {gatePass.events[0].event_type.replaceAll("_", " ")}
                    </p>
                  ) : null}
                </td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <form action={recordGatePassEventAction} className="space-y-2">
                      <input name="gatePassId" type="hidden" value={gatePass.id} />
                      <input
                        className="w-52 rounded border border-slate-300 px-2 py-1 text-xs"
                        name="notes"
                        placeholder="Notes"
                      />
                      <div className="flex flex-wrap gap-2">
                        {gatePass.status === "requested" ? (
                          <>
                            <button
                              className="rounded bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white"
                              name="eventType"
                              type="submit"
                              value="approved"
                            >
                              Approve
                            </button>
                            <button
                              className="rounded border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700"
                              name="eventType"
                              type="submit"
                              value="rejected"
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                        {gatePass.status === "requested" ||
                        gatePass.status === "approved" ? (
                          <button
                            className="rounded border border-sky-300 px-3 py-1.5 text-xs font-medium text-sky-700"
                            name="eventType"
                            type="submit"
                            value="checked_out"
                          >
                            Check out
                          </button>
                        ) : null}
                        {gatePass.status === "checked_out" ? (
                          <button
                            className="rounded bg-slate-950 px-3 py-1.5 text-xs font-medium text-white"
                            name="eventType"
                            type="submit"
                            value="checked_in"
                          >
                            Check in
                          </button>
                        ) : null}
                        {!["checked_in", "rejected", "cancelled", "expired"].includes(
                          gatePass.status,
                        ) ? (
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
