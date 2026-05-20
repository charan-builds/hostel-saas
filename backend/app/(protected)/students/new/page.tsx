import Link from "next/link";

import { ErpPage } from "@/components/layout/erp-page";
import { StudentForm } from "@/components/students/student-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { getStudentFormOptions } from "@/modules/students/students.service";

export default async function NewStudentPage() {
  await requireTenantPageAccess({
    permission: "student:manage",
    product: "hostel_erp",
  });
  const options = await getStudentFormOptions();

  return (
    <ErpPage>
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link href="/students">Back to students</Link>
          </Button>
        }
        description="Capture admission details, guardian contacts, and optional room or bed assignment in one flow."
        eyebrow="Students"
        title="Admit student"
      />
      <StudentForm
        beds={options.beds}
        branches={options.branches}
        organizationId={options.organizationId}
        rooms={options.rooms}
      />
    </ErpPage>
  );
}
