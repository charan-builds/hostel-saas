"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTenantCMS } from "@/components/providers/tenant-provider";

export function PricingCards() {
  const { websiteConfig, publicContent } = useTenantCMS();

  return (
    <section className="py-20 md:py-32 relative bg-slate-950 overflow-hidden border-t border-white/5">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1/3 h-[500px] bg-[#0EA5E9]/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-[500px] bg-[#F97316]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.2em] text-[#0EA5E9] mb-6 uppercase backdrop-blur-md shadow-sm"
          >
            TRANSPARENT PRICING
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-white drop-shadow-lg leading-tight"
          >
            Simple, All-Inclusive Plans
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl md:text-2xl text-white/60 leading-relaxed font-light max-w-2xl mx-auto"
          >
            No hidden fees. No surprises. Just everything you need for a comfortable stay.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {publicContent.roomTypes.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: index * 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className={`group relative flex flex-col rounded-[2.5rem] p-8 sm:p-10 md:p-12 transition-all duration-700 overflow-hidden ${
                room.popular
                  ? "bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] md:-translate-y-4"
                  : "bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
              }`}
            >
              {room.popular && (
                <>
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-[#0EA5E9]/20 blur-[60px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-[#F97316]/20 blur-[60px] pointer-events-none" />
                </>
              )}

              {room.popular && (
                <div className="absolute top-8 right-8 rounded-full bg-gradient-to-r from-[#0EA5E9] to-blue-400 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8 relative z-10">
                <h3 className="text-3xl md:text-4xl font-heading font-bold mb-3 text-white">
                  {room.title}
                </h3>
                <p className={`text-lg font-light ${room.popular ? "text-white/70" : "text-white/50"}`}>
                  {room.description}
                </p>
              </div>
              
              <div className="mb-10 flex items-baseline relative z-10">
                <span className="text-5xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight text-white drop-shadow-md">
                  {room.price}
                </span>
                <span className={`ml-2 text-xl font-medium ${room.popular ? "text-white/60" : "text-white/40"}`}>
                  /mo
                </span>
              </div>
              
              <ul className="mb-12 flex-1 space-y-6 relative z-10">
                {room.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${room.popular ? "bg-[#0EA5E9]/30" : "bg-white/10"}`}>
                      <Check className={`h-4 w-4 ${room.popular ? "text-white" : "text-white/70"}`} strokeWidth={3} />
                    </div>
                    <span className={`ml-4 text-lg font-light ${room.popular ? "text-white/90" : "text-white/70"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Link
                href={`https://wa.me/${websiteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className={`relative z-10 w-full rounded-2xl py-5 text-center text-lg font-bold transition-all duration-500 overflow-hidden group/btn ${
                  room.popular
                    ? "bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_40px_rgba(14,165,233,0.5)] hover:-translate-y-1"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:-translate-y-1"
                }`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out" />
                <span className="relative z-10">Enquire Now</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
