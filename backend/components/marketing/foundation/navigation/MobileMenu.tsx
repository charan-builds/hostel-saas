import { motion, AnimatePresence } from "framer-motion";
import { websiteConfig } from "@/config/website-config";
import { NavLink } from "./NavLink";
import { NavbarActions } from "./NavbarActions";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

export function MobileMenu({ isOpen, onClose, isLoggedIn }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[60px] z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-[60px] z-50 w-[80%] max-w-sm border-l border-border bg-card shadow-2xl md:hidden"
          >
            <div className="flex h-full flex-col overflow-y-auto px-6 py-8">
              <nav className="flex flex-col gap-2">
                {websiteConfig.mainNav.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    onClick={onClose}
                    isMobile
                  />
                ))}
              </nav>
              
              <div className="mt-auto pt-8 border-t border-border">
                <NavbarActions isLoggedIn={isLoggedIn} isMobile onMobileClick={onClose} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
