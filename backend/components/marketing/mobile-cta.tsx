"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { useTenantCMS } from "@/components/providers/tenant-provider";
import { motion, AnimatePresence } from "framer-motion";

export function MobileCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const { websiteConfig } = useTenantCMS();

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling past hero section (roughly 500px)
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden"
        >
          {/* Glassmorphism background with shadow */}
          <div className="absolute inset-x-4 bottom-4 inset-y-0 bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/20 -z-10" />
          
          <div className="flex items-center justify-between gap-3 p-1">
            <a
              href={`tel:${websiteConfig.contact.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#0EA5E9] text-white font-extrabold tracking-wide shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] transition-transform active:scale-95 drop-shadow-md"
            >
              <Phone size={18} className="drop-shadow-md" />
              <span className="drop-shadow-md">Call</span>
            </a>
            
            <a
              href={`https://wa.me/${websiteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#22C55E] text-white font-extrabold tracking-wide shadow-[0_4px_14px_0_rgba(34,197,94,0.39)] transition-transform active:scale-95 drop-shadow-md"
            >
              <MessageCircle size={18} className="drop-shadow-md" />
              <span className="drop-shadow-md">WhatsApp</span>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
