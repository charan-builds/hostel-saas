import { createGatePassAction } from "@/modules/presence/actions";

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

type GatePassFormProps = {
  branches: BranchOption[];
  defaultBranchId: string;
  organizationId: string;
  students: StudentOption[];
};

export function GatePassForm({
  branches,
  defaultBranchId,
  organizationId,
  students,
}: GatePassFormProps) {
  const disabled = branches.length === 0 || students.length === 0;

  return (
    <form
      action={createGatePassAction}
      className="space-y-4 rounded border border-slate-200 bg-white p-5"
    >
      <input name="organizationId" type="hidden" value={organizationId} />
      <div>
        <p className="font-medium">Create gate pass</p>
        <p className="mt-1 text-sm text-slate-600">
          Gate passes track exit, return, and late entry history.
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
          <span className="text-sm font-medium">Student</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="studentId"
            required
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.student_code} - {student.first_name} {student.last_name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Expected exit</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="expectedExitAt"
            required
            type="datetime-local"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Expected return</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="expectedReturnAt"
            required
            type="datetime-local"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Destination</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="destination"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Contact phone</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="contactPhone"
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Purpose</span>
          <textarea
            className="min-h-20 w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="purpose"
            required
          />
        </label>
      </div>
      <button
        className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={disabled}
        type="submit"
      >
        Request pass
      </button>
    </form>
  );
}
