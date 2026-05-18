import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PremiumButton } from "../PremiumButton";
import { websiteConfig } from "@/config/website-config";

interface NavbarActionsProps {
  isLoggedIn: boolean;
  isMobile?: boolean;
  onMobileClick?: () => void;
}

export function NavbarActions({ isLoggedIn, isMobile = false, onMobileClick }: NavbarActionsProps) {
  const containerClass = isMobile ? "flex flex-col gap-4 mt-6" : "hidden md:flex items-center gap-6";

  if (isLoggedIn) {
    return (
      <div className={containerClass}>
        <PremiumButton href="/dashboard" variant="primary" {...(onMobileClick ? { onClick: onMobileClick } : {})}>
          Dashboard
        </PremiumButton>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <a
        href={`https://wa.me/${websiteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        <MessageCircle size={18} className="text-primary" />
        <span className={isMobile ? "text-lg" : ""}>WhatsApp Us</span>
      </a>
      
      <Link
        href="/login"
        className={`text-sm font-medium text-foreground hover:text-primary transition-colors ${isMobile ? "text-lg py-2" : ""}`}
        {...(onMobileClick ? { onClick: () => onMobileClick() } : {})}
      >
        Log in
      </Link>
      
      <PremiumButton href="/book" variant="primary" {...(onMobileClick ? { onClick: onMobileClick } : {})}>
        Book Visit
      </PremiumButton>
    </div>
  );
}
