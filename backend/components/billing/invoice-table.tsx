import type { Route } from "next";
import Link from "next/link";

import type { InvoiceListItem } from "@/modules/billing/billing.service";

type InvoiceTableProps = {
  invoices: InvoiceListItem[];
};

function formatMoney(cents: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

function formatStudent(invoice: InvoiceListItem) {
  if (!invoice.student) {
    return "Student unavailable";
  }

  return `${invoice.student.student_code} - ${invoice.student.first_name} ${invoice.student.last_name}`;
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Invoice</th>
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Month</th>
            <th className="px-4 py-3 font-medium">Due date</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Balance</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {invoices.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={8}>
                No invoices found.
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-4 py-3 font-medium">{invoice.invoice_number}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatStudent(invoice)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {invoice.invoice_month}
                </td>
                <td className="px-4 py-3 text-slate-600">{invoice.due_date}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatMoney(invoice.total_cents, invoice.currency_code)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatMoney(invoice.balance_cents, invoice.currency_code)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded border border-slate-200 px-2 py-1 text-xs font-medium">
                    {invoice.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    className="font-medium text-slate-950 underline"
                    href={`/billing/invoices/${invoice.id}` as Route}
                  >
                    View
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
