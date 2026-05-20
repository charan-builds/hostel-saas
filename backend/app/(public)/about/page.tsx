"use client";

import { Phone, MessageCircle, MapPin, Shield, Sparkles, Map, Users, Heart, IndianRupee, Video, Wifi, Droplet, Coffee, ArrowRight } from "lucide-react";
import { useTenantCMS } from "@/components/providers/tenant-provider";
import { AnimatedReveal } from "@/components/marketing/foundation/AnimatedReveal";
import { OptimizedImage } from "@/components/marketing/shared/optimized-image";

export default function AboutPage() {
  const { websiteConfig, publicContent } = useTenantCMS();
  const { about } = publicContent;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      
      {/* 1. HERO BANNER - CINEMATIC DARK */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 lg:pt-56 lg:pb-40 flex items-center justify-center overflow-hidden bg-slate-900 min-h-[60vh]">
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src={publicContent.hero.image} 
            alt="Hostel Building"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            wrapperClassName="w-full h-[120%]"
          />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.55)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.7)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <AnimatedReveal delay={0.1}>
            <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-2 text-xs md:text-sm font-bold tracking-[0.2em] text-white backdrop-blur-md uppercase shadow-lg">
              {about.badge}
            </div>
          </AnimatedReveal>

          <AnimatedReveal delay={0.2}>
            <h1 className="mb-6 text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold text-white tracking-tight drop-shadow-2xl max-w-5xl leading-[1.1]">
              {about.heroTitle}
            </h1>
          </AnimatedReveal>

          <AnimatedReveal delay={0.3}>
            <p className="mb-10 text-lg sm:text-xl md:text-3xl text-white max-w-3xl mx-auto drop-shadow-md font-light leading-relaxed">
              {about.heroSubtitle}
            </p>
          </AnimatedReveal>
        </div>
      </section>

      {/* 2. OUR STORY SECTION - LIGHT & ELEGANT */}
      <section className="py-20 md:py-32 bg-[#F8FAFC] relative overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-[#0EA5E9]/5 blur-[80px] pointer-events-none mix-blend-multiply" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-center">
            <AnimatedReveal direction="right">
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200/60 group">
                <OptimizedImage
                  src={about.storyImage} 
                  alt="Students relaxing"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-[0.21,0.47,0.32,0.98]"
                  wrapperClassName="w-full h-full absolute inset-0"
                />
              </div>
            </AnimatedReveal>
            <AnimatedReveal direction="left">
              <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold tracking-[0.2em] text-[#0EA5E9] uppercase shadow-sm">
                OUR MISSION
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 mb-8 drop-shadow-sm leading-tight">
                {about.storyTitle}
              </h2>
              <div className="prose prose-lg md:prose-xl text-slate-600 font-normal max-w-none">
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

      {/* 3. WHY CHOOSE US - DEEP DARK */}
      <section className="py-20 md:py-32 bg-slate-950 border-t border-white/5 relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#F97316]/5 blur-[80px] pointer-events-none mix-blend-screen" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <AnimatedReveal>
              <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.2em] text-[#0EA5E9] uppercase backdrop-blur-md">
                THE DIFFERENCE
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white drop-shadow-lg leading-tight">
                Why Choose Us
              </h2>
              <p className="mt-6 text-lg md:text-2xl text-white/60 font-light leading-relaxed">
                Everything you need for a hassle-free stay.
              </p>
            </AnimatedReveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {[
              { title: "Safe & Secure", icon: Shield, desc: "24/7 CCTV surveillance and secure entry." },
              { title: "Clean & Hygienic", icon: Sparkles, desc: "Daily room cleaning and sanitized washrooms." },
              { title: "Prime Location", icon: Map, desc: "Walking distance to major colleges." },
              { title: "Student Friendly", icon: Users, desc: "A quiet environment perfect for studying." },
              { title: "Comfortable Living", icon: Heart, desc: "Spacious rooms with proper ventilation." },
              { title: "Affordable Pricing", icon: IndianRupee, desc: "Value for money with no hidden charges." },
            ].map((feature, i) => (
              <AnimatedReveal key={i} delay={i * 0.1}>
                <div className="bg-white/5 p-8 md:p-10 rounded-[2.5rem] border border-white/20 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] group h-full">
                  <div className="w-16 h-16 bg-[#0EA5E9]/10 rounded-2xl flex items-center justify-center text-[#0EA5E9] mb-8 group-hover:bg-[#0EA5E9] group-hover:text-white transition-colors duration-500 shadow-[0_0_20px_rgba(14,165,233,0.1)] group-hover:shadow-[0_0_30px_rgba(14,165,233,0.4)]">
                    <feature.icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4 group-hover:text-[#0EA5E9] transition-colors">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed text-lg font-light">{feature.desc}</p>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LOCATION HIGHLIGHT - PRISTINE WHITE */}
      <section className="py-20 md:py-32 bg-[#FFFFFF] relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedReveal>
            <div className="bg-[#F8FAFC] p-10 sm:p-16 md:p-20 rounded-[3rem] border border-slate-200/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden group hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] transition-all duration-700 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0EA5E9]/5 rounded-full blur-[80px] -z-10 group-hover:bg-[#0EA5E9]/10 transition-colors duration-700" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F97316]/5 rounded-full blur-[80px] -z-10 group-hover:bg-[#F97316]/10 transition-colors duration-700" />
              
              <MapPin size={56} className="mx-auto text-[#0EA5E9] mb-8 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-slate-900 mb-10 leading-tight">
                {about.locationBadge}
              </h2>
              <ul className="space-y-6 text-lg md:text-2xl text-slate-600 font-light inline-block text-left mb-12">
                {about.locationHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center mr-5 shrink-0 text-[#0EA5E9]">
                      <ArrowRight size={20} />
                    </div>
                    {highlight}
                  </li>
                ))}
              </ul>

              {about.locationNote && (
                <div className="mt-4 inline-block bg-red-50 border border-red-100 text-red-600 px-8 py-5 rounded-2xl shadow-sm">
                  <p className="font-bold text-base md:text-lg flex items-center justify-center">
                    {about.locationNote}
                  </p>
                </div>
              )}
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* 5. TRUST SECTION - VIBRANT PRIMARY */}
      <section className="py-20 md:py-24 bg-[#0EA5E9] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none mix-blend-overlay" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 text-center">
            {[
              { label: "24/7 CCTV", icon: Video },
              { label: "High-Speed WiFi", icon: Wifi },
              { label: "Hygienic Food", icon: Coffee },
              { label: "Water Supply", icon: Droplet },
              { label: "Comfort Rooms", icon: Heart },
            ].map((trust, i) => (
              <AnimatedReveal key={i} delay={i * 0.1}>
                <div className="flex flex-col items-center p-6 md:p-8 rounded-[2rem] bg-white/10 border border-white/20 backdrop-blur-lg hover:bg-white/20 hover:-translate-y-2 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] h-full justify-center">
                  <trust.icon size={36} className="mb-4 md:mb-6 text-white drop-shadow-md" strokeWidth={1.5} />
                  <span className="font-bold text-sm md:text-lg text-white tracking-wide">{trust.label}</span>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STUDENT & EMPLOYEE ACCOMMODATION - LIGHT & LAYERED */}
      <section className="py-20 md:py-32 bg-[#F8FAFC] relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-24">
            <AnimatedReveal>
              <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold tracking-[0.2em] text-[#F97316] uppercase shadow-sm">
                TAILORED FOR YOU
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-slate-900 mb-6 drop-shadow-sm leading-tight">Who is it for?</h2>
              <p className="text-lg md:text-2xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">Tailored accommodation options to suit your lifestyle.</p>
            </AnimatedReveal>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <AnimatedReveal direction="right">
              <div className="bg-white p-10 lg:p-12 rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] flex flex-col h-full hover:-translate-y-2 transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] group">
                <div className="w-20 h-20 bg-[#0EA5E9]/10 text-[#0EA5E9] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-[#0EA5E9] group-hover:text-white">
                  <BookOpenIcon />
                </div>
                <h3 className="text-3xl font-heading font-bold text-slate-900 mb-4">Students</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-normal flex-grow">
                  {about.studentsDescription}
                </p>
                <div className="mt-10 font-extrabold text-[#0EA5E9] text-5xl drop-shadow-sm">{publicContent.roomTypes.find(r => r.id === 'students')?.price || "₹3,500"} <span className="text-xl font-medium text-slate-400">/ {publicContent.roomTypes.find(r => r.id === 'students')?.period || "Month"}</span></div>
              </div>
            </AnimatedReveal>
            <AnimatedReveal direction="left">
              <div className="bg-white p-10 lg:p-12 rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] flex flex-col h-full hover:-translate-y-2 transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] group">
                <div className="w-20 h-20 bg-[#F97316]/10 text-[#F97316] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-[#F97316] group-hover:text-white">
                  <BriefcaseIcon />
                </div>
                <h3 className="text-3xl font-heading font-bold text-slate-900 mb-4">Working Professionals</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-normal flex-grow">
                  {about.professionalsDescription}
                </p>
                <div className="mt-10 font-extrabold text-[#F97316] text-5xl drop-shadow-sm">{publicContent.roomTypes.find(r => r.id === 'employees')?.price || "₹5,000"} <span className="text-xl font-medium text-slate-400">/ {publicContent.roomTypes.find(r => r.id === 'employees')?.period || "Month"}</span></div>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>
      
    </div>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
