"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const links = [
    { name: "01 / HOME", href: "/" },
    { name: "02 / FEATURES", href: "/features" },
    { name: "03 / WEBPLAYER", href: "/webplayer" },
    { name: "04 / SUPPORT", href: "/support" },
  ];

  return (
    <>
      <nav 
        className={clsx(
          "fixed top-0 left-0 right-0 z-[999] flex items-center justify-between pointer-events-none transition-all duration-200",
          scrolled || mobileMenuOpen
            ? "h-20 bg-background border-b border-border-strong" 
            : "h-24 bg-background border-b border-border-strong"
        )}
      >
        <div className="flex items-center h-full border-r border-border-strong px-4 sm:px-10 pointer-events-auto bg-surface">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="group flex items-center gap-3 sm:gap-4">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-foreground transition-transform duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:rotate-180"
            >
              <path d="M0 0H12V12H24V24H12V12H0V0Z" fill="currentColor" />
              <path d="M12 0H24V12L12 0Z" fill="#6236F4" />
              <path d="M0 12H12V24L0 12Z" fill="#6236F4" />
            </svg>
            <span className="text-xl font-display font-black tracking-tight text-foreground uppercase">
              SONAR
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center h-full pointer-events-auto flex-1 px-8 gap-8 bg-background">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "text-xs font-mono tracking-widest transition-colors uppercase hover:text-accent",
                pathname === link.href 
                  ? "text-accent" 
                  : "text-secondary"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center h-full pointer-events-auto bg-surface">
          <Link 
            href="/login" 
            className="h-full hidden md:flex items-center px-8 border-l border-border-strong text-xs font-mono tracking-widest text-secondary hover:text-foreground hover:bg-surface-elevated transition-none uppercase"
          >
            [ LOGIN ]
          </Link>
          <Link 
            href="/signup" 
            className="h-full hidden sm:flex items-center px-6 md:px-8 bg-foreground text-background text-[10px] md:text-xs font-mono font-bold tracking-widest hover:bg-accent hover:text-white transition-none uppercase gap-2 md:gap-3 group border-l border-x border-border-strong"
          >
            <span>INIT_PLAYER</span>
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 md:ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-full flex items-center justify-center px-6 border-l border-border-strong text-foreground hover:text-accent transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 z-[998] bg-background pt-24 px-6 pb-12 transition-all duration-300 flex flex-col lg:hidden",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none -translate-y-4"
        )}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.025)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        
        <div className="flex-1 flex flex-col justify-center gap-8 relative z-10">
          {links.map((link, i) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-center gap-4 border-b border-border-strong pb-4 overflow-hidden"
              style={{ transitionDelay: `${i * 50}ms`, transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)', opacity: mobileMenuOpen ? 1 : 0, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <span className="font-mono text-xs text-secondary group-hover:text-accent transition-colors">0{i+1}</span>
              <span className={clsx(
                "text-3xl sm:text-4xl font-display font-black uppercase tracking-tight transition-colors",
                pathname === link.href ? "text-accent" : "text-foreground group-hover:text-accent"
              )}>
                {link.name.split(" / ")[1]}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:hidden gap-4 relative z-10" style={{ transitionDelay: '300ms', transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)', opacity: mobileMenuOpen ? 1 : 0, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <Link 
            href="/signup" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between w-full p-5 border border-border-strong bg-foreground text-background font-mono text-sm font-bold uppercase tracking-widest"
          >
            <span>INIT_PLAYER</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/login" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center w-full p-4 border border-border-strong bg-surface font-mono text-sm uppercase tracking-widest text-secondary"
          >
            [ LOGIN ]
          </Link>
        </div>
      </div>
    </>
  );
}
