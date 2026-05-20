import Link from "next/link";
import type { Json } from "@/types/database.types";
import {
  Activity,
  Building2,
  CheckCircle2,
  Globe2,
  Plus,
  ShieldCheck,
} from "lucide-react";

import {
  TenantControlTable,
  type TenantControlItem,
} from "@/components/admin/tenant-control-table";
import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { ActionToolbar } from "@/components/ui/action-toolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OrganizationRow = {
  created_at: string;
  id: string;
  metadata: Json;
  name: string;
  slug: string;
  status: string;
  updated_at: string;
};

type BranchRow = {
  id: string;
  organization_id: string;
  status: string;
};

type MembershipRow = {
  id: string;
  organization_id: string;
  role: string;
  status: string;
};

function metadataValue(metadata: Json, key: string, fallback: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return fallback;
  }

  const value = metadata[key];

  return typeof value === "string" && value.trim() ? value : fallback;
}

async function listTenantControlItems() {
  const supabase = await createSupabaseServerClient();
  const organizations = await supabase
    .from("organizations")
    .select("id,name,slug,status,metadata,created_at,updated_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (organizations.error) {
    throw organizations.error;
  }

  const organizationRows = (organizations.data ?? []) as OrganizationRow[];
  const organizationIds = organizationRows.map((organization) => organization.id);

  if (organizationIds.length === 0) {
    return [] satisfies TenantControlItem[];
  }

  const [branches, memberships] = await Promise.all([
    supabase
      .from("hostel_branches")
      .select("id,organization_id,status")
      .in("organization_id", organizationIds)
      .is("deleted_at", null),
    supabase
      .from("tenant_memberships")
      .select("id,organization_id,role,status")
      .in("organization_id", organizationIds)
      .is("deleted_at", null),
  ]);

  if (branches.error) {
    throw branches.error;
  }

  if (memberships.error) {
    throw memberships.error;
  }

  const branchRows = (branches.data ?? []) as BranchRow[];
  const membershipRows = (memberships.data ?? []) as MembershipRow[];

  return organizationRows.map((organization) => {
    const organizationBranches = branchRows.filter(
      (branch) => branch.organization_id === organization.id,
    );
    const organizationMemberships = membershipRows.filter(
      (membership) => membership.organization_id === organization.id,
    );

    return {
      activeBranchCount: organizationBranches.filter(
        (branch) => branch.status === "active",
      ).length,
      adminCount: organizationMemberships.filter(
        (membership) => membership.role === "admin" && membership.status === "active",
      ).length,
      branchCount: organizationBranches.length,
      createdAt: organization.created_at,
      id: organization.id,
      name: organization.name,
      planLabel: metadataValue(organization.metadata, "plan", "Foundation"),
      productLabel: metadataValue(organization.metadata, "product", "hostel_erp"),
      slug: organization.slug,
      status: organization.status,
      studentMemberCount: organizationMemberships.filter(
        (membership) => membership.role === "student" && membership.status === "active",
      ).length,
      updatedAt: organization.updated_at,
    } satisfies TenantControlItem;
  });
}

export default async function SuperAdminPage() {
  await requireTenantPageAccess({
    roles: ["superadmin"],
    product: "hostel_erp",
  });
  const tenants = await listTenantControlItems();
  const activeTenants = tenants.filter((tenant) => tenant.status === "active").length;
  const totalBranches = tenants.reduce((sum, tenant) => sum + tenant.branchCount, 0);
  const totalAdmins = tenants.reduce((sum, tenant) => sum + tenant.adminCount, 0);
  const tenantsWithoutAdmins = tenants.filter((tenant) => tenant.adminCount === 0).length;

  return (
    <ErpPage>
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/website">
                <Globe2 aria-hidden="true" />
                Website settings
              </Link>
            </Button>
            <Button asChild>
              <Link href="/super-admin/onboarding">
                <Plus aria-hidden="true" />
                Create tenant
              </Link>
            </Button>
          </>
        }
        description="Operate tenant onboarding, branch footprint, admin coverage, and SaaS setup readiness from one control center."
        eyebrow="Superadmin"
        title="SaaS control center"
      />

      <ErpPageGrid>
        <StatCard
          description="Organizations visible to this control plane"
          icon={Building2}
          label="Total tenants"
          tone="info"
          value={String(tenants.length)}
        />
        <StatCard
          description="Ready for daily operations"
          icon={CheckCircle2}
          label="Active tenants"
          tone="success"
          value={String(activeTenants)}
        />
        <StatCard
          description="Total hostel operating locations"
          icon={Globe2}
          label="Branches"
          value={String(totalBranches)}
        />
        <StatCard
          description={
            tenantsWithoutAdmins > 0
              ? `${tenantsWithoutAdmins} tenants need admin coverage`
              : "Every tenant has admin coverage"
          }
          icon={ShieldCheck}
          label="Tenant admins"
          tone={tenantsWithoutAdmins > 0 ? "warning" : "default"}
          value={String(totalAdmins)}
        />
      </ErpPageGrid>

      <ActionToolbar
        description="Create tenants, review admin coverage, then complete branch and public-site setup inside each tenant."
        title="SaaS operations workflow"
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/super-admin/onboarding">Start onboarding</Link>
          </Button>
        }
      >
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
          <span className="inline-flex items-center gap-1.5">
            <Activity className="size-4" aria-hidden="true" />
            Tenant health
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Admin coverage
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Globe2 className="size-4" aria-hidden="true" />
            Website readiness
          </span>
        </div>
      </ActionToolbar>

      <SectionCard
        contentClassName="space-y-4"
        description="Search tenants by name, slug, status, product, plan, branch footprint, or user coverage."
        title="Tenant management"
      >
        <TenantControlTable tenants={tenants} />
      </SectionCard>

      <SectionCard
        contentClassName="grid gap-4 md:grid-cols-3"
        description="These are UI readiness tracks for the SaaS layer; they do not change backend behavior."
        title="Control-center foundations"
      >
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="font-semibold">Subscription state</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Plan labels are surfaced from tenant metadata today and can later map to billing subscriptions.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="font-semibold">Domain readiness</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tenant detail pages now reserve a clean place for custom-domain and verification status.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="font-semibold">Public-site setup</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Website settings stay structured and reusable without introducing CMS complexity.
          </p>
        </div>
      </SectionCard>
    </ErpPage>
  );
}
