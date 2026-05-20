import type {
  BillingPayment,
  BillingReceipt,
} from "@/modules/billing/billing.service";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
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
    <SectionCard
      contentClassName="p-0"
      description="Receipts are listed from the latest collection record."
      title="Payment timeline"
    >
      <div className="divide-y divide-border">
        {receipts.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No receipts recorded yet.
          </p>
        ) : (
          receipts.map((receipt) => {
            const payment = paymentsById.get(receipt.payment_id);

            return (
              <div
                className="grid gap-3 p-5 text-sm md:grid-cols-[1.4fr_1fr_1fr_1.3fr]"
                key={receipt.id}
              >
                <div>
                  <p className="font-medium">{receipt.receipt_number}</p>
                  <p className="text-muted-foreground">
                    {formatDateTime(receipt.issued_at)}
                  </p>
                </div>
                <p className="text-base font-semibold">
                  {formatCurrency(receipt.amount_cents, receipt.currency_code)}
                </p>
                <div>
                  <p className="capitalize text-muted-foreground">
                    {(payment?.payment_method ?? "payment").replaceAll("_", " ")}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={payment?.status ?? "recorded"} />
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {payment?.provider_reference ?? "No external reference"}
                </p>
              </div>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}
