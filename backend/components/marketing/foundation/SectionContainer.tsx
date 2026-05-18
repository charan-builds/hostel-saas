import { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  background?: "default" | "muted" | "primary" | "secondary";
  id?: string;
}

export function SectionContainer({ children, className = "", background = "default", id }: SectionContainerProps) {
  const bgColors = {
    default: "bg-background text-foreground",
    muted: "bg-muted text-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
  };

  return (
    <section id={id} className={`py-16 md:py-24 lg:py-32 ${bgColors[background]} ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
