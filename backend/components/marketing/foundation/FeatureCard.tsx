import { ReactNode } from "react";
import { GlassCard } from "./GlassCard";

interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className = "" }: FeatureCardProps) {
  return (
    <GlassCard hoverEffect className={`p-6 md:p-8 ${className}`}>
      {icon && (
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-muted text-primary">
          {icon}
        </div>
      )}
      <h3 className="mb-3 text-xl font-serif text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </GlassCard>
  );
}
