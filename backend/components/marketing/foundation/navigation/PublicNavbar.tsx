"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTenantCMS } from "@/components/providers/tenant-provider";
import { NavLink } from "./NavLink";
import { NavbarActions } from "./NavbarActions";
import { MobileMenu } from "./MobileMenu";

interface PublicNavbarProps {
  isLoggedIn?: boolean;
}

export function PublicNavbar({ isLoggedIn = false }: PublicNavbarProps) {
  const { websiteConfig } = useTenantCMS();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-700 ease-in-out ${
          isScrolled || isMobileMenuOpen
            ? "bg-slate-900/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] py-4"
            : "bg-gradient-to-b from-black/60 to-transparent py-8"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className={`text-2xl md:text-3xl font-heading font-extrabold tracking-tight transition-colors duration-500 text-white drop-shadow-md group-hover:text-[#0EA5E9]`}>
                {websiteConfig.logo}
              </span>
              <span className={`hidden lg:inline-block ml-3 pl-3 border-l border-white/30 text-sm font-medium tracking-wide text-white/90 drop-shadow-sm`}>
                Premium Boys Hostel
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            {websiteConfig.mainNav.map((item) => (
              <NavLink key={item.href} href={item.href} title={item.title} />
            ))}
          </nav>

          <div className="flex items-center">
            <NavbarActions isLoggedIn={isLoggedIn} />

            <button
              className="ml-4 md:hidden text-white p-2 -mr-2 rounded-xl hover:bg-white/10 transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
      />
    </>
  );
}
