import { Check } from "lucide-react";
import { AnimatedReveal } from "../AnimatedReveal";

interface TrustBadgesProps {
  badges: string[];
}

export function TrustBadges({ badges }: TrustBadgesProps) {
  return (
    <div className="flex flex-wrap gap-3 mt-8">
      {badges.map((badge, index) => (
        <AnimatedReveal key={badge} delay={0.4 + index * 0.1} direction="up">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/50 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            <Check size={14} className="text-primary" />
            {badge}
          </div>
        </AnimatedReveal>
      ))}
    </div>
  );
}
