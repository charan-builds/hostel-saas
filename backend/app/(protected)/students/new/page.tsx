import { StudentForm } from "@/components/students/student-form";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { getStudentFormOptions } from "@/modules/students/students.service";

export default async function NewStudentPage() {
  await requireTenantPageAccess({
    permission: "student:manage",
    product: "hostel_erp",
  });
  const options = await getStudentFormOptions();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Students</p>
        <h2 className="text-2xl font-semibold">Create student</h2>
      </div>
      <StudentForm
        beds={options.beds}
        branches={options.branches}
        organizationId={options.organizationId}
        rooms={options.rooms}
      />
    </section>
  );
}
