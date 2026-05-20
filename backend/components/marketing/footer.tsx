"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useTenantCMS } from "@/components/providers/tenant-provider";

export function Footer() {
  const { websiteConfig } = useTenantCMS();

  return (
    <footer className="relative bg-slate-950 text-white/70 pt-20 md:pt-32 pb-12 border-t border-white/5 overflow-hidden">
      {/* Deep cinematic background lighting - subtle */}
      <div className="absolute top-0 left-1/4 w-1/3 h-1/2 bg-[#0EA5E9]/5 blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-1/3 h-1/2 bg-[#F97316]/5 blur-[100px] pointer-events-none mix-blend-screen" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Massive Ending CTA */}
        <div className="mb-20 md:mb-24 pb-16 md:pb-20 border-b border-white/10 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-6 tracking-tight drop-shadow-md leading-tight">
            Ready to Move In?
          </h2>
          <p className="text-xl md:text-2xl text-white/60 mb-10 max-w-2xl font-light leading-relaxed">
            Secure your spot today and experience premium student living tailored for your success.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href={`tel:${websiteConfig.contact.phone}`}
              className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 text-lg font-bold text-white bg-[#0EA5E9] rounded-2xl overflow-hidden transition-all shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(14,165,233,0.5)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <span className="relative z-10">Call to Book</span>
              <ArrowRight size={20} className="ml-3 relative z-10 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href={`https://wa.me/${websiteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 text-lg font-bold bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <MessageCircle size={20} className="mr-3 text-[#22C55E]" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl md:text-3xl font-heading font-extrabold text-white drop-shadow-md tracking-tight">
                {websiteConfig.name.toUpperCase()}
              </span>
            </Link>
            <p className="max-w-sm text-base text-white/70 mb-8 leading-relaxed font-light">
              {websiteConfig.description}
            </p>
            <div className="flex gap-4">
              <a
                href={websiteConfig.links.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#0EA5E9] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(14,165,233,0.3)]"
              >
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
              <a
                href={websiteConfig.links.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#0EA5E9] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(14,165,233,0.3)]"
              >
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-white/60 tracking-[0.2em] uppercase mb-6">
              Explore
            </h3>
            <ul className="space-y-4">
              {websiteConfig.mainNav.slice(0, 4).map((item) => (
                <li key={item.title}>
                  <Link href={item.href as Route} className="text-base font-normal text-white/80 hover:text-[#0EA5E9] hover:translate-x-1 transition-all duration-300 inline-block">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-white/60 tracking-[0.2em] uppercase mb-6">
              Important Links
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-base font-normal text-white/80 hover:text-[#0EA5E9] hover:translate-x-1 transition-all duration-300 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base font-normal text-white/80 hover:text-[#0EA5E9] hover:translate-x-1 transition-all duration-300 inline-block">
                  Contact
                </Link>
              </li>
              <li>
                <Link href={"/terms" as Route} className="text-base font-normal text-white/80 hover:text-[#0EA5E9] hover:translate-x-1 transition-all duration-300 inline-block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white/60 tracking-[0.2em] uppercase mb-6">
              Location
            </h3>
            <ul className="space-y-4">
              <li className="text-base font-light text-white/80">
                <span className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-widest">Address</span>
                {websiteConfig.contact.address}
                <div className="mt-2 text-sm text-[#F97316] font-semibold">
                  Near Loyola Polytechnic College
                </div>
              </li>
              <li className="text-base font-light text-white/80 pt-4">
                <span className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-widest">Phone</span>
                <a href={`tel:${websiteConfig.contact.phone}`} className="hover:text-[#0EA5E9] transition-colors duration-300 block text-lg font-bold text-white">
                  {websiteConfig.contact.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 md:mt-24 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-white/60 tracking-wide">
            &copy; {new Date().getFullYear()} {websiteConfig.name}. All rights reserved.
          </p>
          <p className="text-sm font-medium text-white/60 tracking-wide">
            Professionally managed accommodation.
          </p>
        </div>
      </div>
    </footer>
  );
}
