import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className = "", hoverEffect = false }: GlassCardProps) {
  const hoverStyles = hoverEffect ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-1" : "";
  
  return (
    <div className={`bg-card/80 backdrop-blur-md border border-border/50 shadow-sm rounded-lg overflow-hidden ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
