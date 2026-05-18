import Link from "next/link";

import { RentPlanForm } from "@/components/billing/rent-plan-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { getBillingFormOptions } from "@/modules/billing/billing.service";

export default async function NewRentPlanPage() {
  await requireTenantPageAccess({
    permission: "billing:manage",
    product: "hostel_erp",
  });
  const options = await getBillingFormOptions();

  return (
    <section className="space-y-6">
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link href="/billing">Back to billing</Link>
          </Button>
        }
        description="Create branch, room, bed, or student-specific rent rules for monthly invoice generation."
        eyebrow="Billing setup"
        title="Create rent plan"
      />
      <RentPlanForm
        beds={options.beds}
        branches={options.branches}
        organizationId={options.organizationId}
        rentPlans={options.rentPlans}
        rooms={options.rooms}
        students={options.students}
      />
    </section>
  );
}
