import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2";

export function ReminderAutomationForm({
  branches,
  organizationId,
}: ReminderAutomationFormProps) {
  const defaultBranchId = branches[0]?.id ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing reminder automation</CardTitle>
        <CardDescription>
          Runs the same enqueue hook that a scheduled worker can call later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={enqueueBillingRemindersAction} className="space-y-4">
          <input name="organizationId" type="hidden" value={organizationId} />
          <div className="grid gap-3">
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
            <select className={selectClassName} name="reminderKind">
              <option value="overdue_payment_alert">Overdue payment alert</option>
              <option value="billing_reminder">Billing reminder</option>
            </select>
            <Input
              defaultValue={new Date().toISOString().slice(0, 10)}
              name="dueBefore"
              type="date"
            />
            <Button disabled={!defaultBranchId} type="submit">
              Enqueue reminders
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
