import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface NavLinkProps {
  href: Route;
  title: string;
  onClick?: () => void;
  isMobile?: boolean;
}

export function NavLink({ href, title, onClick, isMobile = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (isMobile) {
    return (
      <Link
        href={href}
        {...(onClick ? { onClick: () => onClick() } : {})}
        className={`block px-4 py-3 text-lg transition-colors ${
          isActive
            ? "text-primary font-semibold"
            : "text-foreground hover:text-primary hover:bg-muted/50 rounded-md"
        }`}
      >
        {title}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group relative px-1 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
    >
      {title}
      {isActive && (
        <motion.div
          layoutId="navbar-active-indicator"
          className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary"
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <div className="absolute -bottom-1 left-0 right-0 h-[2px] origin-left scale-x-0 bg-primary/50 transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </Link>
  );
}
