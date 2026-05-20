import Link from "next/link";
import { Building2, CheckCircle2, KeyRound, MapPinned } from "lucide-react";

import { FormActions, FormSection } from "@/components/forms/form-section";
import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { bootstrapTenantAction } from "@/modules/onboarding/actions";
import { SAAS_PRODUCTS } from "@/types/domain";

const fieldClassName = "erp-control w-full";

export default async function TenantOnboardingPage() {
  await requireTenantPageAccess({
    roles: ["superadmin"],
    product: "hostel_erp",
  });

  return (
    <ErpPage>
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link href="/super-admin">Back to control center</Link>
          </Button>
        }
        description="Create the organization, first hostel branch, and tenant admin in one audited bootstrap workflow."
        eyebrow="Superadmin"
        title="Create tenant"
      />

      <ErpPageGrid>
        <StatCard
          description="Organization identity and SaaS product"
          icon={Building2}
          label="Step 1"
          tone="info"
          value="Tenant"
        />
        <StatCard
          description="Default branch and locale settings"
          icon={MapPinned}
          label="Step 2"
          value="Hostel"
        />
        <StatCard
          description="Initial administrator access"
          icon={KeyRound}
          label="Step 3"
          tone="warning"
          value="Admin"
        />
        <StatCard
          description="Bootstrap redirects into tenant context"
          icon={CheckCircle2}
          label="Step 4"
          tone="success"
          value="Activate"
        />
      </ErpPageGrid>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form action={bootstrapTenantAction} className="space-y-5">
          <FormSection
            description="This creates the organization record and chooses which SaaS product the tenant belongs to."
            title="Organization"
          >
            <label className="space-y-2">
              <span className="text-sm font-medium">Product</span>
              <select
                className={fieldClassName}
                defaultValue="hostel_erp"
                name="product"
              >
                {SAAS_PRODUCTS.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Organization name</span>
              <input
                className={fieldClassName}
                name="organizationName"
                placeholder="Example Hostel Group"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Organization slug</span>
              <input
                className={fieldClassName}
                name="organizationSlug"
                pattern="[a-z0-9][a-z0-9-]{1,62}[a-z0-9]"
                placeholder="example-hostel-group"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Currency</span>
              <input
                className={fieldClassName}
                defaultValue="INR"
                maxLength={3}
                minLength={3}
                name="currency"
                required
              />
            </label>
          </FormSection>

          <FormSection
            description="The first branch becomes the tenant default operating location."
            title="Default hostel branch"
          >
            <label className="space-y-2">
              <span className="text-sm font-medium">Default hostel name</span>
              <input
                className={fieldClassName}
                name="hostelName"
                placeholder="Example Boys Hostel"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Default hostel slug</span>
              <input
                className={fieldClassName}
                name="hostelSlug"
                pattern="[a-z0-9][a-z0-9-]{1,62}[a-z0-9]"
                placeholder="example-boys-hostel"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Timezone</span>
              <input
                className={fieldClassName}
                defaultValue="Asia/Kolkata"
                name="timezone"
                required
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Address line</span>
              <input
                className={fieldClassName}
                name="addressLine1"
                placeholder="Street, landmark, or building"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">City</span>
              <input className={fieldClassName} name="city" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">State</span>
              <input className={fieldClassName} name="state" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Country</span>
              <input
                className={fieldClassName}
                defaultValue="India"
                name="country"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Postal code</span>
              <input className={fieldClassName} name="postalCode" />
            </label>
          </FormSection>

          <FormSection
            description="The admin account receives the first tenant membership and can continue setup after bootstrap."
            title="Tenant admin"
          >
            <label className="space-y-2">
              <span className="text-sm font-medium">Admin full name</span>
              <input
                className={fieldClassName}
                name="adminFullName"
                placeholder="Admin name"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Admin email</span>
              <input
                className={fieldClassName}
                name="adminEmail"
                placeholder="admin@example.com"
                required
                type="email"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Temporary password</span>
              <input
                className={fieldClassName}
                minLength={12}
                name="adminPassword"
                required
                type="password"
              />
            </label>
          </FormSection>

          <FormActions>
            <Button asChild variant="outline">
              <Link href="/super-admin">Cancel</Link>
            </Button>
            <Button type="submit">Create tenant</Button>
          </FormActions>
        </form>

        <div className="space-y-6">
          <SectionCard
            description="The server action remains the single source of truth for transactional bootstrap."
            title="Bootstrap guarantees"
          >
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Creates organization and default branch in one workflow.</p>
              <p>Creates the tenant admin and membership.</p>
              <p>Sets active tenant context after successful creation.</p>
              <p>Preserves existing audit and validation behavior.</p>
            </div>
          </SectionCard>
          <SectionCard
            description="Keep public-site content structured; avoid page-builder complexity at this stage."
            title="After onboarding"
          >
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Configure branches, rooms, beds, and billing plans.</p>
              <p>Review website branding and contact settings.</p>
              <p>Invite staff users and verify admin coverage.</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </ErpPage>
  );
}
