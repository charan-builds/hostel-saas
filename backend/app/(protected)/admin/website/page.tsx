import { WebsiteBuilder } from "@/components/admin/website/website-builder";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWebsiteDraftFromMetadata } from "@/lib/website-builder/sections";

export default async function WebsiteCMSPage() {
  const context = await requireTenantPageAccess({
    permission: "tenant:update",
    product: "hostel_erp",
  });

  const supabase = await createSupabaseServerClient();
  const { data: organization } = context.organizationId
    ? await supabase
        .from("organizations")
        .select("metadata")
        .eq("id", context.organizationId)
        .maybeSingle()
    : { data: null };

  const { draft, hasSavedDraft } = getWebsiteDraftFromMetadata(
    organization?.metadata,
  );

  return <WebsiteBuilder hasSavedDraft={hasSavedDraft} initialDraft={draft} />;
}
