import { StudentDocumentUploadForm } from "@/components/students/student-document-upload-form";
import { StudentForm } from "@/components/students/student-form";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { getStudent, getStudentFormOptions } from "@/modules/students/students.service";

type EditStudentPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  await requireTenantPageAccess({
    permission: "student:manage",
    product: "hostel_erp",
  });
  const { studentId } = await params;
  const [student, options] = await Promise.all([
    getStudent(studentId),
    getStudentFormOptions(),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">
          {student.student_code}
        </p>
        <h2 className="text-2xl font-semibold">
          Edit {student.first_name} {student.last_name}
        </h2>
      </div>
      <StudentForm
        beds={options.beds}
        branches={options.branches}
        organizationId={student.organization_id}
        rooms={options.rooms}
        student={student}
      />
      <StudentDocumentUploadForm studentId={student.id} />
    </section>
  );
}
