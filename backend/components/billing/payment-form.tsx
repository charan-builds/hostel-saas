import { randomUUID } from "node:crypto";

import { recordInvoicePaymentAction } from "@/modules/billing/actions";
import type { BillingInvoice } from "@/modules/billing/billing.service";

type PaymentFormProps = {
  invoice: BillingInvoice;
};

function formatMoney(cents: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

export function PaymentForm({ invoice }: PaymentFormProps) {
  const canPay = invoice.status !== "void" && invoice.balance_cents > 0;
  const idempotencyKey = randomUUID();

  return (
    <form
      action={recordInvoicePaymentAction}
      className="space-y-4 rounded border border-slate-200 bg-white p-5"
    >
      <input name="invoiceId" type="hidden" value={invoice.id} />
      <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
      <div>
        <p className="text-sm font-medium text-slate-500">Record payment</p>
        <p className="mt-1 text-sm text-slate-600">
          Outstanding balance: {formatMoney(invoice.balance_cents, invoice.currency_code)}
        </p>
      </div>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Amount</span>
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          defaultValue={invoice.balance_cents}
          disabled={!canPay}
          max={invoice.balance_cents}
          min={1}
          name="amountCents"
          required
          type="number"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Payment method</span>
        <select
          className="w-full rounded border border-slate-300 px-3 py-2"
          disabled={!canPay}
          name="paymentMethod"
        >
          <option value="cash">cash</option>
          <option value="upi">upi</option>
          <option value="bank_transfer">bank transfer</option>
          <option value="card">card</option>
          <option value="cashfree">cashfree</option>
          <option value="other">other</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Received at</span>
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          defaultValue={new Date().toISOString().slice(0, 16)}
          disabled={!canPay}
          name="receivedAt"
          type="datetime-local"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Reference</span>
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          disabled={!canPay}
          name="providerReference"
          placeholder="UPI reference, bank transaction, or Cashfree order"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          className="min-h-24 w-full rounded border border-slate-300 px-3 py-2"
          disabled={!canPay}
          name="notes"
        />
      </label>
      <button
        className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!canPay}
        type="submit"
      >
        Record payment
      </button>
    </form>
  );
}
