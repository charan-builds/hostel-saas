"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { publicContent } from "@/config/public-content";

export function PricingCards() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-slate-600 dark:text-slate-400"
          >
            All-inclusive plans with no hidden fees. Everything you need for a comfortable stay.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {publicContent.roomTypes.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col rounded-3xl p-8 shadow-xl ring-1 ${
                room.popular
                  ? "bg-slate-950 ring-slate-900 dark:bg-slate-900 dark:ring-primary/50 scale-105 z-10"
                  : "bg-white ring-slate-200 dark:bg-slate-950 dark:ring-slate-800"
              }`}
            >
              {room.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-primary to-green-500 px-4 py-1 text-sm font-medium text-white shadow-sm">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className={`text-2xl font-bold ${room.popular ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  {room.title}
                </h3>
                <p className={`mt-2 text-sm ${room.popular ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                  {room.description}
                </p>
              </div>
              
              <div className="mb-6 flex items-baseline text-5xl font-extrabold">
                <span className={room.popular ? "text-white" : "text-slate-900 dark:text-white"}>
                  {room.price}
                </span>
                <span className={`ml-1 text-xl font-medium ${room.popular ? "text-slate-300" : "text-slate-500"}`}>
                  /mo
                </span>
              </div>
              
              <ul className="mb-8 flex-1 space-y-4">
                {room.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className={`mr-3 h-5 w-5 shrink-0 ${room.popular ? "text-primary" : "text-primary"}`} />
                    <span className={`text-sm ${room.popular ? "text-slate-300" : "text-slate-600 dark:text-slate-300"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Link
                href={`/book?room=${room.id}`}
                className={`w-full rounded-xl py-3.5 text-center text-sm font-semibold transition-all ${
                  room.popular
                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
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
