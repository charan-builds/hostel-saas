import { redirect } from "next/navigation";

import { getOptionalIdentity } from "@/lib/auth/session";

export default async function Home() {
  const identity = await getOptionalIdentity();

  redirect(identity ? "/dashboard" : "/login");
}
