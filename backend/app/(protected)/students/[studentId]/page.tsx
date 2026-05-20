import Link from "next/link";
import type { Route } from "next";
import {
  BedDouble,
  CalendarCheck,
  FileText,
  FileUp,
  Pencil,
  ReceiptText,
  UserRound,
  WalletCards,
} from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/state";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { getStudent } from "@/modules/students/students.service";
import type { Database } from "@/types/database.types";

type StudentRow = Database["public"]["Tables"]["students"]["Row"];
type AssignmentRow =
  Database["public"]["Tables"]["student_room_assignments"]["Row"];
type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type BedRow = Database["public"]["Tables"]["room_beds"]["Row"];
type BranchRow = Database["public"]["Tables"]["hostel_branches"]["Row"];
type InvoiceRow = Database["public"]["Tables"]["billing_invoices"]["Row"];
type PaymentRow = Database["public"]["Tables"]["billing_payments"]["Row"];
type AttendanceRow = Database["public"]["Tables"]["attendance_records"]["Row"];
type LeaveRow = Database["public"]["Tables"]["student_leave_requests"]["Row"];
type DocumentRow = Database["public"]["Tables"]["student_documents"]["Row"];

type StudentDetailPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

type StudentOperationalSummary = {
  assignment?: AssignmentRow | undefined;
  attendance: AttendanceRow[];
  bed?: BedRow | undefined;
  branch?: BranchRow | undefined;
  documents: DocumentRow[];
  invoices: InvoiceRow[];
  leaveRequests: LeaveRow[];
  payments: PaymentRow[];
  room?: RoomRow | undefined;
};

function editRoute(studentId: string, hash = "") {
  return `/students/${studentId}/edit${hash}` as Route;
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
  }).format(new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function assertQueryOk(error: { message?: string } | null, label: string) {
  if (error) {
    throw new Error(`${label} could not be loaded.`);
  }
}

async function loadStudentOperationalSummary(
  student: StudentRow,
): Promise<StudentOperationalSummary> {
  const supabase = await createSupabaseServerClient();
  const [
    branchResult,
    assignmentResult,
    invoicesResult,
    paymentsResult,
    attendanceResult,
    leaveResult,
    documentsResult,
  ] = await Promise.all([
    supabase
      .from("hostel_branches")
      .select("*")
      .eq("id", student.hostel_branch_id)
      .eq("organization_id", student.organization_id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("student_room_assignments")
      .select("*")
      .eq("student_id", student.id)
      .eq("organization_id", student.organization_id)
      .is("deleted_at", null)
      .order("start_date", { ascending: false })
      .limit(1),
    supabase
      .from("billing_invoices")
      .select("*")
      .eq("student_id", student.id)
      .eq("organization_id", student.organization_id)
      .is("deleted_at", null)
      .order("due_date", { ascending: false })
      .limit(5),
    supabase
      .from("billing_payments")
      .select("*")
      .eq("student_id", student.id)
      .eq("organization_id", student.organization_id)
      .is("deleted_at", null)
      .order("received_at", { ascending: false })
      .limit(5),
    supabase
      .from("attendance_records")
      .select("*")
      .eq("student_id", student.id)
      .eq("organization_id", student.organization_id)
      .is("deleted_at", null)
      .order("attendance_date", { ascending: false })
      .limit(7),
    supabase
      .from("student_leave_requests")
      .select("*")
      .eq("student_id", student.id)
      .eq("organization_id", student.organization_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("student_documents")
      .select("*")
      .eq("student_id", student.id)
      .eq("organization_id", student.organization_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  assertQueryOk(branchResult.error, "Branch");
  assertQueryOk(assignmentResult.error, "Room assignment");
  assertQueryOk(invoicesResult.error, "Billing summary");
  assertQueryOk(paymentsResult.error, "Payment history");
  assertQueryOk(attendanceResult.error, "Attendance");
  assertQueryOk(leaveResult.error, "Leave history");
  assertQueryOk(documentsResult.error, "Documents");

  const assignment = assignmentResult.data?.[0];
  let room: RoomRow | undefined;
  let bed: BedRow | undefined;

  if (assignment) {
    const [roomResult, bedResult] = await Promise.all([
      supabase
        .from("rooms")
        .select("*")
        .eq("id", assignment.room_id)
        .eq("organization_id", assignment.organization_id)
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("room_beds")
        .select("*")
        .eq("id", assignment.bed_id)
        .eq("organization_id", assignment.organization_id)
        .is("deleted_at", null)
        .maybeSingle(),
    ]);

    assertQueryOk(roomResult.error, "Room");
    assertQueryOk(bedResult.error, "Bed");

    room = roomResult.data ?? undefined;
    bed = bedResult.data ?? undefined;
  }

  return {
    assignment,
    attendance: attendanceResult.data ?? [],
    bed,
    branch: branchResult.data ?? undefined,
    documents: documentsResult.data ?? [],
    invoices: invoicesResult.data ?? [],
    leaveRequests: leaveResult.data ?? [],
    payments: paymentsResult.data ?? [],
    room,
  };
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-3 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value || "Not provided"}</dd>
    </div>
  );
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  await requireTenantPageAccess({
    permission: "student:read",
    product: "hostel_erp",
  });
  const { studentId } = await params;
  const student = await getStudent(studentId);
  const summary = await loadStudentOperationalSummary(student);
  const currencyCode = summary.invoices[0]?.currency_code ?? "INR";
  const dueCents = summary.invoices.reduce(
    (total, invoice) =>
      invoice.status === "void" ? total : total + invoice.balance_cents,
    0,
  );
  const paidCents = summary.payments.reduce(
    (total, payment) => total + payment.amount_cents,
    0,
  );
  const roomBedLabel =
    summary.room && summary.bed
      ? `${summary.room.room_code} · ${summary.bed.bed_code}`
      : "Unassigned";
  const latestAttendance = summary.attendance[0];
  const pendingLeaves = summary.leaveRequests.filter(
    (request) => request.status === "pending",
  ).length;

  return (
    <ErpPage>
      <PageHeader
        actions={
          <>
            <Button asChild>
              <Link href={editRoute(student.id)}>
                <Pencil aria-hidden="true" />
                Edit profile
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={editRoute(student.id, "#documents")}>
                <FileUp aria-hidden="true" />
                Upload document
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={billingRoute(student)}>
                <ReceiptText aria-hidden="true" />
                Collect rent
              </Link>
            </Button>
          </>
        }
        description={`${summary.branch?.name ?? "Active branch"} · admitted ${formatDate(student.admission_date)}`}
        eyebrow={student.student_code}
        meta={<StatusBadge status={student.status} />}
        title={`${student.first_name} ${student.last_name}`}
      />

      <ErpPageGrid>
        <StatCard
          description={`${summary.invoices.length} recent invoices`}
          href={"#dues" as Route}
          icon={WalletCards}
          label="Pending dues"
          tone={dueCents > 0 ? "warning" : "success"}
          value={formatCurrency(dueCents, currencyCode)}
        />
        <StatCard
          description={summary.assignment?.status ?? "No active assignment"}
          icon={BedDouble}
          label="Room / bed"
          tone={summary.assignment ? "success" : "warning"}
          value={roomBedLabel}
        />
        <StatCard
          description={latestAttendance ? formatDate(latestAttendance.attendance_date) : "No records"}
          href={"#attendance" as Route}
          icon={CalendarCheck}
          label="Attendance"
          value={latestAttendance?.status ?? "No data"}
        />
        <StatCard
          description={`${summary.documents.length} recent files`}
          href={"#documents" as Route}
          icon={FileText}
          label="Documents"
          value={String(summary.documents.length)}
        />
      </ErpPageGrid>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <SectionCard
          description="Contact, guardian, and emergency information."
          title="Student profile"
        >
            <dl>
              <DetailRow label="Email" value={student.email} />
              <DetailRow label="Phone" value={student.phone} />
              <DetailRow label="Branch" value={summary.branch?.name} />
              <DetailRow label="Gender" value={student.gender?.replaceAll("_", " ")} />
              <DetailRow label="Date of birth" value={formatDate(student.date_of_birth)} />
            </dl>
        </SectionCard>

        <SectionCard
          contentClassName="grid gap-2"
          description="Jump into common desk workflows."
          title="Operational actions"
        >
            <Button asChild className="justify-start" variant="outline">
              <Link href={editRoute(student.id, "#assign-bed")}>
                <BedDouble aria-hidden="true" />
                Assign bed
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="outline">
              <Link href={billingRoute(student)}>
                <ReceiptText aria-hidden="true" />
                Collect rent
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="outline">
              <Link href={editRoute(student.id, "#documents")}>
                <FileUp aria-hidden="true" />
                Upload document
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="outline">
              <Link href={editRoute(student.id, "#status")}>
                <UserRound aria-hidden="true" />
                Mark inactive
              </Link>
            </Button>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          contentClassName="space-y-3"
          description={`${formatCurrency(dueCents, currencyCode)} pending · ${formatCurrency(paidCents, currencyCode)} recently paid`}
          id="dues"
          title="Dues and invoices"
        >
            {summary.invoices.length === 0 ? (
              <EmptyState
                description="Invoices will appear after rent generation."
                title="No invoices found"
              />
            ) : (
              summary.invoices.map((invoice) => (
                <Link
                  className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-3 text-sm hover:bg-muted"
                  href={`/billing/invoices/${invoice.id}` as Route}
                  key={invoice.id}
                >
                  <span>
                    <span className="font-medium">{invoice.invoice_number}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Due {formatDate(invoice.due_date)}
                    </span>
                  </span>
                  <span className="text-right">
                    <StatusBadge status={invoice.status} />
                    <span className="mt-1 block text-xs font-medium">
                      {formatCurrency(invoice.balance_cents, invoice.currency_code)}
                    </span>
                  </span>
                </Link>
              ))
            )}
        </SectionCard>

        <SectionCard
          contentClassName="space-y-3"
          description="Recent receipts and offline collection records."
          title="Payment history"
        >
            {summary.payments.length === 0 ? (
              <EmptyState
                description="Payments will appear after rent is collected."
                title="No payments found"
              />
            ) : (
              summary.payments.map((payment) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-3 text-sm"
                  key={payment.id}
                >
                  <span>
                    <span className="font-medium">{payment.receipt_number}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {payment.payment_method} · {formatDateTime(payment.received_at)}
                    </span>
                  </span>
                  <span className="text-right font-semibold">
                    {formatCurrency(payment.amount_cents, payment.currency_code)}
                  </span>
                </div>
              ))
            )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          contentClassName="space-y-3"
          description="Latest daily presence records."
          id="attendance"
          title="Attendance"
        >
            {summary.attendance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance records found.</p>
            ) : (
              summary.attendance.map((record) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                  key={record.id}
                >
                  <span>{formatDate(record.attendance_date)}</span>
                  <StatusBadge status={record.status} />
                </div>
              ))
            )}
        </SectionCard>

        <SectionCard
          contentClassName="space-y-3"
          description={`${pendingLeaves} pending requests.`}
          title="Leave"
        >
            {summary.leaveRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leave requests found.</p>
            ) : (
              summary.leaveRequests.map((request) => (
                <div
                  className="rounded-md border border-border px-3 py-2 text-sm"
                  key={request.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">
                      {request.leave_type.replaceAll("_", " ")}
                    </span>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(request.starts_at)} to{" "}
                    {formatDateTime(request.expected_return_at)}
                  </p>
                </div>
              ))
            )}
        </SectionCard>

        <SectionCard
          contentClassName="space-y-3"
          description="Recent upload and verification state."
          id="documents"
          title="Documents"
        >
            {summary.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            ) : (
              summary.documents.map((document) => (
                <div
                  className="rounded-md border border-border px-3 py-2 text-sm"
                  key={document.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-medium">{document.file_name}</span>
                    <StatusBadge status={document.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {document.document_type.replaceAll("_", " ")} ·{" "}
                    {formatDateTime(document.created_at)}
                  </p>
                </div>
              ))
            )}
        </SectionCard>
      </div>
    </ErpPage>
  );
}
