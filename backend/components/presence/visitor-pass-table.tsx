import { recordVisitorPassEventAction } from "@/modules/presence/actions";
import type { VisitorPassRow } from "@/modules/presence/presence.service";

type VisitorPassTableProps = {
  canManage: boolean;
  visitorPasses: VisitorPassRow[];
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

export function VisitorPassTable({
  canManage,
  visitorPasses,
}: VisitorPassTableProps) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Visitor</th>
            <th className="px-4 py-3 font-medium">Scheduled</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Reason</th>
            {canManage ? <th className="px-4 py-3 font-medium">Update</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {visitorPasses.length === 0 ? (
            <tr>
              <td
                className="px-4 py-6 text-center text-slate-500"
                colSpan={canManage ? 5 : 4}
              >
                No visitor passes found.
              </td>
            </tr>
          ) : (
            visitorPasses.map((visitorPass) => (
              <tr key={visitorPass.id} className="align-top">
                <td className="px-4 py-3 font-medium">
                  {visitorPass.visitor_name}
                  {visitorPass.visitor_phone ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {visitorPass.visitor_phone}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDateTime(visitorPass.scheduled_at)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                    {visitorPass.status.replaceAll("_", " ")}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-3 text-slate-600">
                  <span className="line-clamp-2">{visitorPass.visit_reason}</span>
                </td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <form
                      action={recordVisitorPassEventAction}
                      className="space-y-2"
                    >
                      <input
                        name="visitorPassId"
                        type="hidden"
                        value={visitorPass.id}
                      />
                      <input
                        className="w-52 rounded border border-slate-300 px-2 py-1 text-xs"
                        name="notes"
                        placeholder="Notes"
                      />
                      <div className="flex flex-wrap gap-2">
                        {visitorPass.status === "requested" ? (
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
                        {visitorPass.status === "approved" ? (
                          <button
                            className="rounded border border-sky-300 px-3 py-1.5 text-xs font-medium text-sky-700"
                            name="eventType"
                            type="submit"
                            value="checked_in"
                          >
                            Check in
                          </button>
                        ) : null}
                        {visitorPass.status === "checked_in" ? (
                          <button
                            className="rounded bg-slate-950 px-3 py-1.5 text-xs font-medium text-white"
                            name="eventType"
                            type="submit"
                            value="checked_out"
                          >
                            Check out
                          </button>
                        ) : null}
                        {["requested", "approved"].includes(visitorPass.status) ? (
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
