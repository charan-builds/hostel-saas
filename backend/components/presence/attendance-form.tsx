import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/forms/form-section";
import { SectionCard } from "@/components/ui/section-card";
import { markAttendanceAction } from "@/modules/presence/actions";

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

type AttendanceFormProps = {
  branches: BranchOption[];
  defaultAttendanceDate: string;
  defaultBranchId: string;
  organizationId: string;
  students: StudentOption[];
};

const fieldClassName =
  "erp-control w-full";

const textAreaClassName =
  "erp-control min-h-20 w-full";

export function AttendanceForm({
  branches,
  defaultAttendanceDate,
  defaultBranchId,
  organizationId,
  students,
}: AttendanceFormProps) {
  const disabled = branches.length === 0 || students.length === 0;

  return (
    <SectionCard
      contentClassName="space-y-4"
      description="Use this quick form for daily manual corrections and hostel-floor verification."
      title="Mark daily attendance"
    >
      <form action={markAttendanceAction} className="space-y-4">
        <input name="organizationId" type="hidden" value={organizationId} />
        {disabled ? (
          <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-muted-foreground">
            Add at least one active branch and student before marking attendance.
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Branch</span>
            <select
              className={fieldClassName}
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
          <label className="space-y-2">
            <span className="text-sm font-medium">Date</span>
            <input
              className={fieldClassName}
              defaultValue={defaultAttendanceDate}
              disabled={disabled}
              name="attendanceDate"
              required
              type="date"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Student</span>
            <select
              className={fieldClassName}
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
          <label className="space-y-2">
            <span className="text-sm font-medium">Status</span>
            <select
              className={fieldClassName}
              defaultValue="present"
              disabled={disabled}
              name="status"
              required
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On leave</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </label>
          <div className="rounded-md border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Daily rhythm</p>
            <p className="mt-1">
              Mark exceptions first, then use the present queue to complete the day.
            </p>
          </div>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Notes</span>
            <textarea
              className={textAreaClassName}
              disabled={disabled}
              name="notes"
              placeholder="Optional verification note"
            />
          </label>
        </div>
        <FormActions className="sm:px-0">
          <Button disabled={disabled} type="submit">
            Save attendance
          </Button>
        </FormActions>
      </form>
    </SectionCard>
  );
}
