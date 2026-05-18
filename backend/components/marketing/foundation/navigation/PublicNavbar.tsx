"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { websiteConfig } from "@/config/website-config";
import { NavLink } from "./NavLink";
import { NavbarActions } from "./NavbarActions";
import { MobileMenu } from "./MobileMenu";

interface PublicNavbarProps {
  isLoggedIn?: boolean;
}

export function PublicNavbar({ isLoggedIn = false }: PublicNavbarProps) {
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
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-card/90 backdrop-blur-md border-b border-border shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl md:text-2xl font-serif font-semibold text-foreground tracking-tight transition-colors group-hover:text-primary">
                {websiteConfig.logo}
              </span>
              <span className="hidden lg:inline-block ml-3 pl-3 border-l border-border/50 text-sm font-medium text-muted-foreground">
                {websiteConfig.name}
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {websiteConfig.mainNav.map((item) => (
              <NavLink key={item.href} href={item.href} title={item.title} />
            ))}
          </nav>

          <div className="flex items-center">
            <NavbarActions isLoggedIn={isLoggedIn} />

            <button
              className="ml-4 md:hidden text-foreground p-2 -mr-2 rounded-md hover:bg-muted/50 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
