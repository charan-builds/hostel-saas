import Link from "next/link";

import type { Database } from "@/types/database.types";

type StudentRow = Database["public"]["Tables"]["students"]["Row"];

type StudentTableProps = {
  students: StudentRow[];
};

export function StudentTable({ students }: StudentTableProps) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Admission</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {students.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                No students found.
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id}>
                <td className="px-4 py-3 font-medium">{student.student_code}</td>
                <td className="px-4 py-3">
                  {student.first_name} {student.last_name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {student.email ?? student.phone ?? "Not provided"}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded border border-slate-200 px-2 py-1 text-xs font-medium">
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {student.admission_date}
                </td>
                <td className="px-4 py-3">
                  <Link
                    className="font-medium text-slate-950 underline"
                    href={`/students/${student.id}/edit`}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
