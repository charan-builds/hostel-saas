import { createLeaveRequestAction } from "@/modules/presence/actions";

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

type LeaveRequestFormProps = {
  branches: BranchOption[];
  organizationId: string;
  students: StudentOption[];
};

export function LeaveRequestForm({
  branches,
  organizationId,
  students,
}: LeaveRequestFormProps) {
  const disabled = branches.length === 0 || students.length === 0;

  return (
    <form
      action={createLeaveRequestAction}
      className="space-y-4 rounded border border-slate-200 bg-white p-5"
    >
      <input name="organizationId" type="hidden" value={organizationId} />
      <div>
        <p className="font-medium">Request leave</p>
        <p className="mt-1 text-sm text-slate-600">
          Leave requests notify admins for approval.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Branch</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
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
          <span className="text-sm font-medium">Type</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="leaveType"
          >
            <option value="personal">personal</option>
            <option value="home_visit">home visit</option>
            <option value="medical">medical</option>
            <option value="emergency">emergency</option>
            <option value="academic">academic</option>
            <option value="other">other</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Contact phone</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="contactPhone"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Starts at</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="startsAt"
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
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Destination</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="destinationAddress"
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Reason</span>
          <textarea
            className="min-h-24 w-full rounded border border-slate-300 px-3 py-2"
            disabled={disabled}
            name="reason"
            required
          />
        </label>
      </div>
      <button
        className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={disabled}
        type="submit"
      >
        Submit request
      </button>
    </form>
  );
}
