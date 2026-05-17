import type {
  BillingPayment,
  BillingReceipt,
} from "@/modules/billing/billing.service";

type ReceiptListProps = {
  payments: BillingPayment[];
  receipts: BillingReceipt[];
};

function formatMoney(cents: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

export function ReceiptList({ payments, receipts }: ReceiptListProps) {
  const paymentsById = new Map(payments.map((payment) => [payment.id, payment]));

  return (
    <div className="rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <p className="font-medium">Receipts</p>
      </div>
      <div className="divide-y divide-slate-200">
        {receipts.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No receipts recorded yet.</p>
        ) : (
          receipts.map((receipt) => {
            const payment = paymentsById.get(receipt.payment_id);

            return (
              <div className="grid gap-2 p-4 text-sm md:grid-cols-4" key={receipt.id}>
                <div>
                  <p className="font-medium">{receipt.receipt_number}</p>
                  <p className="text-slate-500">{receipt.issued_at}</p>
                </div>
                <p className="text-slate-600">
                  {formatMoney(receipt.amount_cents, receipt.currency_code)}
                </p>
                <p className="text-slate-600">
                  {payment?.payment_method ?? "payment"} -{" "}
                  {payment?.status ?? "recorded"}
                </p>
                <p className="text-slate-600">
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
