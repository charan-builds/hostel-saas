"use client";

import { motion } from "framer-motion";
import { websiteConfig } from "@/config/website-config";
import { SectionContainer } from "./foundation/SectionContainer";
import { MapPin, Navigation } from "lucide-react";

export function LocationMap() {
  return (
    <SectionContainer background="muted" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
          >
            <MapPin size={16} className="mr-2" />
            Location
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Find Us Easily
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Conveniently located near Loyola Polytechnic College for easy access to your classes.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card aspect-[16/9] md:aspect-[21/9]"
        >
          {/* Fallback stylized map background if iframe fails or is loading */}
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center">
            <MapPin size={48} className="text-primary/40 mb-4" />
            <p className="text-muted-foreground font-medium">{websiteConfig.contact.address}</p>
          </div>

          {/* Actual Google Maps iframe - replace the src with actual embed URL if available */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15446.495034608311!2d78.2215352!3d14.4200631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb3b13689454179%3A0xe9cc38ef877402!2sPulivendula%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0, position: "relative", zIndex: 10 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          />

          <div className="absolute bottom-6 left-6 z-20">
            <a
              href={websiteConfig.contact.mapsLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-xl hover:bg-slate-50 transition-colors dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <Navigation size={18} className="text-primary" />
              Get Directions
            </a>
          </div>
        </motion.div>
      </div>
    </SectionContainer>
  );
}
