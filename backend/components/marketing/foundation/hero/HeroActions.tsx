import { ArrowRight, MessageCircle } from "lucide-react";
import type { Route } from "next";

import { PremiumButton } from "../PremiumButton";
import { useTenantCMS } from "@/components/providers/tenant-provider";
import { AnimatedReveal } from "../AnimatedReveal";

export function HeroActions() {
  const { websiteConfig, publicContent } = useTenantCMS();
  const primaryCTA = publicContent.hero.primaryCTA;
  const secondaryCTA = publicContent.hero.secondaryCTA;

  const whatsappHref =
    `https://wa.me/${websiteConfig.contact.whatsapp.replace(/[^0-9]/g, "")}` as const;

  return (
    <AnimatedReveal delay={0.3}>
      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <PremiumButton
          href={primaryCTA.href as Route}
          variant="primary"
          className="group w-full sm:w-auto text-base px-8 py-4"
        >
          {primaryCTA.text}
          <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </PremiumButton>
        <PremiumButton
          href={secondaryCTA.href as Route}
          variant="outline"
          className="w-full sm:w-auto text-base px-8 py-4"
        >
          {secondaryCTA.text}
        </PremiumButton>
        <PremiumButton
          href={whatsappHref}
          variant="secondary"
          className="w-full sm:w-auto text-base px-8 py-4 bg-white/60 hover:bg-white backdrop-blur-sm border border-border/50"
        >
          <MessageCircle size={18} className="mr-2 text-[#25D366]" />
          WhatsApp Us
        </PremiumButton>
      </div>
    </AnimatedReveal>
  );
}
