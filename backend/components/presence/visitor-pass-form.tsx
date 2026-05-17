import { createVisitorPassAction } from "@/modules/presence/actions";

type BranchOption = {
  id: string;
  name: string;
  slug: string;
};

type StudentOption = {
  first_name: string;
  hostel_branch_id: string;
  id: string;
  last_name: string;
  organization_id: string;
  status: string;
  student_code: string;
  user_profile_id: string | null;
};

type VisitorPassFormProps = {
  allowUnlinkedVisitors: boolean;
  branches: BranchOption[];
  defaultBranchId: string;
  organizationId: string;
  students: StudentOption[];
};

export function VisitorPassForm({
  allowUnlinkedVisitors,
  branches,
  defaultBranchId,
  organizationId,
  students,
}: VisitorPassFormProps) {
  const disabled = branches.length === 0;

  return (
    <form
      action={createVisitorPassAction}
      className="space-y-4 rounded border border-slate-200 bg-white p-5"
    >
      <input name="organizationId" type="hidden" value={organizationId} />
      <div>
        <p className="font-medium">Visitor pass</p>
        <p className="mt-1 text-sm text-slate-600">
          Visitor approvals share the same tenant-safe workflow layer.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Branch</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={defaultBranchId}
            disabled={disabled}
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
        <label className="space-y-1">
          <span className="text-sm font-medium">Linked student</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            required={!allowUnlinkedVisitors}
            name="studentId"
          >
            {allowUnlinkedVisitors ? <option value="">No student</option> : null}
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.student_code} - {student.first_name} {student.last_name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Visitor name</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="visitorName"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Visitor phone</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="visitorPhone"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Relationship</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="relationship"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Scheduled at</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="scheduledAt"
            type="datetime-local"
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Visit reason</span>
          <textarea
            className="min-h-20 w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="visitReason"
            required
          />
        </label>
      </div>
      <button
        className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={disabled}
        type="submit"
      >
        Request visitor pass
      </button>
    </form>
  );
}
