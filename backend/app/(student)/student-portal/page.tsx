import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  DoorOpen,
  FileText,
  LifeBuoy,
  Mail,
  Phone,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/utils";
import { getStudentPortalOverview } from "@/modules/student-portal/student-portal.service";
import type { Json } from "@/types/database.types";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function readJsonValue(value: Json, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const item = value[key];

  return typeof item === "string" ? item : "";
}

function shortId(value: string | null | undefined) {
  return value ? value.slice(0, 8) : "Not assigned";
}

function dueLabel(dueDate: string) {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(`${dueDate}T00:00:00.000Z`);
  const now = new Date(`${today}T00:00:00.000Z`);
  const days = Math.ceil((now.getTime() - due.getTime()) / 86_400_000);

  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"} overdue`;
  }

  if (days === 0) {
    return "Due today";
  }

  return `Due in ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
}

function StudentAction({
  description,
  href,
  icon: Icon,
  label,
}: {
  description: string;
  href: Route;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      className="flex items-start gap-3 rounded-lg border border-border bg-muted/35 p-4 transition-colors hover:bg-muted"
      href={href}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-background text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="mt-1 block text-sm text-muted-foreground">
          {description}
        </span>
      </span>
    </Link>
  );
}

export default async function StudentPortalPage() {
  const overview = await getStudentPortalOverview();
  const openInvoices = overview.invoices.filter(
    (invoice) => invoice.balance_cents > 0,
  );
  const openBalanceCents = openInvoices.reduce(
    (total, invoice) => total + invoice.balance_cents,
    0,
  );
  const currencyCode = overview.invoices[0]?.currency_code ?? "INR";
  const nextDueInvoice = [...openInvoices].sort((a, b) =>
    a.due_date.localeCompare(b.due_date),
  )[0];
  const paidReceiptTotalCents = overview.receipts.reduce(
    (total, receipt) => total + receipt.amount_cents,
    0,
  );
  const uploadedDocuments = overview.documents.filter(
    (document) => document.status === "uploaded" || document.status === "verified",
  ).length;
  const studentName = `${overview.student.first_name} ${overview.student.last_name}`;
  const guardianName = readJsonValue(overview.student.guardian_info, "name");
  const guardianPhone = readJsonValue(overview.student.guardian_info, "phone");
  const emergencyName = readJsonValue(
    overview.student.emergency_contact,
    "name",
  );
  const emergencyPhone = readJsonValue(
    overview.student.emergency_contact,
    "phone",
  );

  return (
    <ErpPage className="mx-auto max-w-6xl">
      <PageHeader
        description="A simple self-service space for dues, room details, leave, notices, attendance, and documents."
        eyebrow={overview.student.student_code}
        meta={<StatusBadge status={overview.student.status} />}
        title={`Hi, ${overview.student.first_name}`}
      />

      <SectionCard
        className="overflow-hidden"
        contentClassName="grid gap-5 lg:grid-cols-[1fr_auto]"
      >
        <div>
          <p className="text-sm font-medium text-muted-foreground">Current dues</p>
          <p className="mt-2 text-4xl font-semibold tracking-normal">
            {formatCurrency(openBalanceCents, currencyCode)}
          </p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {nextDueInvoice
              ? `${nextDueInvoice.invoice_number} is ${dueLabel(nextDueInvoice.due_date)}.`
              : "You do not have any open dues in the latest visible invoices."}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:w-80 lg:grid-cols-1">
          <Button asChild className="justify-start" variant="outline">
            <Link href="/notices">
              <Bell aria-hidden="true" />
              Read notices
            </Link>
          </Button>
          <Button asChild className="justify-start" variant="outline">
            <Link href="/leave">
              <ClipboardList aria-hidden="true" />
              Request leave
            </Link>
          </Button>
        </div>
      </SectionCard>

      <ErpPageGrid>
        <StatCard
          description={
            nextDueInvoice ? dueLabel(nextDueInvoice.due_date) : "Nothing due"
          }
          icon={CreditCard}
          label="Open dues"
          tone={openBalanceCents > 0 ? "warning" : "success"}
          value={formatCurrency(openBalanceCents, currencyCode)}
        />
        <StatCard
          description={
            overview.assignment
              ? `Room ${shortId(overview.assignment.room_id)}`
              : "Ask admin for bed assignment"
          }
          icon={DoorOpen}
          label="Room"
          tone={overview.assignment ? "success" : "warning"}
          value={overview.assignment ? "Assigned" : "Unassigned"}
        />
        <StatCard
          description={`${uploadedDocuments}/${overview.documents.length} uploaded or verified`}
          icon={FileText}
          label="Documents"
          value={String(overview.documents.length)}
        />
        <StatCard
          description="Latest receipt total shown here"
          icon={ReceiptText}
          label="Paid recently"
          tone={paidReceiptTotalCents > 0 ? "success" : "default"}
          value={formatCurrency(paidReceiptTotalCents, currencyCode)}
        />
      </ErpPageGrid>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          contentClassName="space-y-3"
          description="Understand what is pending, what is paid, and what needs hostel-office follow-up."
          title="Dues and invoices"
        >
          {overview.invoices.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              No invoices are visible yet.
            </div>
          ) : (
            overview.invoices.map((invoice) => (
              <div
                className="rounded-lg border border-border bg-card p-4"
                key={invoice.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{invoice.invoice_number}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Due {formatDate(invoice.due_date)} · {dueLabel(invoice.due_date)}
                    </p>
                  </div>
                  <StatusBadge status={invoice.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-muted-foreground">Total</p>
                    <p className="mt-1 font-semibold">
                      {formatCurrency(invoice.total_cents, invoice.currency_code)}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-muted-foreground">Balance</p>
                    <p className="mt-1 font-semibold">
                      {formatCurrency(invoice.balance_cents, invoice.currency_code)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard
          contentClassName="space-y-3"
          description="Recent payment acknowledgements and receipt numbers."
          title="Payment history"
        >
          {overview.receipts.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              No receipts are visible yet.
            </div>
          ) : (
            overview.receipts.map((receipt) => (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-4"
                key={receipt.id}
              >
                <div>
                  <p className="font-semibold">{receipt.receipt_number}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDateTime(receipt.issued_at)}
                  </p>
                </div>
                <p className="text-right font-semibold">
                  {formatCurrency(receipt.amount_cents, receipt.currency_code)}
                </p>
              </div>
            ))
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          contentClassName="space-y-4"
          description="Your current hostel stay information."
          title="Room and hostel"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Room</p>
              <p className="mt-1 font-semibold">
                {shortId(overview.assignment?.room_id)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Bed</p>
              <p className="mt-1 font-semibold">
                {shortId(overview.assignment?.bed_id)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Branch</p>
              <p className="mt-1 font-semibold">
                {shortId(overview.student.hostel_branch_id)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Assigned from</p>
              <p className="mt-1 font-semibold">
                {formatDate(overview.assignment?.start_date)}
              </p>
            </div>
          </div>
          <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Roommate and occupancy context can be shown here once student-safe room details are exposed.
          </p>
        </SectionCard>

        <SectionCard
          contentClassName="grid gap-3 sm:grid-cols-2"
          description="Quick access to simple student workflows."
          title="Self-service"
        >
          <StudentAction
            description="Submit leave and check approval status."
            href="/leave"
            icon={ClipboardList}
            label="Leave requests"
          />
          <StudentAction
            description="View presence records and daily status."
            href="/attendance"
            icon={CalendarCheck}
            label="Attendance"
          />
          <StudentAction
            description="Read hostel notices and announcements."
            href="/notices"
            icon={Bell}
            label="Notices"
          />
          <StudentAction
            description="Request or review hostel movement passes."
            href="/gate-passes"
            icon={DoorOpen}
            label="Gate passes"
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          contentClassName="space-y-4"
          description="Your hostel profile and emergency contacts."
          title="Profile"
        >
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
            <span className="grid size-12 place-items-center rounded-full bg-background font-semibold">
              {overview.student.first_name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{studentName}</p>
              <p className="text-sm text-muted-foreground">
                {overview.student.student_code}
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" aria-hidden="true" />
              <span>{overview.student.phone ?? "Phone not added"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
              <span>{overview.student.email ?? "Email not added"}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
              <span>
                Guardian: {guardianName || "Not added"}
                {guardianPhone ? ` · ${guardianPhone}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
              <span>
                Emergency: {emergencyName || "Not added"}
                {emergencyPhone ? ` · ${emergencyPhone}` : ""}
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          contentClassName="space-y-3"
          description="Uploaded and pending document records shared with the hostel office."
          title="Documents"
        >
          {overview.documents.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              No document records are visible yet.
            </div>
          ) : (
            overview.documents.map((document) => (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-4"
                key={document.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{document.file_name}</p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">
                    {document.document_type.replaceAll("_", " ")} ·{" "}
                    {formatDate(document.created_at)}
                  </p>
                </div>
                <StatusBadge status={document.status} />
              </div>
            ))
          )}
        </SectionCard>
      </div>

      <SectionCard
        contentClassName="grid gap-3 sm:grid-cols-3"
        description="Use these when you need help from the hostel office."
        title="Need help?"
      >
        <StudentAction
          description="Check latest messages from hostel admins."
          href="/notifications"
          icon={Bell}
          label="Notifications"
        />
        <StudentAction
          description="Read policy updates, events, and maintenance notes."
          href="/notices"
          icon={FileText}
          label="Notice board"
        />
        <div className="rounded-lg border border-border bg-muted/35 p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-background text-muted-foreground">
              <LifeBuoy className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">Contact hostel office</p>
              <p className="mt-1 text-sm text-muted-foreground">
                For payments, room issues, or document corrections, contact your hostel administrator.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </ErpPage>
  );
}
