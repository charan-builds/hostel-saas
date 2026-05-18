"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addInvoiceAdjustmentAction,
  voidBillingInvoiceAction,
} from "@/modules/billing/actions";
import type { BillingInvoice } from "@/modules/billing/billing.service";

type AdjustmentFormProps = {
  invoice: BillingInvoice;
};

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function AdjustmentForm({ invoice }: AdjustmentFormProps) {
  const canAdjust = invoice.status !== "void";
  const canVoid = invoice.status !== "void" && invoice.paid_cents === 0;
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const adjustmentAmountCents = Math.round(Number(adjustmentAmount || 0) * 100);
  const adjustmentAmountValid =
    Number.isFinite(adjustmentAmountCents) && adjustmentAmountCents > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Adjust invoice</CardTitle>
          <CardDescription>
            Add penalties, fines, discounts, or manual corrections.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Void invoice</CardTitle>
          <CardDescription>
            Only unpaid invoices can be voided.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
