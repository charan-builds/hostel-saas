"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { publicContent } from "@/config/public-content";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Background with primary color and gradient overlay */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-slate-950/80" />
      
      {/* Decorative patterns */}
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjwvc3ZnPg==')] [mask-image:linear-gradient(to_left,white,transparent)]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl max-w-2xl"
          >
            Ready to experience better student living?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg text-slate-300 max-w-xl"
          >
            Join {publicContent.hero.stats[0]?.value} who have already found their perfect home away from home. Spots are filling up fast for the upcoming semester.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/book"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Book Your Bed Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-md border border-slate-700 bg-slate-800/50 backdrop-blur-sm px-8 text-base font-medium text-white transition-colors hover:bg-slate-800 hover:border-slate-600"
            >
              Contact Admissions
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
