"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle, MapPin, Shield, Sparkles, Map, Users, Heart, IndianRupee, Video, Wifi, Droplet, Coffee, ArrowRight } from "lucide-react";
import { websiteConfig } from "@/config/website-config";
import { publicContent } from "@/config/public-content";
import { AnimatedReveal } from "@/components/marketing/foundation/AnimatedReveal";
import { SectionContainer } from "@/components/marketing/foundation/SectionContainer";
import { GlassCard } from "@/components/marketing/foundation/GlassCard";
import { PremiumButton } from "@/components/marketing/foundation/PremiumButton";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Route } from "next";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* 1. HERO BANNER */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2000&auto=format&fit=crop" 
            alt="Hostel Building" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <AnimatedReveal delay={0.1}>
            <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-black/20 px-4 py-1.5 text-sm font-bold tracking-widest text-white backdrop-blur-md uppercase shadow-lg">
              About Sadhana Boys Hostel
            </div>
          </AnimatedReveal>

          <AnimatedReveal delay={0.2}>
            <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-white tracking-tight drop-shadow-md max-w-4xl">
              A Safe & Comfortable Place To Stay.
            </h1>
          </AnimatedReveal>

          <AnimatedReveal delay={0.3}>
            <p className="mb-10 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
              Providing clean, affordable and student-friendly accommodation near Loyola Polytechnic College.
            </p>
          </AnimatedReveal>

          <AnimatedReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <PremiumButton href="tel:+910000000000" variant="primary" className="w-full sm:w-auto px-8 py-3.5 text-base">
                <Phone size={18} className="mr-2" />
                Call Now
              </PremiumButton>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <PremiumButton 
                href="/contact" 
                variant="secondary" 
                className="w-full sm:w-auto px-8 py-3.5 text-base bg-white hover:bg-slate-50 text-[#25D366] border-none shadow-lg"
              >
                <MessageCircle size={18} className="mr-2" />
                WhatsApp
              </PremiumButton>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* 2. OUR STORY SECTION */}
      <SectionContainer className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedReveal direction="right">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop" 
                  alt="Students relaxing" 
                  className="w-full h-full object-cover"
                />
              </div>
            </AnimatedReveal>
            <AnimatedReveal direction="left">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 mb-6">
                Our Story
              </h2>
              <div className="prose prose-lg text-slate-600">
                <p className="leading-relaxed">
                  Sadhana Boys Hostel is dedicated to providing a comfortable and safe living environment for students and working professionals in Pulivendula. 
                </p>
                <p className="leading-relaxed mt-4">
                  We understand that moving away from home can be challenging. That&apos;s why we focus on creating a supportive community where you can focus on your studies and career while we take care of your daily needs. From hygienic food to 24/7 security, everything is designed with your peace of mind as our priority.
                </p>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </SectionContainer>

      {/* 3. WHY CHOOSE US */}
      <SectionContainer className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimatedReveal>
              <h2 className="text-3xl font-heading font-bold text-slate-900 sm:text-4xl">
                Why Choose Us
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Everything you need for a hassle-free stay.
              </p>
            </AnimatedReveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Safe & Secure", icon: Shield, desc: "24/7 CCTV surveillance and secure entry." },
              { title: "Clean & Hygienic", icon: Sparkles, desc: "Daily room cleaning and sanitized washrooms." },
              { title: "Prime Location", icon: Map, desc: "Walking distance to major colleges." },
              { title: "Student Friendly", icon: Users, desc: "A quiet environment perfect for studying." },
              { title: "Comfortable Living", icon: Heart, desc: "Spacious rooms with proper ventilation." },
              { title: "Affordable Pricing", icon: IndianRupee, desc: "Value for money with no hidden charges." },
            ].map((feature, i) => (
              <AnimatedReveal key={i} delay={i * 0.1}>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* 4. LOCATION HIGHLIGHT */}
      <SectionContainer className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedReveal>
            <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-tr-full -z-10" />
              
              <MapPin size={40} className="mx-auto text-primary mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                Prime Location
              </h2>
              <ul className="space-y-3 text-lg text-slate-700 font-medium inline-block text-left mb-8">
                <li className="flex items-center"><ArrowRight size={18} className="text-primary mr-3 shrink-0" /> Near Loyola Polytechnic College</li>
                <li className="flex items-center"><ArrowRight size={18} className="text-primary mr-3 shrink-0" /> Palem Street</li>
                <li className="flex items-center"><ArrowRight size={18} className="text-primary mr-3 shrink-0" /> Royals Road</li>
                <li className="flex items-center"><ArrowRight size={18} className="text-primary mr-3 shrink-0" /> Near New Gangireddy Hospital</li>
              </ul>

              <div className="mt-8 inline-block bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
                <p className="font-bold text-lg flex items-center justify-center">
                  ⚠️ We are NOT near CKG College.
                </p>
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </SectionContainer>

      {/* 5. TRUST SECTION */}
      <SectionContainer className="py-24 bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              { label: "24/7 CCTV", icon: Video },
              { label: "High-Speed WiFi", icon: Wifi },
              { label: "Hygienic Food", icon: Coffee },
              { label: "Water Supply", icon: Droplet },
              { label: "Comfortable Rooms", icon: Heart },
            ].map((trust, i) => (
              <AnimatedReveal key={i} delay={i * 0.1}>
                <div className="flex flex-col items-center p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors">
                  <trust.icon size={32} className="mb-4 text-white/90" />
                  <span className="font-semibold text-sm sm:text-base">{trust.label}</span>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* 6. STUDENT & EMPLOYEE ACCOMMODATION */}
      <SectionContainer className="py-24 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <AnimatedReveal>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Who is it for?</h2>
              <p className="text-lg text-slate-600">Tailored accommodation options to suit your lifestyle.</p>
            </AnimatedReveal>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            <AnimatedReveal direction="right">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpenIcon />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Students</h3>
                <p className="text-slate-600 leading-relaxed flex-grow">
                  Quiet, focused environments perfect for studying. Close to major educational institutions like Loyola Polytechnic College. Includes high-speed WiFi for online classes and research.
                </p>
                <div className="mt-8 font-bold text-primary text-xl">₹3,500 / Month</div>
              </div>
            </AnimatedReveal>
            <AnimatedReveal direction="left">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                  <BriefcaseIcon />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Working Professionals</h3>
                <p className="text-slate-600 leading-relaxed flex-grow">
                  Hassle-free living with flexible timings. Enjoy a peaceful rest after a long day at work. Prime location allows for easy daily commutes to offices and hospitals.
                </p>
                <div className="mt-8 font-bold text-primary text-xl">₹5,000 / Month</div>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </SectionContainer>

      {/* 7. GALLERY PREVIEW */}
      <SectionContainer className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedReveal>
            <h2 className="text-3xl font-bold text-slate-900 mb-12">Glimpse of Your New Home</h2>
          </AnimatedReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {publicContent.gallery.slice(0, 3).map((img, i) => (
              <AnimatedReveal key={i} delay={i * 0.1}>
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="Hostel interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* 8. CTA SECTION */}
      <SectionContainer className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Looking for Safe Accommodation?
            </h2>
            <p className="text-lg text-slate-600 mb-10">
              Rooms fill up fast. Get in touch with us today to book your spot!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <PremiumButton href="tel:+910000000000" variant="primary" className="w-full sm:w-auto px-8 py-4">
                Call Now
              </PremiumButton>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <PremiumButton href="/contact" variant="secondary" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 shadow-sm border border-slate-200 text-slate-900">
                <MessageCircle size={18} className="mr-2 text-green-500" />
                WhatsApp Us
              </PremiumButton>
            </div>
          </AnimatedReveal>
        </div>
      </SectionContainer>
      
    </div>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
