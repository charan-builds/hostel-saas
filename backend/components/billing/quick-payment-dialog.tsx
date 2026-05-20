"use client";

import { useRef, useState } from "react";
import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { recordInvoicePaymentAction } from "@/modules/billing/actions";
import { formatCurrency } from "@/lib/utils";

type PaymentInvoice = {
  balanceCents: number;
  currencyCode: string;
  id: string;
  invoiceNumber: string;
  status: string;
  studentLabel: string;
};

type PaymentCollectionFormProps = {
  invoice: PaymentInvoice;
  onCancel?: () => void;
  submitLabel?: string;
};

const selectClassName =
  "erp-control w-full";

const textAreaClassName =
  "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function formatDecimalAmount(cents: number) {
  return (cents / 100).toFixed(2).replace(/\.00$/, "");
}

function makeIdempotencyKey(invoiceId: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${invoiceId}-${Date.now()}`;
}

export function PaymentCollectionForm({
  invoice,
  onCancel,
  submitLabel = "Confirm collection",
}: PaymentCollectionFormProps) {
  const canPay = invoice.status !== "void" && invoice.balanceCents > 0;
  const [amount, setAmount] = useState(formatDecimalAmount(invoice.balanceCents));
  const idempotencyKeyRef = useRef<HTMLInputElement | null>(null);
  const amountCents = Math.round(Number(amount || 0) * 100);
  const amountValid =
    Number.isFinite(amountCents) && amountCents > 0 && amountCents <= invoice.balanceCents;
  const remainingAfterPayment = amountValid ? invoice.balanceCents - amountCents : invoice.balanceCents;

  return (
    <form
      action={recordInvoicePaymentAction}
      className="space-y-4"
      onSubmit={() => {
        if (idempotencyKeyRef.current && !idempotencyKeyRef.current.value) {
          idempotencyKeyRef.current.value = makeIdempotencyKey(invoice.id);
        }
      }}
    >
      <input name="invoiceId" type="hidden" value={invoice.id} />
      <input name="idempotencyKey" ref={idempotencyKeyRef} type="hidden" />
      <input name="amountCents" type="hidden" value={amountValid ? amountCents : 0} />
      <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">{invoice.invoiceNumber}</p>
            <p className="mt-1 truncate text-muted-foreground">{invoice.studentLabel}</p>
          </div>
          <p className="shrink-0 font-semibold">
            {formatCurrency(invoice.balanceCents, invoice.currencyCode)}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-background/70 p-2">
          <div>
            <p className="text-xs text-muted-foreground">Recording now</p>
            <p className="font-semibold">
              {formatCurrency(amountValid ? amountCents : 0, invoice.currencyCode)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="font-semibold">
              {formatCurrency(remainingAfterPayment, invoice.currencyCode)}
            </p>
          </div>
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Amount</span>
        <Input
          disabled={!canPay}
          inputMode="decimal"
          max={invoice.balanceCents / 100}
          min={0.01}
          onChange={(event) => setAmount(event.target.value)}
          step="0.01"
          type="number"
          value={amount}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Payment method</span>
        <select className={selectClassName} disabled={!canPay} name="paymentMethod">
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="card">Card</option>
          <option value="cashfree">Cashfree</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Received at</span>
        <Input
          defaultValue={new Date().toISOString().slice(0, 16)}
          disabled={!canPay}
          name="receivedAt"
          suppressHydrationWarning
          type="datetime-local"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Reference</span>
        <Input
          disabled={!canPay}
          name="providerReference"
          placeholder="UPI, bank, card, or receipt reference"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Notes</span>
        <textarea className={textAreaClassName} disabled={!canPay} name="notes" />
      </label>

      {!amountValid && canPay ? (
        <p aria-live="polite" className="text-sm font-medium text-destructive">
          Enter an amount up to the outstanding balance.
        </p>
      ) : null}
      {!canPay ? (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          This invoice is not currently payable.
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
        ) : null}
        <Button disabled={!canPay || !amountValid} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function QuickPaymentDialog({ invoice }: { invoice: PaymentInvoice }) {
  const [open, setOpen] = useState(false);
  const canPay = invoice.status !== "void" && invoice.balanceCents > 0;

  return (
    <>
      <Button
        disabled={!canPay}
        onClick={() => setOpen(true)}
        size="sm"
        variant={canPay ? "default" : "outline"}
      >
        <CreditCard aria-hidden="true" />
        {canPay ? "Collect" : "Paid"}
      </Button>
      <Dialog
        description="Record a verified rent payment. The idempotency key protects against duplicate submissions."
        onOpenChange={setOpen}
        open={open}
        title="Collect rent"
      >
        <PaymentCollectionForm
          invoice={invoice}
          onCancel={() => setOpen(false)}
          submitLabel="Record payment"
        />
      </Dialog>
    </>
  );
}
