"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type EnquiryStatus = "new" | "contacted" | "resolved" | "archived";

type MutationResult = PromiseLike<{
  error: { message?: string } | null;
}>;

type EnquiryInsert = {
  email: string | null;
  full_name: string;
  message: string;
  organization_id: string;
  source: "website_form";
  status: "new";
};

type EnquiryTableClient = {
  insert: (payload: EnquiryInsert) => MutationResult;
  update: (payload: { status: EnquiryStatus }) => {
    eq: (column: "id", value: string) => MutationResult;
  };
};

type EnquiryClient = {
  from: (table: "enquiries") => EnquiryTableClient;
};

function formString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function submitEnquiry(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const enquiryClient = supabase as unknown as EnquiryClient;

  const name = formString(formData, "name");
  const email = formString(formData, "email");
  const message = formString(formData, "message");
  const phone = formString(formData, "phone");

  if (!name || !message || (!email && !phone)) {
    return { error: "Please provide your name, message, and either email or phone." };
  }

  // NOTE: For multi-tenant, we'd look up the org_id by the hostname. 
  // For MVP, we'll assume a single tenant or fetch the first one if none is provided.
  const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
  const organizationId = orgs?.[0]?.id;

  if (!organizationId) {
    return { error: "System configuration error. Please contact support." };
  }

  const { error } = await enquiryClient.from("enquiries").insert({
    organization_id: organizationId,
    full_name: name,
    email: email || null,
    message: message,
    source: "website_form",
    status: "new",
  });

  if (error) {
    console.error("Enquiry submission error:", error);
    return { error: "Failed to submit your message. Please try again later." };
  }

  return { success: true, message: "Thank you! We have received your message and will get back to you shortly." };
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  const supabase = await createClient();
  const enquiryClient = supabase as unknown as EnquiryClient;

  const { error } = await enquiryClient
    .from("enquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Failed to update status:", error);
    return { error: "Failed to update status" };
  }

  revalidatePath("/admin/enquiries");
  return { success: true };
}
