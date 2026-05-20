import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PremiumButton } from "../PremiumButton";
import { useTenantCMS } from "@/components/providers/tenant-provider";

interface NavbarActionsProps {
  isLoggedIn: boolean;
  isMobile?: boolean;
  onMobileClick?: () => void;
}

export function NavbarActions({ isLoggedIn, isMobile = false, onMobileClick }: NavbarActionsProps) {
  const { websiteConfig } = useTenantCMS();
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
      <button 
        className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
        aria-label="Switch Language"
      >
        <span className="text-lg">EN</span>
      </button>

      <a
        href={`https://wa.me/${websiteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-[#22C55E] transition-colors"
      >
        <MessageCircle size={18} className="text-[#22C55E]" />
        <span className={isMobile ? "text-lg text-foreground" : ""}>WhatsApp</span>
      </a>
      
      <Link
        href="/login"
        className={`text-sm font-medium text-white/80 hover:text-white transition-colors ${isMobile ? "text-lg py-2 text-foreground" : ""}`}
        {...(onMobileClick ? { onClick: () => onMobileClick() } : {})}
      >
        Log in
      </Link>
    </div>
  );
}
