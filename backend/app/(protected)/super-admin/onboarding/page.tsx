import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { bootstrapTenantAction } from "@/modules/onboarding/actions";
import { SAAS_PRODUCTS } from "@/types/domain";

export default async function TenantOnboardingPage() {
  await requireTenantPageAccess({
    roles: ["superadmin"],
    product: "hostel_erp",
  });

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Superadmin</p>
        <h2 className="text-2xl font-semibold">Create tenant</h2>
      </div>
      <form
        action={bootstrapTenantAction}
        className="grid max-w-4xl gap-5 rounded border border-slate-200 bg-white p-6 md:grid-cols-2"
      >
        <label className="space-y-1">
          <span className="text-sm font-medium">Product</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
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
        <label className="space-y-1">
          <span className="text-sm font-medium">Organization name</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="organizationName"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Organization slug</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="organizationSlug"
            pattern="[a-z0-9][a-z0-9-]{1,62}[a-z0-9]"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Default hostel name</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="hostelName"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Default hostel slug</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="hostelSlug"
            pattern="[a-z0-9][a-z0-9-]{1,62}[a-z0-9]"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Timezone</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue="Asia/Kolkata"
            name="timezone"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Admin full name</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="adminFullName"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Admin email</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="adminEmail"
            required
            type="email"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Temporary password</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            minLength={12}
            name="adminPassword"
            required
            type="password"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Currency</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue="INR"
            maxLength={3}
            minLength={3}
            name="currency"
            required
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Address line</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="addressLine1"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">City</span>
          <input className="w-full rounded border border-slate-300 px-3 py-2" name="city" />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">State</span>
          <input className="w-full rounded border border-slate-300 px-3 py-2" name="state" />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Country</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue="India"
            name="country"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Postal code</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="postalCode"
          />
        </label>
        <div className="md:col-span-2">
          <button
            className="rounded bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
            type="submit"
          >
            Create tenant
          </button>
        </div>
      </form>
    </section>
  );
}
