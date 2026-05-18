import Link from "next/link";
import type { Route } from "next";
import {
  BedDouble,
  ClipboardCheck,
  CreditCard,
  FileUp,
  MoreHorizontal,
  Pencil,
  UserRound,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { StatusChip } from "@/components/ui/status-chip";
import type { Database } from "@/types/database.types";

type StudentRow = Database["public"]["Tables"]["students"]["Row"];

type StudentTableProps = {
  branchNames: Record<string, string>;
  canManageStudents: boolean;
  students: StudentRow[];
};

function studentRoute(studentId: string, suffix = "") {
  return `/students/${studentId}${suffix}` as Route;
}

function billingRoute(student: StudentRow) {
  return `/billing?hostelBranchId=${student.hostel_branch_id}` as Route;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function StudentQuickActions({
  canManageStudents,
  student,
}: {
  canManageStudents: boolean;
  student: StudentRow;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={studentRoute(student.id)}>
          <UserRound aria-hidden="true" />
          View
        </Link>
      </Button>
      {canManageStudents ? (
        <>
          <Button asChild size="sm" variant="outline">
            <Link href={studentRoute(student.id, "/edit#assign-bed")}>
              <BedDouble aria-hidden="true" />
              Assign
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={billingRoute(student)}>
              <CreditCard aria-hidden="true" />
              Rent
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={studentRoute(student.id, "/edit#documents")}>
              <FileUp aria-hidden="true" />
              Docs
            </Link>
          </Button>
        </>
      ) : null}
    </div>
  );
}

function StudentMoreActions({
  canManageStudents,
  student,
}: {
  canManageStudents: boolean;
  student: StudentRow;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button asChild className="justify-start" size="sm" variant="outline">
        <Link href={studentRoute(student.id, "#dues")}>
          <WalletCards aria-hidden="true" />
          View dues
        </Link>
      </Button>
      <Button asChild className="justify-start" size="sm" variant="outline">
        <Link href={studentRoute(student.id, "#attendance")}>
          <ClipboardCheck aria-hidden="true" />
          Attendance
        </Link>
      </Button>
      {canManageStudents ? (
        <>
          <Button asChild className="justify-start" size="sm" variant="outline">
            <Link href={studentRoute(student.id, "/edit#status")}>
              <Pencil aria-hidden="true" />
              Mark inactive
            </Link>
          </Button>
          <Button asChild className="justify-start" size="sm" variant="outline">
            <Link href={studentRoute(student.id, "/edit")}>
              <MoreHorizontal aria-hidden="true" />
              Edit profile
            </Link>
          </Button>
        </>
      ) : null}
    </div>
  );
}

export function StudentTable({
  branchNames,
  canManageStudents,
  students,
}: StudentTableProps) {
  if (students.length === 0) {
    return (
      <EmptyState
        action={
          canManageStudents ? (
            <Button asChild>
              <Link href="/students/new">Admit student</Link>
            </Button>
          ) : null
        }
        description="Try changing the search, status, or branch filters."
        title="No students found"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-muted/70 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Student
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Branch
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Contact
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Admission
                </th>
                <th className="sticky right-0 bg-muted/70 px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => (
                <tr className="hover:bg-muted/50" key={student.id}>
                  <td className="px-4 py-3">
                    <Link
                      className="font-semibold text-foreground hover:underline"
                      href={studentRoute(student.id)}
                    >
                      {student.first_name} {student.last_name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {student.student_code}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {branchNames[student.hostel_branch_id] ?? "Assigned branch"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {student.email ?? student.phone ?? "Not provided"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={student.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(student.admission_date)}
                  </td>
                  <td className="sticky right-0 bg-card px-4 py-3">
                    <StudentQuickActions
                      canManageStudents={canManageStudents}
                      student={student}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {students.map((student) => (
          <article
            className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
            key={student.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  className="font-semibold hover:underline"
                  href={studentRoute(student.id)}
                >
                  {student.first_name} {student.last_name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {student.student_code}
                </p>
              </div>
              <StatusChip status={student.status} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Branch</dt>
                <dd className="text-right font-medium">
                  {branchNames[student.hostel_branch_id] ?? "Assigned branch"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="text-right font-medium">
                  {student.email ?? student.phone ?? "Not provided"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Admission</dt>
                <dd className="text-right font-medium">
                  {formatDate(student.admission_date)}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <StudentMoreActions
                canManageStudents={canManageStudents}
                student={student}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
