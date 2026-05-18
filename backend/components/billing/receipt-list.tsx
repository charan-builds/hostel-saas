import type {
  BillingPayment,
  BillingReceipt,
} from "@/modules/billing/billing.service";
import { formatCurrency } from "@/lib/utils";

type ReceiptListProps = {
  payments: BillingPayment[];
  receipts: BillingReceipt[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ReceiptList({ payments, receipts }: ReceiptListProps) {
  const paymentsById = new Map(payments.map((payment) => [payment.id, payment]));

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <div className="border-b border-border p-4">
        <p className="font-semibold">Payment timeline</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Receipts are listed from the latest collection record.
        </p>
      </div>
      <div className="divide-y divide-border">
        {receipts.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No receipts recorded yet.
          </p>
        ) : (
          receipts.map((receipt) => {
            const payment = paymentsById.get(receipt.payment_id);

            return (
              <div className="grid gap-2 p-4 text-sm md:grid-cols-4" key={receipt.id}>
                <div>
                  <p className="font-medium">{receipt.receipt_number}</p>
                  <p className="text-muted-foreground">
                    {formatDateTime(receipt.issued_at)}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCurrency(receipt.amount_cents, receipt.currency_code)}
                </p>
                <p className="text-muted-foreground">
                  {payment?.payment_method ?? "payment"} -{" "}
                  {payment?.status ?? "recorded"}
                </p>
                <p className="text-muted-foreground">
                  {payment?.provider_reference ?? "No external reference"}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
