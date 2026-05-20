import Link from "next/link";
import { Building2, Globe2, ShieldCheck, UsersRound } from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";

export default async function AdminPage() {
  const context = await requireTenantPageAccess({
    permission: "membership:read",
    product: "hostel_erp",
  });

  return (
    <ErpPage>
      <PageHeader
        actions={
          <Button asChild>
            <Link href="/admin/website">
              <Globe2 aria-hidden="true" />
              Website settings
            </Link>
          </Button>
        }
        description="Manage tenant-level setup, public-site readiness, staff access, and operating configuration."
        eyebrow="Admin"
        title="Tenant administration"
      />

      <ErpPageGrid>
        <StatCard
          description="Current active tenant context"
          icon={Building2}
          label="Organization"
          tone="info"
          value={context.organizationId ? "Active" : "Global"}
        />
        <StatCard
          description="Membership-guarded workspace"
          icon={ShieldCheck}
          label="RBAC"
          tone="success"
          value="Enabled"
        />
        <StatCard
          description="Tenant staff and user access"
          icon={UsersRound}
          label="Users"
          value="Managed"
        />
        <StatCard
          description="Branding and public content"
          icon={Globe2}
          label="Website"
          value="Configurable"
        />
      </ErpPageGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          description="This route is guarded by tenant membership and permission checks."
          title="Access model"
        >
          <p className="text-sm text-muted-foreground">
            Admins operate inside their organization, while superadmins can cross tenant boundaries through the same guard.
          </p>
        </SectionCard>
        <SectionCard
          description="Use these settings as the structured foundation for tenant public websites."
          title="Public website"
        >
          <Button asChild className="mt-2" variant="outline">
            <Link href="/admin/website">Configure website</Link>
          </Button>
        </SectionCard>
        <SectionCard
          description="Operational modules inherit the active organization and branch context."
          title="Tenant context"
        >
          <p className="break-all text-sm font-medium">
            {context.organizationId ?? "global"}
          </p>
        </SectionCard>
      </div>
    </ErpPage>
  );
}
