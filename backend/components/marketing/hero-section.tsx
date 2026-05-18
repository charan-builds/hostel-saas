"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star, Users } from "lucide-react";
import { publicContent } from "@/config/public-content";
import { websiteConfig } from "@/config/website-config";
import { SectionContainer } from "./foundation/SectionContainer";
import { AnimatedReveal } from "./foundation/AnimatedReveal";
import { FloatingInfoCard } from "./foundation/hero/FloatingInfoCard";
import { TrustBadges } from "./foundation/hero/TrustBadges";
import { HeroStats } from "./foundation/hero/HeroStats";
import { HeroActions } from "./foundation/hero/HeroActions";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <div ref={containerRef}>
      <SectionContainer
        background="default"
        className="relative min-h-[100vh] pt-[120px] md:pt-[160px] pb-16 md:pb-32 overflow-hidden flex items-center"
      >
        {/* Soft gradient blob for warmth */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Left Content Area */}
        <div className="flex flex-col">
          <AnimatedReveal delay={0.1}>
            <div className="mb-6 inline-flex items-center rounded-full border border-border/50 bg-card/50 px-4 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              {publicContent.hero.badge}
            </div>
          </AnimatedReveal>
          
          <AnimatedReveal delay={0.2}>
            <h1 className="mb-6 text-5xl font-serif font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl leading-[1.1]">
              {publicContent.hero.heading}
            </h1>
          </AnimatedReveal>
          
          <AnimatedReveal delay={0.3}>
            <p className="mb-8 max-w-xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              {publicContent.hero.description}
            </p>
          </AnimatedReveal>

          <TrustBadges badges={publicContent.hero.trustBadges || []} />
          
          <HeroActions 
            primaryCTA={publicContent.hero.primaryCTA} 
            secondaryCTA={publicContent.hero.secondaryCTA} 
          />

          <HeroStats stats={publicContent.hero.stats} />
        </div>

        {/* Right Content Area (Image & Cards) */}
        <motion.div
          style={{ y: yImage }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:ml-auto w-full max-w-[600px] mt-12 lg:mt-0"
        >
          <div className="relative rounded-2xl bg-card/30 p-2 shadow-2xl backdrop-blur-sm border border-border/50">
            <div className="overflow-hidden rounded-xl bg-muted aspect-[4/5] sm:aspect-square relative">
              <Image
                src={publicContent.hero.image} 
                alt={`${websiteConfig.name} Showcase`}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1.5s] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          <FloatingInfoCard
            title={`${publicContent.hero.occupancy} Occupancy`}
            subtitle="High Demand"
            position="top-left"
            delay={0.8}
            icon={<Star size={24} className="fill-current" />}
          />

          <FloatingInfoCard
            title={`${publicContent.hero.rating} Rating`}
            subtitle="Trusted by students"
            position="bottom-right"
            delay={1}
            icon={<Users size={24} />}
          />

        </motion.div>
      </div>
      </SectionContainer>
    </div>
  );
}
