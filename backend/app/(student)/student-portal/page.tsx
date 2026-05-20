import Link from "next/link";
import { CalendarCheck, CreditCard, DoorOpen, FileText } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusChip } from "@/components/ui/status-chip";
import { formatCurrency } from "@/lib/utils";
import { getStudentPortalOverview } from "@/modules/student-portal/student-portal.service";

export default async function StudentPortalPage() {
  const overview = await getStudentPortalOverview();
  const openBalanceCents = overview.invoices.reduce(
    (total, invoice) => total + invoice.balance_cents,
    0,
  );
  const currencyCode = overview.invoices[0]?.currency_code ?? "INR";

  return (
    <section className="space-y-6">
      <PageHeader
        description="Review your hostel stay, dues, receipts, leave, attendance, and documents."
        eyebrow={overview.student.student_code}
        title={`${overview.student.first_name} ${overview.student.last_name}`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Latest visible invoices"
          icon={CreditCard}
          label="Open dues"
          tone={openBalanceCents > 0 ? "warning" : "success"}
          value={formatCurrency(openBalanceCents, currencyCode)}
        />
        <StatCard
          description={overview.assignment ? "Active bed assignment" : "No active bed"}
          icon={DoorOpen}
          label="Room status"
          tone={overview.assignment ? "success" : "warning"}
          value={overview.assignment ? "Assigned" : "Unassigned"}
        />
        <StatCard
          description="Recent uploaded or pending records"
          icon={FileText}
          label="Documents"
          value={String(overview.documents.length)}
        />
        <StatCard
          description="Use leave and gate pass workflows"
          icon={CalendarCheck}
          label="Requests"
          value="Available"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Your recent rent invoices and balances.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.invoices.length === 0 ? (
              <p className="rounded-md bg-muted px-3 py-4 text-sm text-muted-foreground">
                No invoices are visible yet.
              </p>
            ) : (
              overview.invoices.map((invoice) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                  key={invoice.id}
                >
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      Due {invoice.due_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(invoice.balance_cents, invoice.currency_code)}
                    </p>
                    <StatusChip status={invoice.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receipts</CardTitle>
            <CardDescription>Recent payment acknowledgements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.receipts.length === 0 ? (
              <p className="rounded-md bg-muted px-3 py-4 text-sm text-muted-foreground">
                No receipts are visible yet.
              </p>
            ) : (
              overview.receipts.map((receipt) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                  key={receipt.id}
                >
                  <div>
                    <p className="font-medium">{receipt.receipt_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(receipt.issued_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(receipt.amount_cents, receipt.currency_code)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Recent document records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.documents.length === 0 ? (
              <p className="rounded-md bg-muted px-3 py-4 text-sm text-muted-foreground">
                No document records are visible yet.
              </p>
            ) : (
              overview.documents.map((document) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                  key={document.id}
                >
                  <div>
                    <p className="font-medium">{document.file_name}</p>
                    <p className="text-sm capitalize text-muted-foreground">
                      {document.document_type.replaceAll("_", " ")}
                    </p>
                  </div>
                  <StatusChip status={document.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Common student workflows.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link className="rounded-md border border-border p-3 hover:bg-accent" href="/leave">
              Leave requests
            </Link>
            <Link
              className="rounded-md border border-border p-3 hover:bg-accent"
              href="/gate-passes"
            >
              Gate passes
            </Link>
            <Link
              className="rounded-md border border-border p-3 hover:bg-accent"
              href="/attendance"
            >
              Attendance
            </Link>
            <Link
              className="rounded-md border border-border p-3 hover:bg-accent"
              href="/notices"
            >
              Notices
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
