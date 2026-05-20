import { Button } from "@/components/ui/button";
import { FormActions, FormSection } from "@/components/forms/form-section";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";
import type { Database, Json } from "@/types/database.types";
import {
  assignStudentBedAction,
  createStudentAction,
  softDeleteStudentAction,
  updateStudentAction,
} from "@/modules/students/actions";

type StudentRow = Database["public"]["Tables"]["students"]["Row"];

type BranchOption = Pick<
  Database["public"]["Tables"]["hostel_branches"]["Row"],
  "id" | "name" | "slug"
>;

type RoomOption = Pick<
  Database["public"]["Tables"]["rooms"]["Row"],
  "hostel_branch_id" | "id" | "name" | "room_code"
>;

type BedOption = Pick<
  Database["public"]["Tables"]["room_beds"]["Row"],
  "bed_code" | "hostel_branch_id" | "id" | "room_id"
>;

type StudentFormProps = {
  beds: BedOption[];
  branches: BranchOption[];
  organizationId: string;
  rooms: RoomOption[];
  student?: StudentRow;
};

const selectClassName =
  "erp-control w-full";

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="text-sm font-medium leading-none text-foreground">
      {children}
    </span>
  );
}

function readJsonValue(value: Json, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const item = value[key];

  return typeof item === "string" ? item : "";
}

export function StudentForm({
  beds,
  branches,
  organizationId,
  rooms,
  student,
}: StudentFormProps) {
  const isEditing = Boolean(student);
  const action = isEditing ? updateStudentAction : createStudentAction;
  const selectedBranchId = student?.hostel_branch_id ?? branches[0]?.id ?? "";

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-5">
        <input name="organizationId" type="hidden" value={organizationId} />
        {student ? <input name="studentId" type="hidden" value={student.id} /> : null}

        <FormSection
          description="Core admission details used across room allocation, billing, attendance, and student portal access."
          id="status"
          title="Student identity"
        >
          <label className="space-y-2">
            <FieldLabel>First name</FieldLabel>
            <Input defaultValue={student?.first_name} name="firstName" required />
          </label>
          <label className="space-y-2">
            <FieldLabel>Last name</FieldLabel>
            <Input defaultValue={student?.last_name} name="lastName" required />
          </label>
          <label className="space-y-2">
            <FieldLabel>Hostel branch</FieldLabel>
            <select
              className={selectClassName}
              defaultValue={selectedBranchId}
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
            <FieldLabel>Status</FieldLabel>
            <select
              className={selectClassName}
              defaultValue={student?.status ?? "active"}
              name="status"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="space-y-2">
            <FieldLabel>Email</FieldLabel>
            <Input defaultValue={student?.email ?? ""} name="email" type="email" />
          </label>
          <label className="space-y-2">
            <FieldLabel>Phone</FieldLabel>
            <Input defaultValue={student?.phone ?? ""} name="phone" />
          </label>
          <label className="space-y-2">
            <FieldLabel>Date of birth</FieldLabel>
            <Input
              defaultValue={student?.date_of_birth ?? ""}
              name="dateOfBirth"
              type="date"
            />
          </label>
          <label className="space-y-2">
            <FieldLabel>Admission date</FieldLabel>
            <Input
              defaultValue={
                student?.admission_date ?? new Date().toISOString().slice(0, 10)
              }
              name="admissionDate"
              required
              type="date"
            />
          </label>
          <label className="space-y-2">
            <FieldLabel>Gender</FieldLabel>
            <select
              className={selectClassName}
              defaultValue={student?.gender ?? ""}
              name="gender"
            >
              <option value="">Not specified</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non_binary">Non binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </label>
        </FormSection>

        <FormSection
          description="Guardian and emergency details help staff respond quickly during daily hostel operations."
          title="Guardian and emergency contacts"
        >
          <label className="space-y-2">
            <FieldLabel>Guardian name</FieldLabel>
            <Input
              defaultValue={readJsonValue(student?.guardian_info ?? {}, "name")}
              name="guardianName"
            />
          </label>
          <label className="space-y-2">
            <FieldLabel>Guardian phone</FieldLabel>
            <Input
              defaultValue={readJsonValue(student?.guardian_info ?? {}, "phone")}
              name="guardianPhone"
            />
          </label>
          <label className="space-y-2">
            <FieldLabel>Guardian email</FieldLabel>
            <Input
              defaultValue={readJsonValue(student?.guardian_info ?? {}, "email")}
              name="guardianEmail"
              type="email"
            />
          </label>
          <label className="space-y-2">
            <FieldLabel>Emergency contact</FieldLabel>
            <Input
              defaultValue={readJsonValue(student?.emergency_contact ?? {}, "name")}
              name="emergencyContactName"
            />
          </label>
          <label className="space-y-2">
            <FieldLabel>Emergency phone</FieldLabel>
            <Input
              defaultValue={readJsonValue(student?.emergency_contact ?? {}, "phone")}
              name="emergencyContactPhone"
            />
          </label>
        </FormSection>

        {!isEditing ? (
          <FormSection
            description="Assignment is optional during admission; admins can assign or move beds later from the student profile."
            title="Initial room assignment"
          >
            <label className="space-y-2">
              <FieldLabel>Room</FieldLabel>
              <select
                className={selectClassName}
                name="roomId"
              >
                <option value="">Assign later</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_code} - {room.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <FieldLabel>Bed</FieldLabel>
              <select
                className={selectClassName}
                name="bedId"
              >
                <option value="">Assign later</option>
                {beds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.bed_code}
                  </option>
                ))}
              </select>
            </label>
          </FormSection>
        ) : null}

        <FormActions>
          <Button type="submit">
            {isEditing ? "Save student" : "Create student"}
          </Button>
        </FormActions>
      </form>
      {student ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            description="Move the student into an available bed in their branch."
            id="assign-bed"
            title="Assign room and bed"
          >
              <form action={assignStudentBedAction} className="space-y-4">
                <input name="studentId" type="hidden" value={student.id} />
                <input name="organizationId" type="hidden" value={organizationId} />
                <input
                  name="hostelBranchId"
                  type="hidden"
                  value={student.hostel_branch_id}
                />
                <label className="block space-y-2">
                  <FieldLabel>Room</FieldLabel>
                  <select className={selectClassName} name="roomId">
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.room_code} - {room.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2">
                  <FieldLabel>Bed</FieldLabel>
                  <select className={selectClassName} name="bedId">
                    {beds.map((bed) => (
                      <option key={bed.id} value={bed.id}>
                        {bed.bed_code}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" variant="outline">
                  Assign bed
                </Button>
              </form>
          </SectionCard>
          <SectionCard
            description="Soft delete keeps audit and billing history intact."
            title="Archive student"
          >
              <form action={softDeleteStudentAction} className="space-y-4">
                <input name="studentId" type="hidden" value={student.id} />
                <input name="organizationId" type="hidden" value={organizationId} />
                <input
                  name="hostelBranchId"
                  type="hidden"
                  value={student.hostel_branch_id}
                />
                <Button type="submit" variant="destructive">
                  Soft delete
                </Button>
              </form>
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
