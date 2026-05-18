import { ReactNode } from "react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

import { getOptionalIdentity } from "@/lib/auth/session";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const identity = await getOptionalIdentity();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isLoggedIn={!!identity} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
