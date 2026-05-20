import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { websiteConfig as staticWebsiteConfig } from "@/config/website-config";
import { publicContent as staticPublicContent } from "@/config/public-content";
import {
  buildTenantCMSFromDraft,
  getWebsiteDraftFromMetadata,
} from "@/lib/website-builder/sections";
import type { Json } from "@/types/database.types";

type TenantWebsiteMetadata = {
  website?: {
    contact?: Partial<typeof staticWebsiteConfig.contact>;
    description?: string;
    hero?: {
      heading?: string;
      image?: string;
    };
    name?: string;
    theme?: {
      accent?: string;
      primary?: string;
    };
    template?: string;
    pageSections?: { id: string; type: string; visible: boolean; config?: Record<string, unknown> }[];
  };
  websiteDraft?: unknown;
};

function asTenantWebsiteMetadata(value: Json): TenantWebsiteMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as TenantWebsiteMetadata;
}

// Next.js React cache to ensure we only fetch once per request lifecycle
export const getTenantCMS = cache(async (hostname?: string) => {
  const supabase = await createClient();
  void hostname;

  // For MVP: if no hostname provided or custom domains not mapped yet, 
  // fetch the first organization in the DB as the default tenant.
  const query = supabase
    .from("organizations")
    .select("id,slug,metadata")
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(1);
  
  // Future: query.eq("domain", hostname)

  const { data, error } = await query.single();
  const { data: branch } = data
    ? await supabase
        .from("hostel_branches")
        .select("id,name,slug")
        .eq("organization_id", data.id)
        .eq("status", "active")
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()
    : { data: null };

  if (error || !data || !data.metadata) {
    console.warn("Failed to fetch tenant CMS from DB, falling back to static config.", error);
    return {
      tenantScope: null,
      websiteConfig: staticWebsiteConfig,
      publicContent: staticPublicContent,
      themeConfig: { template: "modern", primary: "#0EA5E9", accent: "#F97316" }
    };
  }
  
  const metadata = asTenantWebsiteMetadata(data.metadata);
  const { publishedDraft } = getWebsiteDraftFromMetadata(metadata);
  const tenantCMS = buildTenantCMSFromDraft(publishedDraft);

  return {
    tenantScope: branch
      ? {
          branchName: branch.name,
          hostelBranchId: branch.id,
          hostelBranchSlug: branch.slug,
          organizationId: data.id,
          organizationSlug: data.slug,
        }
      : null,
    websiteConfig: tenantCMS.websiteConfig,
    publicContent: tenantCMS.publicContent,
    themeConfig: tenantCMS.themeConfig,
  };
});
