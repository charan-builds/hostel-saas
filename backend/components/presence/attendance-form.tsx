import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const textAreaClassName =
  "min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function AttendanceForm({
  branches,
  defaultAttendanceDate,
  defaultBranchId,
  organizationId,
  students,
}: AttendanceFormProps) {
  const disabled = branches.length === 0 || students.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark daily attendance</CardTitle>
        <CardDescription>
          Attendance follows active room and bed assignments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={markAttendanceAction} className="space-y-4">
          <input name="organizationId" type="hidden" value={organizationId} />
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
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Notes</span>
              <textarea
                className={textAreaClassName}
                disabled={disabled}
                name="notes"
              />
            </label>
          </div>
          <Button disabled={disabled} type="submit">
            Save attendance
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
