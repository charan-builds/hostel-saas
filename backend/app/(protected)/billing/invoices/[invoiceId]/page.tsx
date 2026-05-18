import Link from "next/link";
import type { Route } from "next";
import { CalendarClock, ReceiptText, WalletCards } from "lucide-react";

import { AdjustmentForm } from "@/components/billing/adjustment-form";
import { PaymentForm } from "@/components/billing/payment-form";
import { ReceiptList } from "@/components/billing/receipt-list";
import { Button } from "@/components/ui/button";
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
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { getInvoice } from "@/modules/billing/billing.service";
import { formatCurrency } from "@/lib/utils";

type InvoiceDetailPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  await requireTenantPageAccess({
    permission: "billing:read",
    product: "hostel_erp",
  });
  const { invoiceId } = await params;
  const details = await getInvoice(invoiceId);
  const student = details.student;
  const studentLabel = student
    ? `${student.student_code} - ${student.first_name} ${student.last_name}`
    : "Student unavailable";
  const paymentProgress =
    details.invoice.total_cents > 0
      ? Math.round((details.invoice.paid_cents / details.invoice.total_cents) * 100)
      : 0;

  return (
    <section className="space-y-6">
      <PageHeader
        actions={
          <>
            {student ? (
              <Button asChild variant="outline">
                <Link href={`/students/${student.id}` as Route}>Student profile</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/billing">Back to billing</Link>
            </Button>
          </>
        }
        description={`${studentLabel} · due ${formatDate(details.invoice.due_date)}`}
        eyebrow={details.invoice.invoice_number}
        meta={<StatusChip status={details.invoice.status} />}
        title="Invoice details"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description={`${paymentProgress}% paid`}
          icon={ReceiptText}
          label="Total"
          value={formatCurrency(details.invoice.total_cents, details.invoice.currency_code)}
        />
        <StatCard
          description="Recorded collections"
          icon={ReceiptText}
          label="Paid"
          tone="success"
          value={formatCurrency(details.invoice.paid_cents, details.invoice.currency_code)}
        />
        <StatCard
          description="Outstanding rent"
          icon={WalletCards}
          label="Balance"
          tone={details.invoice.balance_cents > 0 ? "warning" : "success"}
          value={formatCurrency(details.invoice.balance_cents, details.invoice.currency_code)}
        />
        <StatCard
          description={formatDate(details.invoice.invoice_month)}
          icon={CalendarClock}
          label="Due date"
          tone={details.invoice.status === "overdue" ? "danger" : "default"}
          value={formatDate(details.invoice.due_date)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice items</CardTitle>
              <CardDescription>
                Rent, penalties, discounts, and manual adjustments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead className="border-b border-border text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Item</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {details.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-3">{item.description}</td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {item.item_type.replaceAll("_", " ")}
                        </td>
                        <td className="px-3 py-3 text-right font-medium">
                          {formatCurrency(
                            item.amount_cents,
                            details.invoice.currency_code,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <ReceiptList payments={details.payments} receipts={details.receipts} />
        </div>
        <div className="space-y-6">
          <PaymentForm invoice={details.invoice} studentLabel={studentLabel} />
          <AdjustmentForm invoice={details.invoice} />
        </div>
      </div>
    </section>
  );
}
