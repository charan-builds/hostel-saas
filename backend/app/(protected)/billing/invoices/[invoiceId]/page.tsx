import Link from "next/link";

import { AdjustmentForm } from "@/components/billing/adjustment-form";
import { PaymentForm } from "@/components/billing/payment-form";
import { ReceiptList } from "@/components/billing/receipt-list";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { getInvoice } from "@/modules/billing/billing.service";

type InvoiceDetailPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

function formatMoney(cents: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
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

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {details.invoice.invoice_number}
          </p>
          <h2 className="text-2xl font-semibold">Invoice details</h2>
          <p className="mt-1 text-sm text-slate-600">
            {student
              ? `${student.student_code} - ${student.first_name} ${student.last_name}`
              : "Student unavailable"}
          </p>
        </div>
        <Link
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
          href="/billing"
        >
          Back to billing
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Status</p>
          <p className="mt-2 font-semibold">{details.invoice.status}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <p className="mt-2 font-semibold">
            {formatMoney(details.invoice.total_cents, details.invoice.currency_code)}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Paid</p>
          <p className="mt-2 font-semibold">
            {formatMoney(details.invoice.paid_cents, details.invoice.currency_code)}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Balance</p>
          <p className="mt-2 font-semibold">
            {formatMoney(details.invoice.balance_cents, details.invoice.currency_code)}
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded border border-slate-200 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {details.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-slate-600">{item.item_type}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatMoney(item.amount_cents, details.invoice.currency_code)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ReceiptList payments={details.payments} receipts={details.receipts} />
        </div>
        <div className="space-y-6">
          <PaymentForm invoice={details.invoice} />
          <AdjustmentForm invoice={details.invoice} />
        </div>
      </div>
    </section>
  );
}
