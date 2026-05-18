import { AnimatedReveal } from "../AnimatedReveal";

interface HeroStatsProps {
  stats: { label: string; value: string }[];
}

export function HeroStats({ stats }: HeroStatsProps) {
  return (
    <div className="mt-12 flex items-center gap-8 border-t border-border/40 pt-8">
      {stats.map((stat, index) => (
        <AnimatedReveal key={stat.label} delay={0.5 + index * 0.1} direction="up">
          <div className="flex flex-col">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {stat.value}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </span>
          </div>
        </AnimatedReveal>
      ))}
    </div>
  );
}
