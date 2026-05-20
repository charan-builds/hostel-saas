"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";
import {
  addInvoiceAdjustmentAction,
  voidBillingInvoiceAction,
} from "@/modules/billing/actions";
import type { BillingInvoice } from "@/modules/billing/billing.service";

type AdjustmentFormProps = {
  invoice: BillingInvoice;
};

const selectClassName =
  "erp-control w-full";

export function AdjustmentForm({ invoice }: AdjustmentFormProps) {
  const canAdjust = invoice.status !== "void";
  const canVoid = invoice.status !== "void" && invoice.paid_cents === 0;
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const adjustmentAmountCents = Math.round(Number(adjustmentAmount || 0) * 100);
  const adjustmentAmountValid =
    Number.isFinite(adjustmentAmountCents) && adjustmentAmountCents > 0;

  return (
    <div className="space-y-4">
      <SectionCard
        description="Add penalties, fines, discounts, or manual corrections."
        title="Adjust invoice"
      >
          <form action={addInvoiceAdjustmentAction} className="space-y-4">
            <input name="invoiceId" type="hidden" value={invoice.id} />
            <label className="block space-y-2">
              <span className="text-sm font-medium">Adjustment type</span>
              <select
                className={selectClassName}
                disabled={!canAdjust}
                name="itemType"
              >
                <option value="penalty">Penalty</option>
                <option value="fine">Fine</option>
                <option value="discount">Discount</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Description</span>
              <Input disabled={!canAdjust} name="description" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Amount</span>
              <input
                name="amountCents"
                type="hidden"
                value={adjustmentAmountValid ? adjustmentAmountCents : 0}
              />
              <Input
                disabled={!canAdjust}
                inputMode="decimal"
                min={0.01}
                onChange={(event) => setAdjustmentAmount(event.target.value)}
                step="0.01"
                type="number"
                value={adjustmentAmount}
              />
            </label>
            <Button
              disabled={!canAdjust || !adjustmentAmountValid}
              type="submit"
              variant="outline"
            >
              Apply adjustment
            </Button>
          </form>
      </SectionCard>
      <SectionCard
        className="border-destructive/30"
        description="Only unpaid invoices can be voided."
        title="Void invoice"
      >
          <form action={voidBillingInvoiceAction} className="space-y-4">
            <input name="invoiceId" type="hidden" value={invoice.id} />
            <label className="block space-y-2">
              <span className="text-sm font-medium">Reason</span>
              <Input disabled={!canVoid} name="reason" />
            </label>
            <Button disabled={!canVoid} type="submit" variant="destructive">
              Void invoice
            </Button>
          </form>
      </SectionCard>
    </div>
  );
}
