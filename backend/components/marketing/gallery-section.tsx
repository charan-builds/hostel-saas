"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { publicContent } from "@/config/public-content";

export function GallerySection() {
  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Cinematic background lighting */}
      <div className="absolute top-0 left-1/4 w-1/2 h-full bg-primary/5 blur-[150px] pointer-events-none mix-blend-screen" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium tracking-[0.2em] text-white/80 mb-6 uppercase backdrop-blur-sm"
          >
            Virtual Tour
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-white drop-shadow-lg"
          >
            Immersive Spaces
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl text-slate-400 font-light"
          >
            Explore our meticulously designed living areas that combine aesthetics with ultimate comfort.
          </motion.p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {publicContent.gallery.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: (index % 3) * 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative group overflow-hidden rounded-2xl break-inside-avoid transform transition-all duration-700 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-slate-900"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <Image
                src={image}
                alt={`Hostel space ${index + 1}`}
                width={800}
                height={600}
                className="w-full h-auto object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000 ease-[0.21,0.47,0.32,0.98] opacity-80 group-hover:opacity-100"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                <div className="w-8 h-1 bg-primary mb-3 rounded-full" />
                <p className="text-white font-medium tracking-wide">Premium Living</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
