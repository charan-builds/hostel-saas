import Link from "next/link";
import type { Route } from "next";
import { ReactNode } from "react";

type ExternalHref =
  | `http://${string}`
  | `https://${string}`
  | `mailto:${string}`
  | `tel:${string}`;

interface PremiumButtonProps {
  children: ReactNode;
  href?: ExternalHref | Route;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
}

function isExternalHref(href: ExternalHref | Route): href is ExternalHref {
  return /^(https?:|mailto:|tel:)/.test(href);
}

export function PremiumButton({ children, href, onClick, variant = "primary", className = "" }: PremiumButtonProps) {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm md:text-base font-medium rounded-sm transition-all duration-300";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border text-foreground hover:bg-muted",
    ghost: "text-foreground hover:text-primary hover:bg-muted/50",
  };

  const buttonClasses = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    if (isExternalHref(href)) {
      return (
        <a
          className={buttonClasses}
          href={href}
          {...(onClick ? { onClick } : {})}
          rel="noreferrer"
          target="_blank"
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={buttonClasses} {...(onClick ? { onClick } : {})}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  );
}
