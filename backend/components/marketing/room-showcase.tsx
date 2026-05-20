"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { publicContent } from "@/config/public-content";

export function RoomShowcase() {
  return (
    <section className="py-24 bg-slate-950 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-heading font-bold tracking-tight text-white sm:text-4xl drop-shadow-md"
            >
              Find Your Perfect Space
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-lg text-white/60"
            >
              Choose from our thoughtfully designed rooms tailored for focus and comfort.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/our-rooms"
              className="inline-flex items-center font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all rooms
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto gap-8">
          {publicContent.roomTypes.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={room.image}
                  alt={room.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                {room.popular && (
                  <div className="absolute top-4 right-4 rounded-full bg-primary/90 backdrop-blur-md px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-white shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="absolute bottom-4 left-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-lg">
                  <p className="text-sm font-semibold text-white">
                    {room.capacity} Person{room.capacity > 1 ? 's' : ''} Max
                  </p>
                </div>
              </div>
              
              <div className="flex flex-1 flex-col p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-heading font-bold text-white">
                    {room.title}
                  </h3>
                  <div className="text-right">
                    <span className="text-2xl font-heading font-bold text-primary drop-shadow-md">{room.price}</span>
                    <span className="text-sm text-white/50 block">/{room.period.replace('per ', '')}</span>
                  </div>
                </div>
                
                <p className="text-white/60 text-base mb-8 flex-1 leading-relaxed">
                  {room.description}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {room.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-white/80">
                      <Check className="mr-3 h-5 w-5 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {room.features.length > 4 && (
                    <li className="text-sm text-white/40 italic pl-8">
                      + {room.features.length - 4} more features
                    </li>
                  )}
                </ul>
                
                <a
                  href={`https://wa.me/919346131788?text=Hi,%20I'm%20interested%20in%20the%20${room.title}%20room`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto block w-full rounded-xl bg-white/10 border border-white/10 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-white/20 hover:border-white/30 hover:shadow-lg"
                >
                  WhatsApp Us to Book
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
