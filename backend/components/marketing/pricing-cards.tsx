"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { publicContent } from "@/config/public-content";

export function PricingCards() {
  return (
    <section className="py-32 relative bg-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1/3 h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-primary mb-6"
          >
            TRANSPARENT PRICING
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-slate-900"
          >
            Simple, All-Inclusive Plans
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl text-slate-600 leading-relaxed"
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
              className={`group relative flex flex-col rounded-[2.5rem] p-10 transition-all duration-500 overflow-hidden ${
                room.popular
                  ? "bg-slate-950 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] md:-translate-y-4"
                  : "bg-white text-slate-900 border border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
              }`}
            >
              {room.popular && (
                <>
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/20 blur-[60px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-accent/20 blur-[60px] pointer-events-none" />
                </>
              )}

              {room.popular && (
                <div className="absolute top-8 right-8 rounded-full bg-gradient-to-r from-primary to-blue-400 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8 relative z-10">
                <h3 className="text-3xl font-heading font-bold mb-3">
                  {room.title}
                </h3>
                <p className={`text-lg ${room.popular ? "text-slate-400" : "text-slate-500"}`}>
                  {room.description}
                </p>
              </div>
              
              <div className="mb-10 flex items-baseline relative z-10">
                <span className="text-6xl font-heading font-extrabold tracking-tight">
                  {room.price}
                </span>
                <span className={`ml-2 text-xl font-medium ${room.popular ? "text-slate-400" : "text-slate-500"}`}>
                  /mo
                </span>
              </div>
              
              <ul className="mb-12 flex-1 space-y-5 relative z-10">
                {room.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${room.popular ? "bg-white/10" : "bg-primary/10"}`}>
                      <Check className={`h-3.5 w-3.5 ${room.popular ? "text-white" : "text-primary"}`} strokeWidth={3} />
                    </div>
                    <span className={`ml-4 text-base ${room.popular ? "text-slate-300" : "text-slate-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Link
                href={`/book?room=${room.id}`}
                className={`relative z-10 w-full rounded-2xl py-5 text-center text-lg font-bold transition-all duration-300 ${
                  room.popular
                    ? "bg-white text-slate-900 hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    : "bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Choose {room.title}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
