import type { BillingSummary } from "@/modules/billing/billing.service";

type RevenueCardsProps = {
  summary: BillingSummary;
};

function formatMoney(cents: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

export function RevenueCards({ summary }: RevenueCardsProps) {
  const cards = [
    {
      label: "Billed",
      value: formatMoney(summary.totalCents, summary.currencyCode),
    },
    {
      label: "Collected",
      value: formatMoney(summary.paidCents, summary.currencyCode),
    },
    {
      label: "Dues",
      value: formatMoney(summary.balanceCents, summary.currencyCode),
    },
    {
      label: "Overdue",
      value: String(summary.overdueCount),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <div className="rounded border border-slate-200 bg-white p-4" key={card.label}>
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
