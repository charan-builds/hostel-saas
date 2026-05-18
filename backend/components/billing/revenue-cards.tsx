import {
  AlertTriangle,
  ReceiptText,
  WalletCards,
  TrendingUp,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import type { BillingSummary } from "@/modules/billing/billing.service";
import { formatCurrency } from "@/lib/utils";

type RevenueCardsProps = {
  summary: BillingSummary;
};

export function RevenueCards({ summary }: RevenueCardsProps) {
  const collectionRate =
    summary.totalCents > 0
      ? Math.round((summary.paidCents / summary.totalCents) * 100)
      : 0;
  const cards = [
    {
      description: "Total active invoice value",
      icon: ReceiptText,
      label: "Billed",
      value: formatCurrency(summary.totalCents, summary.currencyCode),
    },
    {
      description: `${collectionRate}% collection rate`,
      icon: TrendingUp,
      label: "Collected",
      tone: "success" as const,
      value: formatCurrency(summary.paidCents, summary.currencyCode),
    },
    {
      description: `${summary.pendingCount} pending invoices`,
      icon: WalletCards,
      label: "Dues",
      tone: summary.balanceCents > 0 ? ("warning" as const) : ("default" as const),
      value: formatCurrency(summary.balanceCents, summary.currencyCode),
    },
    {
      description: "Past due invoices",
      icon: AlertTriangle,
      label: "Overdue",
      tone: summary.overdueCount > 0 ? ("danger" as const) : ("default" as const),
      value: String(summary.overdueCount),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          description={card.description}
          icon={card.icon}
          key={card.label}
          label={card.label}
          {...("tone" in card ? { tone: card.tone } : {})}
          value={card.value}
        />
      ))}
    </div>
  );
}
