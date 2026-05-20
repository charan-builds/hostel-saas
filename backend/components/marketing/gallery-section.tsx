"use client";

import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/marketing/shared/optimized-image";
import { useTenantCMS } from "@/components/providers/tenant-provider";

export function GallerySection() {
  const { publicContent } = useTenantCMS();

  return (
    <section className="py-20 md:py-32 bg-[#F8FAFC] relative overflow-hidden">
      {/* Cinematic ambient lighting for light mode */}
      <div className="absolute top-0 right-1/4 w-1/2 h-full bg-[#0EA5E9]/5 blur-[150px] pointer-events-none mix-blend-multiply" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold tracking-[0.2em] text-[#0EA5E9] mb-6 uppercase shadow-sm"
          >
            Virtual Tour
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-slate-900 drop-shadow-sm leading-tight"
          >
            Immersive Spaces
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl md:text-2xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto"
          >
            Explore our meticulously designed living areas that combine aesthetics with ultimate comfort.
          </motion.p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
          {publicContent.gallery.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: (index % 3) * 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] break-inside-avoid transform transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] bg-slate-100 border border-slate-200/50"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
              <OptimizedImage
                src={image}
                alt={`Hostel space ${index + 1}`}
                width={800}
                height={600}
                className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-[0.21,0.47,0.32,0.98]"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                <div className="w-10 h-1 bg-[#0EA5E9] mb-4 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
                <p className="text-white font-bold text-xl tracking-wide drop-shadow-md">Premium Living</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
