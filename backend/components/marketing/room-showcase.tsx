"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { publicContent } from "@/config/public-content";

export function RoomShowcase() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
            >
              Find Your Perfect Space
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-lg text-slate-600 dark:text-slate-400"
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
              className="inline-flex items-center font-medium text-primary hover:text-primary/80"
            >
              View all rooms
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publicContent.roomTypes.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={room.image}
                  alt={room.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {room.popular && (
                  <div className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Most Popular
                  </div>
                )}
                <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm dark:bg-slate-900/90">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {room.capacity} Person{room.capacity > 1 ? 's' : ''} Max
                  </p>
                </div>
              </div>
              
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {room.title}
                  </h3>
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">{room.price}</span>
                    <span className="text-xs text-slate-500 block">/{room.period.replace('per ', '')}</span>
                  </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1">
                  {room.description}
                </p>
                
                <ul className="space-y-2 mb-8">
                  {room.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-700 dark:text-slate-300">
                      <Check className="mr-2 h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                  {room.features.length > 3 && (
                    <li className="text-sm text-slate-500 italic pl-6">
                      + {room.features.length - 3} more features
                    </li>
                  )}
                </ul>
                
                <Link
                  href={`/book?room=${room.id}`}
                  className="mt-auto block w-full rounded-md bg-slate-100 py-2.5 text-center text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  Book this room
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
