import Link from "next/link";

import { RentPlanForm } from "@/components/billing/rent-plan-form";
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Billing setup</p>
          <h2 className="text-2xl font-semibold">Create rent plan</h2>
        </div>
        <Link
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
          href="/billing"
        >
          Back to billing
        </Link>
      </div>
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
