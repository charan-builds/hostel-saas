import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import Link from "next/link";

export default async function SuperAdminPage() {
  await requireTenantPageAccess({
    roles: ["superadmin"],
    product: "hostel_erp",
  });

  return (
    <section className="space-y-3">
      <p className="text-sm font-medium text-slate-500">Superadmin</p>
      <h2 className="text-2xl font-semibold">Global control plane</h2>
      <p className="max-w-2xl text-slate-600">
        Superadmin access bypasses tenant membership checks intentionally, but
        all privileged operations should still write audit logs.
      </p>
      <Link
        className="inline-flex rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        href="/super-admin/onboarding"
      >
        Create tenant
      </Link>
    </section>
  );
}
