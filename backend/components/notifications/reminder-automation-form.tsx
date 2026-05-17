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

export function ReminderAutomationForm({
  branches,
  organizationId,
}: ReminderAutomationFormProps) {
  const defaultBranchId = branches[0]?.id ?? "";

  return (
    <form
      action={enqueueBillingRemindersAction}
      className="space-y-4 rounded border border-slate-200 bg-white p-5"
    >
      <input name="organizationId" type="hidden" value={organizationId} />
      <div>
        <p className="font-medium">Billing reminder automation</p>
        <p className="mt-1 text-sm text-slate-600">
          Runs the same enqueue hook that a scheduled worker can call later.
        </p>
      </div>
      <div className="grid gap-3">
        <select
          className="rounded border border-slate-300 px-3 py-2"
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
        <select
          className="rounded border border-slate-300 px-3 py-2"
          name="reminderKind"
        >
          <option value="overdue_payment_alert">overdue payment alert</option>
          <option value="billing_reminder">billing reminder</option>
        </select>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={new Date().toISOString().slice(0, 10)}
          name="dueBefore"
          type="date"
        />
        <button
          className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!defaultBranchId}
          type="submit"
        >
          Enqueue reminders
        </button>
      </div>
    </form>
  );
}
