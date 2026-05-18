import { ReactNode } from "react";
import { AnimatedReveal } from "./AnimatedReveal";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  description?: ReactNode;
  align?: "left" | "center";
}

export function SectionHeading({ title, subtitle, description, align = "center" }: SectionHeadingProps) {
  const alignClasses = align === "center" ? "text-center mx-auto" : "text-left";
  
  return (
    <div className={`mb-12 md:mb-16 max-w-3xl ${alignClasses}`}>
      {subtitle && (
        <AnimatedReveal delay={0.1}>
          <p className="text-sm font-semibold tracking-widest text-accent uppercase mb-3">
            {subtitle}
          </p>
        </AnimatedReveal>
      )}
      <AnimatedReveal delay={0.2}>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground tracking-tight mb-4">
          {title}
        </h2>
      </AnimatedReveal>
      {description && (
        <AnimatedReveal delay={0.3}>
          <div className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed">
            {description}
          </div>
        </AnimatedReveal>
      )}
    </div>
  );
}
