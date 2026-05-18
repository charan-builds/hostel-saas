import { PaymentCollectionForm } from "@/components/billing/quick-payment-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BillingInvoice } from "@/modules/billing/billing.service";

type PaymentFormProps = {
  invoice: BillingInvoice;
  studentLabel?: string;
};

export function PaymentForm({ invoice, studentLabel = "Selected invoice" }: PaymentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Record payment</CardTitle>
        <CardDescription>
          Partial and full payments use the protected idempotent payment workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
