import { PaymentCollectionForm } from "@/components/billing/quick-payment-dialog";
import { SectionCard } from "@/components/ui/section-card";
import type { BillingInvoice } from "@/modules/billing/billing.service";

type PaymentFormProps = {
  invoice: BillingInvoice;
  studentLabel?: string;
};

export function PaymentForm({ invoice, studentLabel = "Selected invoice" }: PaymentFormProps) {
  return (
    <SectionCard
      description="Partial and full payments use the protected idempotent payment workflow."
      title="Record payment"
    >
        <PaymentCollectionForm
          invoice={{
            balanceCents: invoice.balance_cents,
            currencyCode: invoice.currency_code,
            id: invoice.id,
            invoiceNumber: invoice.invoice_number,
            status: invoice.status,
            studentLabel,
          }}
          submitLabel="Record payment"
        />
    </SectionCard>
  );
}
