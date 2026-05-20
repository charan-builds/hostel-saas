import { getTenantCMS } from "@/lib/tenant/cms";
import { PageRenderer } from "@/components/marketing/page-renderer";

export default async function MarketingHomePage() {
  const { publicContent } = await getTenantCMS();
  
  return <PageRenderer sections={publicContent.pageSections} />;
}
