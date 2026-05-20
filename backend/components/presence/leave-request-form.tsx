import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/forms/form-section";
import { SectionCard } from "@/components/ui/section-card";
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

const fieldClassName =
  "erp-control w-full";

const textAreaClassName =
  "erp-control min-h-24 w-full";

export function LeaveRequestForm({
  branches,
  organizationId,
  students,
}: LeaveRequestFormProps) {
  const disabled = branches.length === 0 || students.length === 0;

  return (
    <SectionCard
      contentClassName="space-y-4"
      description="Capture the essentials admins need to approve, check out, and verify returns."
      title="Request leave"
    >
      <form action={createLeaveRequestAction} className="space-y-4">
        <input name="organizationId" type="hidden" value={organizationId} />
        {disabled ? (
          <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-muted-foreground">
            Add an active branch and student before creating a leave request.
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Branch</span>
            <select
              className={fieldClassName}
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
          <label className="space-y-2">
            <span className="text-sm font-medium">Student</span>
            <select
              className={fieldClassName}
              disabled={disabled}
              name="studentId"
              required
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.student_code} - {student.first_name}{" "}
                  {student.last_name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Type</span>
            <select
              className={fieldClassName}
              disabled={disabled}
              name="leaveType"
            >
              <option value="personal">Personal</option>
              <option value="home_visit">Home visit</option>
              <option value="medical">Medical</option>
              <option value="emergency">Emergency</option>
              <option value="academic">Academic</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Contact phone</span>
            <input
              className={fieldClassName}
              disabled={disabled}
              name="contactPhone"
              placeholder="Optional"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Starts at</span>
            <input
              className={fieldClassName}
              disabled={disabled}
              name="startsAt"
              required
              type="datetime-local"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Expected return</span>
            <input
              className={fieldClassName}
              disabled={disabled}
              name="expectedReturnAt"
              required
              type="datetime-local"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Destination</span>
            <input
              className={fieldClassName}
              disabled={disabled}
              name="destinationAddress"
              placeholder="Where the student is going"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Reason</span>
            <textarea
              className={textAreaClassName}
              disabled={disabled}
              name="reason"
              placeholder="Reason for leave"
              required
            />
          </label>
        </div>
        <FormActions className="sm:px-0">
          <Button disabled={disabled} type="submit">
            Submit request
          </Button>
        </FormActions>
      </form>
    </SectionCard>
  );
}
