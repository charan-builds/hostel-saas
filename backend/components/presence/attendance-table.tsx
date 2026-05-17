import type { AttendanceListItem } from "@/modules/presence/presence.service";

type AttendanceTableProps = {
  attendanceRecords: AttendanceListItem[];
};

const statusClasses: Record<string, string> = {
  absent: "border-rose-200 bg-rose-50 text-rose-700",
  excused: "border-slate-200 bg-slate-50 text-slate-600",
  late: "border-amber-200 bg-amber-50 text-amber-700",
  on_leave: "border-sky-200 bg-sky-50 text-sky-700",
  present: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function studentLabel(record: AttendanceListItem) {
  if (!record.student) {
    return record.student_id.slice(0, 8);
  }

  return `${record.student.student_code} - ${record.student.first_name} ${record.student.last_name}`;
}

export function AttendanceTable({ attendanceRecords }: AttendanceTableProps) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Room/bed</th>
            <th className="px-4 py-3 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {attendanceRecords.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                No attendance records found.
              </td>
            </tr>
          ) : (
            attendanceRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3 font-medium">
                  {record.attendance_date}
                </td>
                <td className="px-4 py-3">{studentLabel(record)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded border px-2 py-1 text-xs font-medium ${
                      statusClasses[record.status] ?? statusClasses.present
                    }`}
                  >
                    {record.status.replaceAll("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{record.source}</td>
                <td className="px-4 py-3 text-slate-600">
                  {record.room_id ? record.room_id.slice(0, 8) : "Unassigned"}
                  {record.bed_id ? ` / ${record.bed_id.slice(0, 8)}` : ""}
                </td>
                <td className="max-w-xs px-4 py-3 text-slate-600">
                  <span className="line-clamp-2">{record.notes ?? "None"}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
