import { requireTenantPageAccess } from "@/lib/auth/page-guards";

export default async function AdminPage() {
  const context = await requireTenantPageAccess({
    permission: "membership:read",
    product: "hostel_erp",
  });

  return (
    <section className="space-y-3">
      <p className="text-sm font-medium text-slate-500">Admin</p>
      <h2 className="text-2xl font-semibold">Tenant administration</h2>
      <p className="max-w-2xl text-slate-600">
        This route is guarded by tenant membership and RBAC. Admins can manage
        users inside their organization, while superadmins can cross tenant
        boundaries through the same guard.
      </p>
      <p className="text-sm text-slate-500">
        Active organization: {context.organizationId ?? "global"}
      </p>
    </section>
  );
}
