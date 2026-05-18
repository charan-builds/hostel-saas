import { ReactNode } from "react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

interface PublicPageWrapperProps {
  children: ReactNode;
  transparentNavbar?: boolean;
}

export function PublicPageWrapper({ children, transparentNavbar = false }: PublicPageWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
