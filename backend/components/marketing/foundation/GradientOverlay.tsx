interface GradientOverlayProps {
  direction?: "top" | "bottom" | "left" | "right" | "radial";
  intensity?: "light" | "medium" | "dark";
  className?: string;
}

export function GradientOverlay({ direction = "bottom", intensity = "medium", className = "" }: GradientOverlayProps) {
  const directions = {
    top: "bg-gradient-to-b",
    bottom: "bg-gradient-to-t",
    left: "bg-gradient-to-r",
    right: "bg-gradient-to-l",
    radial: "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]",
  };

  const intensities = {
    light: "from-background/60 via-background/20 to-transparent",
    medium: "from-background/80 via-background/40 to-transparent",
    dark: "from-background via-background/60 to-transparent",
  };

  return (
    <div className={`absolute inset-0 pointer-events-none ${directions[direction]} ${intensities[intensity]} ${className}`} />
  );
}
