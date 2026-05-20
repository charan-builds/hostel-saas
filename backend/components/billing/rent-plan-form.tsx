import { Button } from "@/components/ui/button";
import { FormActions, FormSection } from "@/components/forms/form-section";
import { createRentPlanAction } from "@/modules/billing/actions";
import type { RentPlan } from "@/modules/billing/billing.service";

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
};

type RoomOption = {
  hostel_branch_id: string;
  id: string;
  name: string;
  organization_id: string;
  room_code: string;
  status: string;
};

type BedOption = {
  bed_code: string;
  hostel_branch_id: string;
  id: string;
  organization_id: string;
  room_id: string;
  status: string;
};

type RentPlanFormProps = {
  beds: BedOption[];
  branches: BranchOption[];
  organizationId: string;
  rentPlans: RentPlan[];
  rooms: RoomOption[];
  students: StudentOption[];
};

const fieldClassName =
  "erp-control w-full";

export function RentPlanForm({
  beds,
  branches,
  organizationId,
  rentPlans,
  rooms,
  students,
}: RentPlanFormProps) {
  return (
    <form
      action={createRentPlanAction}
      className="space-y-5"
    >
      <input name="organizationId" type="hidden" value={organizationId} />
      <FormSection
        description="Define which branch, room, bed, or student this rent rule applies to."
        title="Plan scope"
      >
        <label className="space-y-2">
          <span className="text-sm font-medium">Branch</span>
          <select
            className={fieldClassName}
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
          <span className="text-sm font-medium">Plan code</span>
          <input
            className={fieldClassName}
            name="code"
            placeholder="BRANCH-MONTHLY"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Scope</span>
          <select
            className={fieldClassName}
            name="scopeType"
          >
            <option value="branch">Branch default</option>
            <option value="room">Room</option>
            <option value="bed">Bed</option>
            <option value="student">Student</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Status</span>
          <select
            className={fieldClassName}
            name="status"
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Room</span>
          <select
            className={fieldClassName}
            name="roomId"
          >
            <option value="">Not scoped to a room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.room_code} - {room.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Bed</span>
          <select
            className={fieldClassName}
            name="bedId"
          >
            <option value="">Not scoped to a bed</option>
            {beds.map((bed) => (
              <option key={bed.id} value={bed.id}>
                {bed.bed_code} - {bed.status}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Student</span>
          <select
            className={fieldClassName}
            name="studentId"
          >
            <option value="">Not scoped to a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.student_code} - {student.first_name} {student.last_name}
              </option>
            ))}
          </select>
        </label>
      </FormSection>

      <FormSection
        description="Use stable codes and clear names so monthly invoice generation remains easy to audit."
        title="Plan details"
      >
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Plan name</span>
          <input
            className={fieldClassName}
            name="name"
            placeholder="Monthly hostel rent"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Monthly amount</span>
          <input
            className={fieldClassName}
            min={0}
            name="amountCents"
            placeholder="120000"
            required
            type="number"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Currency</span>
          <input
            className={fieldClassName}
            defaultValue="INR"
            maxLength={3}
            name="currencyCode"
          />
        </label>
      </FormSection>

      <FormSection
        description="Controls when invoices become due and how long this rent rule remains active."
        title="Billing schedule"
      >
        <label className="space-y-2">
          <span className="text-sm font-medium">Due day</span>
          <input
            className={fieldClassName}
            defaultValue={5}
            max={28}
            min={1}
            name="dueDay"
            type="number"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Monthly discount</span>
          <input
            className={fieldClassName}
            defaultValue={0}
            min={0}
            name="monthlyDiscountCents"
            type="number"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Starts on</span>
          <input
            className={fieldClassName}
            defaultValue={new Date().toISOString().slice(0, 10)}
            name="startsOn"
            type="date"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Ends on</span>
          <input
            className={fieldClassName}
            name="endsOn"
            type="date"
          />
        </label>
      </FormSection>
      <div className="rounded-md border border-border bg-muted/50 p-4">
        <p className="text-sm font-medium">Existing plans</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {rentPlans.length} active or historical plan records in this tenant scope.
        </p>
      </div>
      <FormActions>
        <Button type="submit">Create rent plan</Button>
      </FormActions>
    </form>
  );
}
