import { Metadata } from "next";
import { getTenantCMS } from "@/lib/tenant/cms";

export async function generateMetadata(): Promise<Metadata> {
  const { websiteConfig } = await getTenantCMS();
  return {
    title: `Terms & Conditions | ${websiteConfig.name}`,
    description: `Terms and conditions for residing at ${websiteConfig.name}.`,
  };
}

export default async function TermsPage() {
  const { publicContent } = await getTenantCMS();
  const { terms } = publicContent;
  
  return (
    <div className="pt-32 pb-20 md:pt-48 md:pb-32 min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0EA5E9]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F97316]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold tracking-[0.2em] text-[#0EA5E9] uppercase shadow-sm">
          {terms.badge}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold mb-12 text-slate-900 drop-shadow-sm leading-tight">{terms.title}</h1>
        
        <div className="prose prose-lg md:prose-xl max-w-none text-slate-600 bg-white p-8 md:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200/60 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] font-light">
          <p className="text-xl md:text-2xl text-slate-900 mb-10 font-normal leading-relaxed">{terms.intro}</p>
          
          {terms.sections.map((section, idx) => (
            <div key={idx} className="mt-12">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">{section.title}</h2>
              <ul className="space-y-4">
                {section.rules.map((rule, ruleIdx) => (
                  <li key={ruleIdx} className="flex items-start">
                    <span className="w-2 h-2 bg-[#0EA5E9] rounded-full mt-2.5 mr-4 shrink-0"></span>
                    <span className="leading-relaxed text-base md:text-lg">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
