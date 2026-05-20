import { ReactNode } from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { MobileCTA } from "@/components/marketing/mobile-cta";
import { LocalBusinessSchema } from "@/components/marketing/seo/local-schema";
import { getTenantCMS } from "@/lib/tenant/cms";
import { TenantProvider } from "@/components/providers/tenant-provider";
import { getOptionalIdentity } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const { websiteConfig } = await getTenantCMS();
  
  return {
    title: {
      template: `%s | ${websiteConfig.name}`,
      default: `${websiteConfig.name} - ${websiteConfig.tagline || 'Student Accommodation'}`,
    },
    description: websiteConfig.description,
    keywords: ["Hostel", "Student Accommodation", "PG", websiteConfig.name],
    openGraph: {
      type: "website",
      locale: "en_IN",
      title: websiteConfig.name,
      description: websiteConfig.description,
      siteName: websiteConfig.name,
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const identity = await getOptionalIdentity();
  const tenantData = await getTenantCMS();

  return (
    <TenantProvider data={tenantData}>
      {/* Inject dynamic CSS variables for the theme */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --primary: ${tenantData.themeConfig.primary};
            --accent: ${tenantData.themeConfig.accent};
          }
        `
      }} />
      <div className="flex min-h-screen flex-col" data-template={tenantData.themeConfig.template}>
        <LocalBusinessSchema />
        <Navbar isLoggedIn={!!identity} />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileCTA />
      </div>
    </TenantProvider>
  );
}
