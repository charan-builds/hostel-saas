import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";
import { enqueueBillingRemindersAction } from "@/modules/notifications/actions";

type BranchOption = {
  id: string;
  name: string;
  slug: string;
};

type ReminderAutomationFormProps = {
  branches: BranchOption[];
  organizationId: string;
};

const selectClassName =
  "erp-control w-full";

export function ReminderAutomationForm({
  branches,
  organizationId,
}: ReminderAutomationFormProps) {
  const defaultBranchId = branches[0]?.id ?? "";

  return (
    <SectionCard
      contentClassName="space-y-4"
      description="Runs the same enqueue hook that a scheduled worker can call later."
      title="Billing reminder automation"
    >
      <form action={enqueueBillingRemindersAction} className="space-y-4">
        <input name="organizationId" type="hidden" value={organizationId} />
        {!defaultBranchId ? (
          <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-muted-foreground">
            Add a branch before running reminder automation.
          </div>
        ) : null}
        <div className="grid gap-3">
          <label className="space-y-2">
            <span className="text-sm font-medium">Branch</span>
            <select
              className={selectClassName}
              defaultValue={defaultBranchId}
              disabled={!defaultBranchId}
              name="hostelBranchId"
              required
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Reminder type</span>
            <select className={selectClassName} name="reminderKind">
              <option value="overdue_payment_alert">Overdue payment alert</option>
              <option value="billing_reminder">Billing reminder</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Due before</span>
            <Input
              defaultValue={new Date().toISOString().slice(0, 10)}
              name="dueBefore"
              type="date"
            />
          </label>
          <Button disabled={!defaultBranchId} type="submit">
            Enqueue reminders
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
