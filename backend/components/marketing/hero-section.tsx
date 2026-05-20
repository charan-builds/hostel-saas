"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Phone, MessageCircle, MapPin, Droplet, Users, Shield, Briefcase } from "lucide-react";
import { websiteConfig } from "@/config/website-config";
import { PremiumButton } from "./foundation/PremiumButton";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-slate-950"
    >
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y: yBg }}
        className="absolute inset-0 z-0 w-full h-[120%]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2500&auto=format&fit=crop"
          alt="Hostel Background"
          className="w-full h-full object-cover"
        />
        {/* Deep Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </motion.div>

      {/* Atmospheric Glowing Lights */}
      <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Main Content */}
      <motion.div 
        style={{ opacity: opacityText, y: yText }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mt-20"
      >
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-black/30 px-5 py-2 text-sm font-medium tracking-[0.2em] text-white/90 backdrop-blur-md uppercase"
        >
          <span className="w-2 h-2 rounded-full bg-primary mr-3 animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
          BOYS HOSTEL — PULIVENDULA
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 text-5xl sm:text-7xl md:text-8xl font-heading font-extrabold text-white tracking-tight drop-shadow-2xl"
        >
          {websiteConfig.name}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 text-2xl sm:text-3xl font-medium text-white/90 drop-shadow-lg"
        >
          Safe, Neat & Affordable Accommodation
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Modern accommodation for students and working professionals near Loyola Polytechnic College.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-2xl mx-auto"
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <PremiumButton href={"tel:+910000000000" as any} variant="primary" className="w-full sm:w-auto px-10 py-4 text-lg font-medium shadow-[0_0_30px_rgba(14,165,233,0.3)]">
            <Phone size={20} className="mr-3" />
            Call Now
          </PremiumButton>
          
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <PremiumButton 
            href={"/contact" as any} 
            variant="secondary" 
            className="w-full sm:w-auto px-10 py-4 text-lg font-medium bg-white/10 hover:bg-white/20 text-[#25D366] border border-white/10 backdrop-blur-md"
          >
            <MessageCircle size={20} className="mr-3" />
            WhatsApp
          </PremiumButton>
          
          <a 
            href={websiteConfig.contact.mapsLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center w-full sm:w-auto px-10 py-4 text-lg font-medium text-white transition-all duration-300 border border-white/20 rounded-xl hover:bg-white/10 hover:border-white/40 backdrop-blur-md"
          >
            <MapPin size={20} className="mr-3" />
            View on Map
          </a>
        </motion.div>
      </motion.div>

      {/* Floating Trust Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-8 left-0 right-0 px-4 z-20"
      >
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "₹3,500", label: "Students", icon: Users },
            { value: "₹5,000", label: "Employees", icon: Briefcase },
            { value: "24/7", label: "Water Supply", icon: Droplet },
            { value: "CCTV", label: "Protected", icon: Shield },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
            >
              <stat.icon className="w-8 h-8 mb-4 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
              <p className="text-2xl font-bold text-white tracking-tight drop-shadow-md mb-1">{stat.value}</p>
              <p className="text-xs font-medium text-white/60 tracking-widest uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center hidden md:flex"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-white/0 via-white/50 to-white/0 overflow-hidden relative">
          <motion.div
            animate={{ y: [0, 64] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-full h-1/2 bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
}
