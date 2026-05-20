"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Phone, MessageCircle, Droplet, Users, Shield, Briefcase, ArrowRight } from "lucide-react";
import { OptimizedImage } from "@/components/marketing/shared/optimized-image";
import { useTenantCMS } from "@/components/providers/tenant-provider";

export function HeroSection() {
  const { websiteConfig, publicContent } = useTenantCMS();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const { hero } = publicContent;

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacityContent = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100dvh] pt-32 pb-16 md:pt-48 md:pb-24 flex flex-col items-center justify-between overflow-hidden bg-slate-900"
    >
      {/* Cinematic Background with Parallax & Scale */}
      <motion.div 
        style={{ y: yBg, scale: scaleBg }}
        className="absolute inset-0 z-0 origin-top"
      >
        <OptimizedImage
          src={hero.image}
          alt="Hostel Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          wrapperClassName="w-full h-[120%]"
        />
        {/* Premium Dark Overlay - Exact Specification */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.65)]" />
        {/* Subtle Vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.7)_100%)]" />
        {/* Bottom Fade to transition into the next section */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
      </motion.div>

      {/* Main Hero Content */}
      <motion.div 
        style={{ opacity: opacityContent, y: yContent }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center flex-grow justify-center mb-12 md:mb-16"
      >
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-2 text-xs md:text-sm font-bold tracking-[0.2em] text-white backdrop-blur-md uppercase shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-[#0EA5E9] mr-3 animate-pulse shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
          {hero.badge}
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-heading font-extrabold text-white tracking-tight drop-shadow-2xl leading-[1.1]"
        >
          {hero.heading}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 text-xl sm:text-2xl md:text-4xl font-light text-white/90 drop-shadow-lg max-w-4xl"
        >
          {websiteConfig.tagline}
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow"
        >
          {hero.description}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <a 
            href={hero.primaryCTA.href}
            className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 text-lg font-bold text-white bg-[#0EA5E9] rounded-2xl overflow-hidden transition-all shadow-[0_10px_40px_-10px_rgba(14,165,233,0.8)] hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(14,165,233,1)]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <Phone size={20} className="mr-3 relative z-10" />
            <span className="relative z-10">{hero.primaryCTA.text}</span>
            <ArrowRight size={20} className="ml-3 relative z-10 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <a 
            href={hero.secondaryCTA.href}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 text-lg font-bold bg-white/10 text-white border border-white/20 rounded-2xl backdrop-blur-lg hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <MessageCircle size={20} className="mr-3 text-[#22C55E]" />
            {hero.secondaryCTA.text}
          </a>
        </motion.div>
      </motion.div>

      {/* Floating Premium Glass Stats - Changed from absolute to relative flow for better mobile fit */}
      <motion.div 
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full px-4 sm:px-6 z-20"
      >
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { value: hero.stats[0]?.value || "₹3,500", label: "Students", icon: Users },
            { value: hero.stats[1]?.value || "₹5,000", label: "Employees", icon: Briefcase },
            { value: hero.stats[2]?.value || "24/7", label: "Water Supply", icon: Droplet },
            { value: "CCTV", label: "Protected", icon: Shield },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="group flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-2xl hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              <stat.icon className="w-8 h-8 md:w-10 md:h-10 mb-4 text-[#0EA5E9] opacity-90 group-hover:scale-110 group-hover:text-white transition-all duration-500" strokeWidth={1.5} />
              <p className="text-2xl md:text-3xl font-heading font-extrabold text-white tracking-tight drop-shadow-sm mb-1">{stat.value}</p>
              <p className="text-xs md:text-sm font-bold text-white/90 tracking-widest uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
