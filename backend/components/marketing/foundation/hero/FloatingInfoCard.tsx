"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { GlassCard } from "../GlassCard";

interface FloatingInfoCardProps {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  position: "top-left" | "bottom-right";
  delay?: number;
}

export function FloatingInfoCard({ icon, title, subtitle, position, delay = 0 }: FloatingInfoCardProps) {
  const positionClasses = 
    position === "top-left" 
      ? "absolute top-[10%] -left-[5%] md:-left-[10%] z-20 hidden md:block" 
      : "absolute bottom-[10%] -right-[5%] md:-right-[10%] z-20 hidden md:block";

  const floatAnimation = position === "top-left" ? [0, -10, 0] : [0, 10, 0];

  return (
    <motion.div
      initial={{ opacity: 0, x: position === "top-left" ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={positionClasses}
    >
      <motion.div
        animate={{ y: floatAnimation }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <GlassCard className="flex items-center gap-4 px-5 py-4 shadow-xl">
          {icon && (
            <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
              {icon}
            </div>
          )}
          <div>
            <p className="text-base font-bold text-foreground leading-tight">{title}</p>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
