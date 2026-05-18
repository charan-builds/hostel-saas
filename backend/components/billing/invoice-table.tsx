import type { Route } from "next";
import Link from "next/link";
import { Eye, ReceiptText, UserRound } from "lucide-react";

import { QuickPaymentDialog } from "@/components/billing/quick-payment-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { StatusChip } from "@/components/ui/status-chip";
import type { InvoiceListItem } from "@/modules/billing/billing.service";
import { formatCurrency } from "@/lib/utils";

type InvoiceTableProps = {
  invoices: InvoiceListItem[];
};

function formatStudent(invoice: InvoiceListItem) {
  if (!invoice.student) {
    return "Student unavailable";
  }

  return `${invoice.student.student_code} - ${invoice.student.first_name} ${invoice.student.last_name}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        description="Try changing the branch, student, or status filters."
        title="No invoices found"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
            <thead className="bg-muted/70 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Invoice
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Student
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Due
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Total
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Balance
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Status
                </th>
                <th className="sticky right-0 bg-muted/70 px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr className="hover:bg-muted/50" key={invoice.id}>
                  <td className="px-4 py-3">
                    <Link
                      className="font-semibold hover:underline"
                      href={`/billing/invoices/${invoice.id}` as Route}
                    >
                      {invoice.invoice_number}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(invoice.invoice_month)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {invoice.student ? (
                      <Link
                        className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
                        href={`/students/${invoice.student.id}` as Route}
                      >
                        <UserRound className="size-4" aria-hidden="true" />
                        {formatStudent(invoice)}
                      </Link>
                    ) : (
                      formatStudent(invoice)
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatCurrency(invoice.total_cents, invoice.currency_code)}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(invoice.balance_cents, invoice.currency_code)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={invoice.status} />
                  </td>
                  <td className="sticky right-0 bg-card px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <QuickPaymentDialog
                        invoice={{
                          balanceCents: invoice.balance_cents,
                          currencyCode: invoice.currency_code,
                          id: invoice.id,
                          invoiceNumber: invoice.invoice_number,
                          status: invoice.status,
                          studentLabel: formatStudent(invoice),
                        }}
                      />
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/billing/invoices/${invoice.id}` as Route}>
                          <Eye aria-hidden="true" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {invoices.map((invoice) => (
          <article
            className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
            key={invoice.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  className="font-semibold hover:underline"
                  href={`/billing/invoices/${invoice.id}` as Route}
                >
                  {invoice.invoice_number}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatStudent(invoice)}
                </p>
              </div>
              <StatusChip status={invoice.status} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Due</dt>
                <dd className="text-right font-medium">{formatDate(invoice.due_date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="text-right font-medium">
                  {formatCurrency(invoice.total_cents, invoice.currency_code)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Balance</dt>
                <dd className="text-right font-semibold">
                  {formatCurrency(invoice.balance_cents, invoice.currency_code)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <QuickPaymentDialog
                invoice={{
                  balanceCents: invoice.balance_cents,
                  currencyCode: invoice.currency_code,
                  id: invoice.id,
                  invoiceNumber: invoice.invoice_number,
                  status: invoice.status,
                  studentLabel: formatStudent(invoice),
                }}
              />
              <Button asChild size="sm" variant="outline">
                <Link href={`/billing/invoices/${invoice.id}` as Route}>
                  <ReceiptText aria-hidden="true" />
                  Details
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
