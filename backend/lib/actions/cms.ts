"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { normalizeWebsiteBuilderDraft } from "@/lib/website-builder/sections";
import type { Json } from "@/types/database.types";

type JsonObject = {
  [key: string]: Json | undefined;
};

function asJsonObject(value: Json | undefined): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

function formString(
  formData: FormData,
  key: string,
  fallback: Json | undefined,
) {
  const value = formData.get(key);

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return fallback ?? null;
}

function formJson(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export async function updateWebsiteCMS(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  // Get current user's org id
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("organization_id")
    .eq("id", userData.user.id)
    .single();

  const organizationId = profile?.organization_id;
  
  if (!organizationId) {
    return { error: "No organization linked to your profile." };
  }

  // Get existing metadata
  const { data: org } = await supabase
    .from("organizations")
    .select("metadata")
    .eq("id", organizationId)
    .single();

  const existingMetadata = asJsonObject(org?.metadata);
  const existingWebsite = asJsonObject(existingMetadata.website);
  const existingContact = asJsonObject(existingWebsite.contact);
  const existingTheme = asJsonObject(existingWebsite.theme);

  // Extract form data
  const actionType = formData.get("actionType") as string;
  const builderAction = formData.get("builderAction") as string | null;

  const newMetadata: JsonObject = { ...existingMetadata };

  if (actionType === "builder") {
    if (builderAction === "discard") {
      delete newMetadata.websiteDraft;
    } else {
      const draftPayload = formJson(formData, "draftPayload");

      if (!draftPayload) {
        return { error: "Invalid website draft payload." };
      }

      const draft = normalizeWebsiteBuilderDraft(draftPayload);

      if (builderAction === "publish") {
        newMetadata.website = draft as unknown as Json;
        delete newMetadata.websiteDraft;
      } else {
        newMetadata.websiteDraft = draft as unknown as Json;
      }
    }
  } else if (actionType === "general") {
    newMetadata.website = {
      ...existingWebsite,
      name: formString(formData, "hostelName", existingWebsite.name),
      description: formString(formData, "description", existingWebsite.description),
      contact: {
        ...existingContact,
        phone: formString(formData, "phone", existingContact.phone),
        email: formString(formData, "email", existingContact.email),
        address: formString(formData, "address", existingContact.address),
      },
    };
  } else if (actionType === "branding") {
    newMetadata.website = {
      ...existingWebsite,
      theme: {
        ...existingTheme,
        primary: formString(formData, "primaryColor", existingTheme.primary),
        accent: formString(formData, "accentColor", existingTheme.accent),
      },
    };
  } else if (actionType === "layout") {
    const pageSections: { enabled: boolean; id: string; props: Record<string, never>; variant: string }[] = [];
    const sectionPrefix = "section_";
    const sectionTypes = new Map<string, string>();
    const sectionVisibility = new Map<string, boolean>();

    for (const [key, value] of formData.entries()) {
      if (key.startsWith(sectionPrefix) && key.endsWith("_type")) {
        const id = key.substring(sectionPrefix.length, key.length - "_type".length);
        sectionTypes.set(id, value as string);
      } else if (key.startsWith(sectionPrefix) && key.endsWith("_visible")) {
        const id = key.substring(sectionPrefix.length, key.length - "_visible".length);
        sectionVisibility.set(id, value === "on");
      }
    }
    
    // Maintain order by using the static default order or existing order if we implement drag and drop later.
    // For now, insertion order from formData map iteration is fine, but to be safe, let's sort them if needed.
    // Since formData insertion order matches the DOM order, we can rely on it for now.
    for (const [id, type] of sectionTypes.entries()) {
      pageSections.push({
        enabled: sectionVisibility.has(id) ? sectionVisibility.get(id)! : false,
        id,
        props: {},
        variant: type,
      });
    }

    newMetadata.website = {
      ...existingWebsite,
      pageSections: pageSections as unknown as Json,
    };
  }

  const { error } = await supabase
    .from("organizations")
    .update({ metadata: newMetadata })
    .eq("id", organizationId);

  if (error) {
    console.error("CMS update error:", error);
    return { error: "Failed to update settings." };
  }

  // In Next.js App Router, layout.tsx fetches the metadata, so we revalidate the layout
  revalidatePath("/", "layout");
  revalidatePath("/admin/website");

  const message =
    actionType === "builder" && builderAction === "publish"
      ? "Website changes published successfully."
      : actionType === "builder" && builderAction === "discard"
        ? "Saved draft discarded."
        : "Website draft saved successfully.";

  return { action: builderAction ?? actionType, success: true, message };
}
