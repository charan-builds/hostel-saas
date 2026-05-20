"use client";

import { Phone, MessageCircle, MapPin, Shield, Sparkles, Map, Users, Heart, IndianRupee, Video, Wifi, Droplet, Coffee, ArrowRight } from "lucide-react";
import { websiteConfig } from "@/config/website-config";
import { publicContent } from "@/config/public-content";
import { AnimatedReveal } from "@/components/marketing/foundation/AnimatedReveal";

export default function AboutPage() {
  const { about } = publicContent;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      
      {/* 1. HERO BANNER */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={publicContent.hero.image} 
            alt="Hostel Building" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-slate-950" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <AnimatedReveal delay={0.1}>
            <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.2em] text-white/90 backdrop-blur-md uppercase shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              {about.badge}
            </div>
          </AnimatedReveal>

          <AnimatedReveal delay={0.2}>
            <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-white tracking-tight drop-shadow-2xl max-w-4xl">
              {about.heroTitle}
            </h1>
          </AnimatedReveal>

          <AnimatedReveal delay={0.3}>
            <p className="mb-10 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto drop-shadow-md">
              {about.heroSubtitle}
            </p>
          </AnimatedReveal>

          <AnimatedReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <a 
                href={`tel:${websiteConfig.contact.phone}`}
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(14,165,233,0.3)]"
              >
                <Phone size={18} className="mr-3" />
                Call Now
              </a>
              <a 
                href={`https://wa.me/${websiteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-medium bg-white/10 hover:bg-white/20 text-[#22C55E] border border-white/10 rounded-xl backdrop-blur-md transition-all"
              >
                <MessageCircle size={18} className="mr-3" />
                WhatsApp
              </a>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* 2. OUR STORY SECTION */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedReveal direction="right">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={about.storyImage} 
                  alt="Students relaxing" 
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              </div>
            </AnimatedReveal>
            <AnimatedReveal direction="left">
              <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white mb-8 drop-shadow-md">
                {about.storyTitle}
              </h2>
              <div className="prose prose-lg text-white/70">
                {about.storyParagraphs.map((paragraph, index) => (
                  <p key={index} className={`leading-relaxed ${index > 0 ? "mt-6" : ""}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="py-32 bg-slate-900 border-t border-white/5 relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <AnimatedReveal>
              <h2 className="text-4xl font-heading font-bold text-white sm:text-5xl drop-shadow-md">
                Why Choose Us
              </h2>
              <p className="mt-6 text-xl text-white/60">
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
                <div className="bg-white/5 p-10 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-[0_0_20px_rgba(14,165,233,0.2)] group-hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]">
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed text-lg">{feature.desc}</p>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LOCATION HIGHLIGHT */}
      <section className="py-24 bg-slate-950 relative">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedReveal>
            <div className="bg-slate-900 p-8 sm:p-14 rounded-[3rem] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -z-10" />
              
              <MapPin size={48} className="mx-auto text-primary mb-8 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-8">
                {about.locationBadge}
              </h2>
              <ul className="space-y-4 text-xl text-white/80 font-medium inline-block text-left mb-10">
                {about.locationHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center">
                    <ArrowRight size={20} className="text-primary mr-4 shrink-0" /> {highlight}
                  </li>
                ))}
              </ul>

              {about.locationNote && (
                <div className="mt-4 inline-block bg-red-500/10 border border-red-500/20 text-red-400 px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                  <p className="font-bold text-lg flex items-center justify-center">
                    {about.locationNote}
                  </p>
                </div>
              )}
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* 5. TRUST SECTION */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none mix-blend-overlay" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              { label: "24/7 CCTV", icon: Video },
              { label: "High-Speed WiFi", icon: Wifi },
              { label: "Hygienic Food", icon: Coffee },
              { label: "Water Supply", icon: Droplet },
              { label: "Comfortable Rooms", icon: Heart },
            ].map((trust, i) => (
              <AnimatedReveal key={i} delay={i * 0.1}>
                <div className="flex flex-col items-center p-8 rounded-[2rem] bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 shadow-xl">
                  <trust.icon size={36} className="mb-5 text-white" />
                  <span className="font-bold text-base sm:text-lg text-white tracking-wide">{trust.label}</span>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STUDENT & EMPLOYEE ACCOMMODATION */}
      <section className="py-32 bg-slate-900 relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <AnimatedReveal>
              <h2 className="text-4xl font-heading font-bold text-white mb-6 drop-shadow-md">Who is it for?</h2>
              <p className="text-xl text-white/60">Tailored accommodation options to suit your lifestyle.</p>
            </AnimatedReveal>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <AnimatedReveal direction="right">
              <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 flex flex-col h-full hover:bg-white/10 transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] group">
                <div className="w-20 h-20 bg-primary/20 text-primary rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                  <BookOpenIcon />
                </div>
                <h3 className="text-3xl font-heading font-bold text-white mb-6">Students</h3>
                <p className="text-white/60 leading-relaxed text-lg flex-grow">
                  {about.studentsDescription}
                </p>
                <div className="mt-10 font-bold text-primary text-3xl drop-shadow-md">{publicContent.roomTypes.find(r => r.id === 'students')?.price || "₹3,500"} <span className="text-lg text-white/40">/ {publicContent.roomTypes.find(r => r.id === 'students')?.period || "Month"}</span></div>
              </div>
            </AnimatedReveal>
            <AnimatedReveal direction="left">
              <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 flex flex-col h-full hover:bg-white/10 transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] group">
                <div className="w-20 h-20 bg-orange-500/20 text-orange-400 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                  <BriefcaseIcon />
                </div>
                <h3 className="text-3xl font-heading font-bold text-white mb-6">Working Professionals</h3>
                <p className="text-white/60 leading-relaxed text-lg flex-grow">
                  {about.professionalsDescription}
                </p>
                <div className="mt-10 font-bold text-orange-400 text-3xl drop-shadow-md">{publicContent.roomTypes.find(r => r.id === 'employees')?.price || "₹5,000"} <span className="text-lg text-white/40">/ {publicContent.roomTypes.find(r => r.id === 'employees')?.period || "Month"}</span></div>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>

      {/* 8. CTA SECTION */}
      <section className="py-32 bg-slate-950 relative border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedReveal>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-8 drop-shadow-md">
              Looking for Safe Accommodation?
            </h2>
            <p className="text-xl text-white/60 mb-12">
              Rooms fill up fast. Get in touch with us today to book your spot!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a 
                href={`tel:${websiteConfig.contact.phone}`}
                className="inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 text-lg font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(14,165,233,0.4)]"
              >
                <Phone size={20} className="mr-3" />
                Call Now
              </a>
              <a 
                href={`https://wa.me/${websiteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 text-lg font-medium bg-white/10 hover:bg-white/20 text-[#22C55E] border border-white/10 rounded-xl backdrop-blur-md transition-all"
              >
                <MessageCircle size={20} className="mr-3" />
                WhatsApp Us
              </a>
            </div>
          </AnimatedReveal>
        </div>
      </section>
      
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
