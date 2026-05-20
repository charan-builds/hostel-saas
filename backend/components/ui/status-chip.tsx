import { Badge, type BadgeProps } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, BadgeProps["variant"]> = {
  active: "success",
  approved: "success",
  available: "success",
  booked: "success",
  checked_in: "success",
  completed: "success",
  contacted: "info",
  converted: "success",
  delivered: "success",
  paid: "success",
  present: "success",
  published: "success",
  resolved: "success",
  returned: "success",
  interested: "info",
  new: "info",
  scheduled: "info",
  pending: "warning",
  partially_paid: "warning",
  queued: "warning",
  reserved: "warning",
  running: "info",
  checked_out: "info",
  maintenance: "warning",
  overdue: "critical",
  rejected: "critical",
  failed: "critical",
  absent: "critical",
  archived: "muted",
  cancelled: "muted",
  draft: "muted",
  expired: "muted",
  void: "muted",
  inactive: "muted",
  unavailable: "muted",
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
