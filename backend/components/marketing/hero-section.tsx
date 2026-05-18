/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { publicContent } from "@/config/public-content";
import { websiteConfig } from "@/config/website-config";
import { CheckCircle, Star, Users } from "lucide-react";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-[100vh] overflow-hidden bg-slate-50 dark:bg-slate-950 pt-[120px] pb-16 md:pt-[160px] md:pb-32">
      {/* Animated Mesh Gradient Background */}
      <motion.div 
        style={{ y: yBg, opacity }} 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-green-300/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70" 
        />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz48L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center rounded-full border border-slate-200 bg-white/50 px-4 py-1.5 text-sm font-medium text-slate-900 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 dark:text-white"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            {publicContent.hero.badge}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            {publicContent.hero.heading.split(' ').map((word, i) => (
              word.toLowerCase() === 'home' || word.toLowerCase() === 'student' ? (
                <span key={i} className="text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400"> {word} </span>
              ) : (
                ` ${word} `
              )
            ))}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-400 sm:text-xl md:text-2xl"
          >
            {publicContent.hero.description}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href={publicContent.hero.primaryCTA.href as any}
              className="inline-flex h-12 items-center justify-center rounded-full bg-slate-900 px-8 text-sm font-medium text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-105 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:shadow-white/10 dark:focus:ring-white"
            >
              {publicContent.hero.primaryCTA.text}
            </Link>
            <Link
              href={publicContent.hero.secondaryCTA.href as any}
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm px-8 text-sm font-medium text-slate-900 shadow-sm transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:hover:bg-slate-800 dark:focus:ring-slate-800"
            >
              {publicContent.hero.secondaryCTA.text}
            </Link>
          </motion.div>
        </div>

        {/* Hero Image & Floating Cards */}
        <motion.div
          style={{ y: yImage }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 sm:mt-24 relative mx-auto max-w-5xl"
        >
          {/* Main Hero Asset */}
          <div className="relative rounded-2xl border border-slate-200/50 bg-white/30 p-2 shadow-2xl backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/30">
            <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 aspect-video relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={publicContent.gallery[0]} 
                alt={`${websiteConfig.name} Showcase`}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Floating UI Card 1 (Left) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute top-[20%] -left-[5%] md:-left-[10%] hidden md:block"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-4 rounded-xl border border-slate-200/50 bg-white/80 p-4 shadow-xl backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">99% Occupancy</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">High Demand</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating UI Card 2 (Right) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute bottom-[20%] -right-[5%] md:-right-[10%] hidden md:block"
          >
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-4 rounded-xl border border-slate-200/50 bg-white/80 p-4 shadow-xl backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80"
            >
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 dark:border-slate-800 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">SJ</div>
                <div className="h-8 w-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-xs font-bold dark:border-slate-800">MC</div>
                <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center dark:border-slate-800 dark:bg-slate-800">
                  <Users size={12} className="text-slate-500" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-white">
                  4.9 <Star size={14} className="fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Resident Rating</p>
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
