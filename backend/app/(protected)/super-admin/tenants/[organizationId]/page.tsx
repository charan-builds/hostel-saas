import Link from "next/link";
import { notFound } from "next/navigation";
import type { Json } from "@/types/database.types";
import {
  Building2,
  Globe2,
  MapPinned,
  Palette,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TenantDetailPageProps = {
  params: Promise<{
    organizationId: string;
  }>;
};

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
  name: string;
  slug: string;
  status: string;
  timezone: string;
  updated_at: string;
};

type MembershipRow = {
  id: string;
  role: string;
  status: string;
  updated_at: string;
};

function metadataValue(metadata: Json, key: string, fallback: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return fallback;
  }

  const value = metadata[key];

  return typeof value === "string" && value.trim() ? value : fallback;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function getTenantDetail(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const [organization, branches, memberships] = await Promise.all([
    supabase
      .from("organizations")
      .select("id,name,slug,status,metadata,created_at,updated_at")
      .eq("id", organizationId)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("hostel_branches")
      .select("id,name,slug,status,timezone,updated_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("tenant_memberships")
      .select("id,role,status,updated_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
  ]);

  if (organization.error) {
    throw organization.error;
  }

  if (!organization.data) {
    notFound();
  }

  if (branches.error) {
    throw branches.error;
  }

  if (memberships.error) {
    throw memberships.error;
  }

  return {
    branches: (branches.data ?? []) as BranchRow[],
    memberships: (memberships.data ?? []) as MembershipRow[],
    organization: organization.data as OrganizationRow,
  };
}

export default async function TenantDetailPage({
  params,
}: TenantDetailPageProps) {
  await requireTenantPageAccess({
    roles: ["superadmin"],
    product: "hostel_erp",
  });
  const { organizationId } = await params;
  const { branches, memberships, organization } = await getTenantDetail(
    organizationId,
  );
  const activeBranches = branches.filter((branch) => branch.status === "active");
  const admins = memberships.filter(
    (membership) => membership.role === "admin" && membership.status === "active",
  );
  const students = memberships.filter(
    (membership) => membership.role === "student" && membership.status === "active",
  );
  const planLabel = metadataValue(organization.metadata, "plan", "Foundation");
  const productLabel = metadataValue(organization.metadata, "product", "hostel_erp");

  return (
    <ErpPage>
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/super-admin">Back to tenants</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/website">Website settings</Link>
            </Button>
          </>
        }
        description="Review tenant footprint, branch structure, admin coverage, public-site readiness, and SaaS setup state."
        eyebrow="Tenant detail"
        meta={<StatusBadge status={organization.status} />}
        title={organization.name}
      />

      <ErpPageGrid>
        <StatCard
          description="Tenant operating locations"
          icon={Building2}
          label="Branches"
          tone="info"
          value={String(branches.length)}
        />
        <StatCard
          description="Ready for operations"
          icon={MapPinned}
          label="Active branches"
          tone="success"
          value={String(activeBranches.length)}
        />
        <StatCard
          description="Administrative access"
          icon={ShieldCheck}
          label="Admins"
          tone={admins.length > 0 ? "default" : "warning"}
          value={String(admins.length)}
        />
        <StatCard
          description="Student portal users"
          icon={UsersRound}
          label="Student users"
          value={String(students.length)}
        />
      </ErpPageGrid>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SectionCard
            contentClassName="grid gap-4 md:grid-cols-2"
            description="Core organization fields used by the shared SaaS architecture."
            title="Organization information"
          >
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Slug</p>
              <p className="mt-1 font-semibold">{organization.slug}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Product</p>
              <p className="mt-1 font-semibold">{productLabel}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="mt-1 font-semibold">{formatDate(organization.created_at)}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p className="mt-1 font-semibold">{formatDate(organization.updated_at)}</p>
            </div>
          </SectionCard>

          <SectionCard
            contentClassName="space-y-3"
            description="Branch-level operational footprint for this tenant."
            title="Branch structure"
          >
            {branches.length > 0 ? (
              branches.map((branch) => (
                <div
                  className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_auto]"
                  key={branch.id}
                >
                  <div>
                    <p className="font-semibold">{branch.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {branch.slug} · {branch.timezone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end">
                    <StatusBadge status={branch.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-muted-foreground">
                No branches are configured yet. Complete branch setup inside tenant settings.
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            contentClassName="space-y-3"
            description="Commercial state placeholder for future subscription billing."
            title="Subscription"
          >
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="mt-1 text-lg font-semibold">{planLabel}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Subscription status</p>
              <p className="mt-1 font-semibold">Ready for billing integration</p>
            </div>
          </SectionCard>

          <SectionCard
            contentClassName="space-y-3"
            description="Structured public-site controls without introducing CMS complexity."
            title="Website and domain"
          >
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="inline-flex items-center gap-2 font-semibold">
                <Globe2 className="size-4" aria-hidden="true" />
                Public website
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Branding, hero content, gallery, contact, and theme settings are managed from website settings.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="inline-flex items-center gap-2 font-semibold">
                <Palette className="size-4" aria-hidden="true" />
                Domain readiness
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Custom domain verification can be layered here without changing tenant data ownership.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </ErpPage>
  );
}
