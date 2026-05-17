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
      <form
        action={action}
        className="grid gap-5 rounded border border-slate-200 bg-white p-6 md:grid-cols-2"
      >
        <input name="organizationId" type="hidden" value={organizationId} />
        {student ? <input name="studentId" type="hidden" value={student.id} /> : null}
        <label className="space-y-1">
          <span className="text-sm font-medium">First name</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={student?.first_name}
            name="firstName"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Last name</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={student?.last_name}
            name="lastName"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Hostel branch</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
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
        <label className="space-y-1">
          <span className="text-sm font-medium">Status</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={student?.status ?? "active"}
            name="status"
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={student?.email ?? ""}
            name="email"
            type="email"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Phone</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={student?.phone ?? ""}
            name="phone"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Date of birth</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={student?.date_of_birth ?? ""}
            name="dateOfBirth"
            type="date"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Admission date</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={
              student?.admission_date ?? new Date().toISOString().slice(0, 10)
            }
            name="admissionDate"
            required
            type="date"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Gender</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={student?.gender ?? ""}
            name="gender"
          >
            <option value="">Not specified</option>
            <option value="female">female</option>
            <option value="male">male</option>
            <option value="non_binary">non_binary</option>
            <option value="prefer_not_to_say">prefer_not_to_say</option>
          </select>
        </label>
        <div className="hidden md:block" />
        <label className="space-y-1">
          <span className="text-sm font-medium">Guardian name</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={readJsonValue(student?.guardian_info ?? {}, "name")}
            name="guardianName"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Guardian phone</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={readJsonValue(student?.guardian_info ?? {}, "phone")}
            name="guardianPhone"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Guardian email</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={readJsonValue(student?.guardian_info ?? {}, "email")}
            name="guardianEmail"
            type="email"
          />
        </label>
        <div className="hidden md:block" />
        <label className="space-y-1">
          <span className="text-sm font-medium">Emergency contact</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={readJsonValue(student?.emergency_contact ?? {}, "name")}
            name="emergencyContactName"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Emergency phone</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={readJsonValue(student?.emergency_contact ?? {}, "phone")}
            name="emergencyContactPhone"
          />
        </label>
        {!isEditing ? (
          <>
            <label className="space-y-1">
              <span className="text-sm font-medium">Room</span>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
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
            <label className="space-y-1">
              <span className="text-sm font-medium">Bed</span>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
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
          </>
        ) : null}
        <div className="md:col-span-2">
          <button
            className="rounded bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
            type="submit"
          >
            {isEditing ? "Save student" : "Create student"}
          </button>
        </div>
      </form>
      {student ? (
        <div className="grid gap-6 rounded border border-slate-200 bg-white p-6 md:grid-cols-2">
          <form action={assignStudentBedAction} className="space-y-4">
            <input name="studentId" type="hidden" value={student.id} />
            <input name="organizationId" type="hidden" value={organizationId} />
            <input
              name="hostelBranchId"
              type="hidden"
              value={student.hostel_branch_id}
            />
            <h3 className="font-semibold">Assign room and bed</h3>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Room</span>
              <select className="w-full rounded border border-slate-300 px-3 py-2" name="roomId">
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_code} - {room.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Bed</span>
              <select className="w-full rounded border border-slate-300 px-3 py-2" name="bedId">
                {beds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.bed_code}
                  </option>
                ))}
              </select>
            </label>
            <button className="rounded border border-slate-300 px-4 py-2 font-medium" type="submit">
              Assign bed
            </button>
          </form>
          <form action={softDeleteStudentAction} className="space-y-4">
            <input name="studentId" type="hidden" value={student.id} />
            <input name="organizationId" type="hidden" value={organizationId} />
            <input
              name="hostelBranchId"
              type="hidden"
              value={student.hostel_branch_id}
            />
            <h3 className="font-semibold">Archive student</h3>
            <button
              className="rounded border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50"
              type="submit"
            >
              Soft delete
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
