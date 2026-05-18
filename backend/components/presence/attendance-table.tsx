import { EmptyState } from "@/components/ui/state";
import { StatusChip } from "@/components/ui/status-chip";
import type { AttendanceListItem } from "@/modules/presence/presence.service";

type AttendanceTableProps = {
  attendanceRecords: AttendanceListItem[];
};

function studentLabel(record: AttendanceListItem) {
  if (!record.student) {
    return record.student_id.slice(0, 8);
  }

  return `${record.student.student_code} - ${record.student.first_name} ${record.student.last_name}`;
}

export function AttendanceTable({ attendanceRecords }: AttendanceTableProps) {
  if (attendanceRecords.length === 0) {
    return (
      <EmptyState
        description="Try changing the date, branch, or status filters."
        title="No attendance records found"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="bg-muted/70 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">Student</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">Source</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">Room/bed</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendanceRecords.map((record) => (
                <tr className="hover:bg-muted/50" key={record.id}>
                  <td className="px-4 py-3 font-medium">{record.attendance_date}</td>
                  <td className="px-4 py-3">{studentLabel(record)}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={record.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{record.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {record.room_id ? record.room_id.slice(0, 8) : "Unassigned"}
                    {record.bed_id ? ` / ${record.bed_id.slice(0, 8)}` : ""}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-2">{record.notes ?? "None"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid gap-3 md:hidden">
        {attendanceRecords.map((record) => (
          <article className="rounded-lg border border-border bg-card p-4 shadow-sm" key={record.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{studentLabel(record)}</p>
                <p className="text-sm text-muted-foreground">{record.attendance_date}</p>
              </div>
              <StatusChip status={record.status} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {record.notes ?? "No notes"}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
