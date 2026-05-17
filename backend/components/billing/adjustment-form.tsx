import {
  addInvoiceAdjustmentAction,
  voidBillingInvoiceAction,
} from "@/modules/billing/actions";
import type { BillingInvoice } from "@/modules/billing/billing.service";

type AdjustmentFormProps = {
  invoice: BillingInvoice;
};

export function AdjustmentForm({ invoice }: AdjustmentFormProps) {
  const canAdjust = invoice.status !== "void";
  const canVoid = invoice.status !== "void" && invoice.paid_cents === 0;

  return (
    <div className="space-y-4">
      <form
        action={addInvoiceAdjustmentAction}
        className="space-y-4 rounded border border-slate-200 bg-white p-5"
      >
        <input name="invoiceId" type="hidden" value={invoice.id} />
        <div>
          <p className="text-sm font-medium text-slate-500">Adjust invoice</p>
          <p className="mt-1 text-sm text-slate-600">
            Add penalties, fines, discounts, or manual corrections.
          </p>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Adjustment type</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={!canAdjust}
            name="itemType"
          >
            <option value="penalty">penalty</option>
            <option value="fine">fine</option>
            <option value="discount">discount</option>
            <option value="adjustment">adjustment</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Description</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={!canAdjust}
            name="description"
            required
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Amount</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={!canAdjust}
            min={1}
            name="amountCents"
            required
            type="number"
          />
        </label>
        <button
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:bg-slate-100"
          disabled={!canAdjust}
          type="submit"
        >
          Apply adjustment
        </button>
      </form>
      <form
        action={voidBillingInvoiceAction}
        className="space-y-4 rounded border border-rose-200 bg-white p-5"
      >
        <input name="invoiceId" type="hidden" value={invoice.id} />
        <div>
          <p className="text-sm font-medium text-rose-700">Void invoice</p>
          <p className="mt-1 text-sm text-slate-600">
            Only unpaid invoices can be voided.
          </p>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Reason</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={!canVoid}
            name="reason"
          />
        </label>
        <button
          className="rounded border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          disabled={!canVoid}
          type="submit"
        >
          Void invoice
        </button>
      </form>
    </div>
  );
}
