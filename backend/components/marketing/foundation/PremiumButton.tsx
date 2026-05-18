/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ReactNode } from "react";

interface PremiumButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
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
    return (
      <Link href={href as any} className={buttonClasses}>
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
