import Link from "next/link";

import { ErpPage } from "@/components/layout/erp-page";
import { StudentDocumentUploadForm } from "@/components/students/student-document-upload-form";
import { StudentForm } from "@/components/students/student-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusChip } from "@/components/ui/status-chip";
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
    <ErpPage>
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/students/${student.id}`}>View profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/students">Back to students</Link>
            </Button>
          </>
        }
        description="Update profile, room assignment, and document records."
        eyebrow={student.student_code}
        meta={<StatusChip status={student.status} />}
        title={`Edit ${student.first_name} ${student.last_name}`}
      />
      <StudentForm
        beds={options.beds}
        branches={options.branches}
        organizationId={student.organization_id}
        rooms={options.rooms}
        student={student}
      />
      <div id="documents">
        <StudentDocumentUploadForm studentId={student.id} />
      </div>
    </ErpPage>
  );
}
