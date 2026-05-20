import { Metadata } from "next";
import { publicContent } from "@/config/public-content";
import { websiteConfig } from "@/config/website-config";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Terms & Conditions | ${websiteConfig.name}`,
    description: `Terms and conditions for residing at ${websiteConfig.name}.`,
  };
}

export default function TermsPage() {
  const { terms } = publicContent;
  
  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.2em] text-white/80 backdrop-blur-md uppercase">
          {terms.badge}
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-12 text-white drop-shadow-md">{terms.title}</h1>
        
        <div className="prose prose-lg prose-invert max-w-none text-white/70 bg-slate-900/50 p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-xl backdrop-blur-md">
          <p className="text-xl text-white mb-8">{terms.intro}</p>
          
          {terms.sections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-white mt-10 mb-4 border-b border-white/10 pb-4">{section.title}</h2>
              <ul className="space-y-3">
                {section.rules.map((rule, ruleIdx) => (
                  <li key={ruleIdx}>{rule}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
