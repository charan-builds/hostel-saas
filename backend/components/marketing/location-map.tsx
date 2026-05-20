"use client";

import { motion } from "framer-motion";
import { websiteConfig } from "@/config/website-config";
import { publicContent } from "@/config/public-content";
import { MapPin, Navigation } from "lucide-react";

export function LocationMap() {
  const { location } = publicContent;

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white tracking-wide uppercase backdrop-blur-sm"
          >
            <MapPin size={16} className="mr-2 text-primary" />
            {location.badge}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-heading font-bold tracking-tight text-white sm:text-5xl drop-shadow-md"
          >
            {location.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-xl text-white/60 leading-relaxed"
          >
            {location.description}
          </motion.p>
          {location.note && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-4 inline-block bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-2 rounded-xl text-lg font-medium shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            >
              <strong>Note:</strong> {location.note}
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-900 aspect-[16/9] md:aspect-[21/9]"
        >
          {/* Fallback stylized map background if iframe fails or is loading */}
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center">
            <MapPin size={48} className="text-primary/40 mb-4" />
            <p className="text-white/60 font-medium text-center max-w-sm">{websiteConfig.contact.address}</p>
          </div>

          {/* Actual Google Maps iframe */}
          <iframe 
            src={location.mapUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 0, position: "relative", zIndex: 10, filter: "invert(90%) hue-rotate(180deg)" }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 mix-blend-screen"
          />

          <div className="absolute bottom-8 left-8 z-20">
            <a
              href={websiteConfig.contact.mapsLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-md px-6 py-4 text-base font-semibold text-white shadow-xl hover:bg-white/20 transition-all border border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <Navigation size={20} className="text-primary" />
              Get Directions
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
