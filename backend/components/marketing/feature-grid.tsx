"use client";

import { motion } from "framer-motion";
import { Car, Coffee, Droplet, Shield, Sparkles, Utensils, Wifi } from "lucide-react";
import { publicContent } from "@/config/public-content";

const iconMap: Record<string, React.ElementType> = {
  wifi: Wifi,
  shield: Shield,
  utensils: Utensils,
  droplet: Droplet,
  sparkles: Sparkles,
  car: Car,
};

export function FeatureGrid() {
  return (
    <section className="py-32 relative bg-slate-50 overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-[-20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-primary mb-6"
          >
            OUR AMENITIES
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-slate-900"
          >
            Experience Premium Living
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl text-slate-600 leading-relaxed"
          >
            We don't just provide a room. We provide a complete ecosystem for your success, comfort, and peace of mind.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publicContent.facilities.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Coffee;
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="group relative rounded-3xl bg-white p-8 sm:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden"
              >
                {/* Hover Glow Effect */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-primary/0 blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
                
                <div className="relative mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all duration-500 z-10">
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                </div>
                
                <h3 className="mb-4 text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-300 relative z-10">
                  {feature.title}
                </h3>
                
                <p className="text-slate-500 leading-relaxed text-lg relative z-10">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
