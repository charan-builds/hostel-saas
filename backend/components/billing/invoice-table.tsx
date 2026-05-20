"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Eye,
  ReceiptText,
  UserRound,
} from "lucide-react";

import { QuickPaymentDialog } from "@/components/billing/quick-payment-dialog";
import { DataTable } from "@/components/data/data-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { InvoiceListItem } from "@/modules/billing/billing.service";
import { formatCurrency } from "@/lib/utils";

type InvoiceTableProps = {
  branchNames?: Record<string, string>;
  invoices: InvoiceListItem[];
};

function invoiceRoute(invoiceId: string) {
  return `/billing/invoices/${invoiceId}` as Route;
}

function studentRoute(studentId: string) {
  return `/students/${studentId}` as Route;
}

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

function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate = new Date(`${end}T00:00:00.000Z`);

  return Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000);
}

function getDueState(invoice: InvoiceListItem) {
  if (invoice.status === "paid" || invoice.status === "void" || invoice.balance_cents <= 0) {
    return {
      label: "Settled",
      tone: "text-success",
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const days = daysBetween(invoice.due_date, today);

  if (days > 0 || invoice.status === "overdue") {
    return {
      label: `${days || 1}d overdue`,
      tone: "text-destructive",
    };
  }

  if (days === 0) {
    return {
      label: "Due today",
      tone: "text-warning",
    };
  }

  return {
    label: `Due in ${Math.abs(days)}d`,
    tone: "text-muted-foreground",
  };
}

function InvoiceActions({ invoice }: { invoice: InvoiceListItem }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
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
        <Link href={invoiceRoute(invoice.id)}>
          <Eye aria-hidden="true" />
          View
        </Link>
      </Button>
    </div>
  );
}

function InvoiceMobileCard({
  branchNames,
  invoice,
}: {
  branchNames: Record<string, string>;
  invoice: InvoiceListItem;
}) {
  const dueState = getDueState(invoice);
  const branchName = invoice.student
    ? branchNames[invoice.student.hostel_branch_id]
    : undefined;

  return (
    <article className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            className="font-semibold hover:underline"
            href={invoiceRoute(invoice.id)}
          >
            {invoice.invoice_number}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatStudent(invoice)}
          </p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>
      <dl className="grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Branch</dt>
          <dd className="text-right font-medium">{branchName ?? "Assigned branch"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Due</dt>
          <dd className="text-right">
            <span className="block font-medium">{formatDate(invoice.due_date)}</span>
            <span className={dueState.tone}>{dueState.label}</span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Total</dt>
          <dd className="text-right font-medium">
            {formatCurrency(invoice.total_cents, invoice.currency_code)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Balance</dt>
          <dd className="text-right text-base font-semibold">
            {formatCurrency(invoice.balance_cents, invoice.currency_code)}
          </dd>
        </div>
      </dl>
      <div className="grid grid-cols-2 gap-2">
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
          <Link href={invoiceRoute(invoice.id)}>
            <ReceiptText aria-hidden="true" />
            Details
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function InvoiceTable({
  branchNames = {},
  invoices,
}: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        description="Try changing the branch, student, or status filters."
        title="No invoices found"
      />
    );
  }

  const columns: ColumnDef<InvoiceListItem>[] = [
    {
      accessorKey: "invoice_number",
      cell: ({ row }) => {
        const invoice = row.original;

        return (
          <div>
            <Link
              className="font-semibold text-foreground hover:underline"
              href={invoiceRoute(invoice.id)}
            >
              {invoice.invoice_number}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Period {formatDate(invoice.invoice_month)}
            </p>
          </div>
        );
      },
      header: "Invoice",
    },
    {
      cell: ({ row }) => {
        const invoice = row.original;

        return invoice.student ? (
          <div>
            <Link
              className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
              href={studentRoute(invoice.student.id)}
            >
              <UserRound className="size-4" aria-hidden="true" />
              {formatStudent(invoice)}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {branchNames[invoice.student.hostel_branch_id] ?? "Assigned branch"}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">{formatStudent(invoice)}</span>
        );
      },
      header: "Student / branch",
      id: "student",
    },
    {
      accessorKey: "due_date",
      cell: ({ row }) => {
        const invoice = row.original;
        const dueState = getDueState(invoice);

        return (
          <div>
            <p className="font-medium">{formatDate(invoice.due_date)}</p>
            <p className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${dueState.tone}`}>
              {dueState.tone === "text-destructive" ? (
                <AlertTriangle className="size-3" aria-hidden="true" />
              ) : null}
              {dueState.label}
            </p>
          </div>
        );
      },
      header: "Due",
    },
    {
      accessorKey: "total_cents",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatCurrency(row.original.total_cents, row.original.currency_code)}
        </span>
      ),
      header: "Total",
    },
    {
      accessorKey: "balance_cents",
      cell: ({ row }) => (
        <div className="font-semibold">
          {formatCurrency(row.original.balance_cents, row.original.currency_code)}
        </div>
      ),
      header: "Balance",
    },
    {
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      header: "Status",
    },
    {
      cell: ({ row }) => <InvoiceActions invoice={row.original} />,
      enableSorting: false,
      header: "Actions",
      id: "actions",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={invoices}
      enablePagination={false}
      mobileCard={(invoice) => (
        <InvoiceMobileCard branchNames={branchNames} invoice={invoice} />
      )}
      rowSelection={false}
      showToolbar={false}
      tableMinWidth="1120px"
    />
  );
}
