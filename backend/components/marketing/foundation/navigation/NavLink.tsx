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
        className={`block px-5 py-4 text-xl transition-all duration-300 ${
          isActive
            ? "text-[#0EA5E9] font-bold bg-[#0EA5E9]/10 rounded-xl"
            : "text-foreground hover:text-[#0EA5E9] hover:bg-slate-100 rounded-xl"
        }`}
      >
        {title}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group relative px-2 py-2 text-sm md:text-base font-bold tracking-wide transition-colors duration-300 ${
        isActive ? "text-white" : "text-white/70 hover:text-white"
      }`}
    >
      {title}
      {isActive && (
        <motion.div
          layoutId="navbar-active-indicator"
          className="absolute -bottom-2 left-0 right-0 h-[3px] bg-[#0EA5E9] rounded-full"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <div className="absolute -bottom-2 left-0 right-0 h-[3px] origin-left scale-x-0 bg-[#0EA5E9]/50 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </Link>
  );
}
