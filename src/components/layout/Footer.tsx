"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const footerLinks = [
  { title: "Product", links: [{ name: "Webplayer", href: "/webplayer" }, { name: "Features", href: "/features" }, { name: "Changelog", href: "#" }, { name: "Roadmap", href: "#" }] },
  { title: "Company", links: [{ name: "About", href: "#" }, { name: "Blog", href: "#" }, { name: "Careers", href: "#" }, { name: "Support", href: "/support" }] },
  { title: "Connect", links: [{ name: "Twitter / X", href: "#" }, { name: "GitHub", href: "#" }, { name: "Discord", href: "#" }, { name: "LinkedIn", href: "#" }] },
  { title: "Legal", links: [{ name: "Privacy", href: "#" }, { name: "Terms", href: "#" }, { name: "Cookies", href: "#" }] },
];

export default function Footer() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".footer-el", { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power3.out",
      scrollTrigger: { trigger: container.current, start: "top 90%" },
    });
  }, { scope: container });

  return (
    <footer ref={container} className="relative bg-surface border-t border-border-strong text-secondary overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="relative z-10 px-6 sm:px-10 md:px-16 lg:px-20">
        
        {/* CTA Strip */}
        <div className="footer-el py-12 md:py-16 border-b border-border-strong flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight text-foreground mb-2">
              Ready to rewrite your <span className="text-accent">audio?</span>
            </h3>
            <p className="font-mono text-xs text-secondary max-w-md leading-relaxed">
              Join the engineering preview. Limited allocation for early adopters.
            </p>
          </div>
          <Link
            href="/signup"
            className="group relative flex items-center gap-3 bg-foreground text-background px-6 py-3.5 font-mono text-xs font-bold tracking-[0.12em] uppercase transition-transform hover:-translate-y-0.5 hover:translate-x-0.5 shrink-0"
          >
            <div className="absolute inset-0 bg-accent translate-y-[4px] -translate-x-[4px] -z-10 group-hover:translate-y-[2px] group-hover:-translate-x-[2px] transition-transform" />
            <span>Get Access</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Main Grid */}
        <div className="py-12 md:py-16 border-b border-border-strong grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6">
          {/* Logo Block */}
          <div className="footer-el col-span-2 md:col-span-4 flex flex-col gap-4 pr-8">
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground shrink-0">
                <path d="M0 0H12V12H24V24H12V12H0V0Z" fill="currentColor" />
                <path d="M12 0H24V12L12 0Z" fill="#6236F4" />
                <path d="M0 12H12V24L0 12Z" fill="#6236F4" />
              </svg>
              <span className="text-xl font-display font-black uppercase tracking-tight text-foreground">SONAR<span className="text-accent">_</span></span>
            </div>
            <p className="font-mono text-[11px] text-secondary leading-relaxed">
              AI-powered music discovery and playlist generation. Describe any mood, context, or vibe — get a perfect playlist in milliseconds.
            </p>
            <div className="flex items-center gap-3 mt-2">
              {["X", "GH", "DC"].map((s, i) => (
                <a key={i} href="#" className="w-8 h-8 border border-border-strong bg-background flex items-center justify-center font-mono text-[9px] text-secondary hover:border-accent hover:text-accent transition-colors">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col, i) => (
            <div key={i} className="footer-el col-span-1 md:col-span-2 flex flex-col gap-3">
              <span className="font-mono text-[10px] tracking-widest text-accent uppercase font-bold">{col.title}</span>
              <div className="flex flex-col gap-2.5 font-mono text-xs uppercase text-secondary">
                {col.links.map((link, j) => (
                  <Link key={j} href={link.href} className="hover:text-foreground hover:pl-1 transition-all w-fit">{link.name}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase text-secondary/40">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              All Systems Online
            </span>
            <span className="w-6 h-[1px] bg-border-strong" />
            <span>Nodes: 1,402</span>
            <span className="w-6 h-[1px] bg-border-strong" />
            <span>Latency: 8ms</span>
          </div>
          <span className="font-mono text-[9px] text-secondary/40 uppercase">
            &copy; {new Date().getFullYear()} Sonar Labs. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
