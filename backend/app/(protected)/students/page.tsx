import Link from "next/link";
import type { Route } from "next";
import { UserPlus, Users, UserX, MapPinned } from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { StudentTable } from "@/components/students/student-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateInput } from "@/lib/validation/zod";
import { listStudentsQuerySchema } from "@/modules/students/schemas";
import { listStudents } from "@/modules/students/students.service";

const selectClassName = "erp-control";

type StudentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type BranchOption = {
  id: string;
  name: string;
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

async function listStudentBranches(organizationId: string | undefined) {
  if (!organizationId) {
    return [] satisfies BranchOption[];
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("hostel_branches")
    .select("id,name")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return data ?? [];
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const context = await requireTenantPageAccess({
    permission: "student:read",
    product: "hostel_erp",
  });
  const query = validateInput(listStudentsQuerySchema, await searchParams);
  const [students, branches] = await Promise.all([
    listStudents(query),
    listStudentBranches(context.organizationId),
  ]);
  const branchById = new Map(branches.map((branch) => [branch.id, branch.name]));
  const activeCount = students.data.filter((student) => student.status === "active").length;
  const inactiveCount = students.data.filter(
    (student) => student.status === "inactive",
  ).length;
  const selectedBranchName = query.hostelBranchId
    ? branchById.get(query.hostelBranchId)
    : undefined;
  const activeFilters = [
    query.q ? `Search: ${query.q}` : undefined,
    selectedBranchName ? `Branch: ${selectedBranchName}` : undefined,
    query.status ? `Status: ${query.status}` : undefined,
  ].filter((value): value is string => Boolean(value));

  return (
    <ErpPage>
      <PageHeader
        actions={
          <Button asChild>
            <Link href="/students/new">
              <UserPlus aria-hidden="true" />
              Admit student
            </Link>
          </Button>
        }
        description="Search admissions, review active residents, and jump into room assignment, dues, attendance, and document workflows."
        eyebrow="Hostel ERP"
        title="Students"
      />

      <ErpPageGrid>
        <StatCard
          description="Matching the current filters"
          icon={Users}
          label="Student records"
          tone="info"
          value={String(students.count)}
        />
        <StatCard
          description="Visible on this page"
          icon={Users}
          label="Active"
          tone="success"
          value={String(activeCount)}
        />
        <StatCard
          description="Visible on this page"
          icon={UserX}
          label="Inactive"
          tone={inactiveCount > 0 ? "warning" : "default"}
          value={String(inactiveCount)}
        />
        <StatCard
          description="Current list scope"
          icon={MapPinned}
          label="Branch"
          value={selectedBranchName ?? "All branches"}
        />
      </ErpPageGrid>

      <SectionCard
        contentClassName="space-y-4"
        description="Search admissions and narrow the working list by branch or status."
        title="Student directory"
      >
        <form action="/students">
          <SearchFilterBar
            actions={
              <>
                <Button type="submit" variant="outline">
                  Apply filters
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/students">Reset</Link>
                </Button>
              </>
            }
            defaultValue={query.q ?? ""}
            placeholder="Search code, name, email"
            surface="embedded"
          >
            <select
              aria-label="Filter students by branch"
              className={selectClassName}
              defaultValue={query.hostelBranchId ?? ""}
              name="hostelBranchId"
            >
              <option value="">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter students by status"
              className={selectClassName}
              defaultValue={query.status ?? ""}
              name="status"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              aria-label="Rows per page"
              className={selectClassName}
              defaultValue={String(query.limit)}
              name="limit"
            >
              <option value="10">10 rows</option>
              <option value="20">20 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
            </select>
          </SearchFilterBar>
        </form>
        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active filters</span>
            {activeFilters.map((filter) => (
              <span
                className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium"
                key={filter}
              >
                {filter}
              </span>
            ))}
          </div>
        ) : null}
        <StudentTable
          branchNames={Object.fromEntries(branchById)}
          canManageStudents={context.role === "admin" || context.role === "superadmin"}
          students={students.data}
        />
      </SectionCard>
      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page {students.page} of {students.pageCount}, {students.count} total
        </p>
        <nav className="flex items-center gap-2" aria-label="Student pagination">
          {students.page > 1 ? (
            <Link
              className="rounded-md border border-border px-3 py-2 font-medium text-foreground hover:bg-muted"
              href={studentsPageHref(query, students.page - 1)}
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-md border border-border px-3 py-2 text-muted-foreground opacity-60">
              Previous
            </span>
          )}
          {students.page < students.pageCount ? (
            <Link
              className="rounded-md border border-border px-3 py-2 font-medium text-foreground hover:bg-muted"
              href={studentsPageHref(query, students.page + 1)}
            >
              Next
            </Link>
          ) : (
            <span className="rounded-md border border-border px-3 py-2 text-muted-foreground opacity-60">
              Next
            </span>
          )}
        </nav>
      </div>
    </ErpPage>
  );
}
