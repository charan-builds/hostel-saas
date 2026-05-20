"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { OptimizedImage } from "@/components/marketing/shared/optimized-image";
import { useTenantCMS } from "@/components/providers/tenant-provider";
import { AnimatedReveal } from "@/components/marketing/foundation/AnimatedReveal";

export function TestimonialSlider() {
  const { publicContent } = useTenantCMS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = publicContent.testimonials;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-primary mb-6"
          >
            STUDENT STORIES
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-slate-900"
          >
            Loved by Residents
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl text-slate-600 leading-relaxed"
          >
            Don&apos;t just take our word for it. Here is what our community has to say about living here.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Large Quote decoration */}
          <div className="absolute -top-16 -left-8 text-primary/10">
            <Quote size={180} className="transform -rotate-12" />
          </div>

          <div className="relative z-10 bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-10 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            
            <AnimatePresence mode="wait">
              {testimonials.length > 0 && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="flex flex-col items-center text-center relative z-10"
                >
                  <p className="text-2xl md:text-4xl font-heading font-medium text-slate-800 leading-tight md:leading-snug mb-12 max-w-3xl">
                    &quot;{testimonials[currentIndex]?.quote}&quot;
                  </p>
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-2xl shadow-sm border border-slate-200">
                      {testimonials[currentIndex]?.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">
                        {testimonials[currentIndex]?.author}
                      </h4>
                      <p className="text-primary font-medium">
                        {testimonials[currentIndex]?.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 z-20">
              <button
                onClick={prev}
                className="h-14 w-14 rounded-full bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 transition-all duration-300 focus:outline-none"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-20">
              <button
                onClick={next}
                className="h-14 w-14 rounded-full bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 transition-all duration-300 focus:outline-none"
                aria-label="Next testimonial"
              >
                <ChevronRight size={28} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
          {/* Dots */}
          <div className="flex justify-center gap-3 mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? "w-10 bg-primary"
                    : "w-2.5 bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
