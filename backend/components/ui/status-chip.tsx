import { Badge, type BadgeProps } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, BadgeProps["variant"]> = {
  active: "success",
  approved: "success",
  available: "success",
  completed: "success",
  delivered: "success",
  paid: "success",
  pending: "warning",
  partially_paid: "warning",
  queued: "warning",
  running: "info",
  overdue: "critical",
  rejected: "critical",
  failed: "critical",
  void: "muted",
  inactive: "muted",
};

type StatusChipProps = {
  status: string;
};

export function StatusChip({ status }: StatusChipProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
