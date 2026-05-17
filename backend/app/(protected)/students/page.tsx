import Link from "next/link";
import type { Route } from "next";

import { StudentTable } from "@/components/students/student-table";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import { listStudentsQuerySchema } from "@/modules/students/schemas";
import { listStudents } from "@/modules/students/students.service";

type StudentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function studentsPageHref(
  query: {
    hostelBranchId?: string | undefined;
    limit: number;
    q?: string | undefined;
    status?: string | undefined;
  },
  page: number,
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(page),
  });

  if (query.q) {
    params.set("q", query.q);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  return `/students?${params.toString()}` as Route;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  await requireTenantPageAccess({
    permission: "student:read",
    product: "hostel_erp",
  });
  const query = validateInput(listStudentsQuerySchema, await searchParams);
  const students = await listStudents(query);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h2 className="text-2xl font-semibold">Students</h2>
        </div>
        <Link
          className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          href="/students/new"
        >
          Create student
        </Link>
      </div>
      <form className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[1fr_160px_120px]">
        <input
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.q ?? ""}
          name="q"
          placeholder="Search by code, name, email"
        />
        <select
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.status ?? ""}
          name="status"
        >
          <option value="">All statuses</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
        <button className="rounded border border-slate-300 px-3 py-2 font-medium" type="submit">
          Filter
        </button>
      </form>
      <StudentTable students={students.data} />
      <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
        <p>
          Page {students.page} of {students.pageCount}, {students.count} total
        </p>
        <nav className="flex items-center gap-2" aria-label="Student pagination">
          {students.page > 1 ? (
            <Link
              className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
              href={studentsPageHref(query, students.page - 1)}
            >
              Previous
            </Link>
          ) : (
            <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
              Previous
            </span>
          )}
          {students.page < students.pageCount ? (
            <Link
              className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
              href={studentsPageHref(query, students.page + 1)}
            >
              Next
            </Link>
          ) : (
            <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
              Next
            </span>
          )}
        </nav>
      </div>
    </section>
  );
}
