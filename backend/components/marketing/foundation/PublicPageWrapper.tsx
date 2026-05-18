import { ReactNode } from "react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

interface PublicPageWrapperProps {
  children: ReactNode;
}

export function PublicPageWrapper({ children }: PublicPageWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar isLoggedIn={false} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
