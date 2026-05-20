import { PricingCards } from "@/components/marketing/pricing-cards";
import { getTenantCMS } from "@/lib/tenant/cms";

export default async function PricingPage() {
  const { publicContent } = await getTenantCMS();
  return (
    <div className="pt-24 pb-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-16 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Plans & Pricing
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          All-inclusive rates. No hidden fees. Choose the space that fits your lifestyle.
        </p>
      </div>
      <PricingCards />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-3xl font-bold text-center mb-10 text-slate-900 dark:text-white">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {publicContent.faqs.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{faq.question}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
