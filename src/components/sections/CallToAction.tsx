"use client";

import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function CallToAction() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".cta-inner", { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: container.current, start: "top 80%" },
    });
  }, { scope: container });

  return (
    <section ref={container} className="relative py-28 md:py-36 px-6 sm:px-10 md:px-16 lg:px-20 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.025)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="relative z-10 w-full">
        <div className="cta-inner border border-border-strong bg-surface relative overflow-hidden p-8 sm:p-12 md:p-16 lg:p-20 flex flex-col items-center text-center w-full">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-b border-r border-accent" />
          <div className="absolute top-0 right-0 w-6 h-6 border-b border-l border-accent" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-t border-r border-accent" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-t border-l border-accent" />
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-border-strong bg-background px-2.5 py-1 mb-8">
              <Terminal className="w-3 h-3 text-accent" />
              <span className="font-mono text-[10px] tracking-widest text-accent uppercase">Early Access</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-foreground leading-[0.95] mb-5">
              Enter the <span className="text-accent">System</span>
            </h2>
            
            <p className="font-mono text-sm text-secondary mb-12 max-w-xl leading-relaxed">
              The engineering preview is live. Join the neural audio mainframe and rewrite how you experience music. Limited allocation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <Link 
                href="/signup"
                className="group w-full sm:w-auto relative flex items-center justify-center gap-3 bg-foreground text-background px-8 md:px-10 py-4 font-mono text-sm font-bold tracking-[0.12em] uppercase transition-transform hover:-translate-y-0.5 hover:translate-x-0.5"
              >
                <div className="absolute inset-0 bg-accent translate-y-[5px] -translate-x-[5px] -z-10 group-hover:translate-y-[2px] group-hover:-translate-x-[2px] transition-transform" />
                <span>Execute Access</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/webplayer"
                className="flex items-center w-full sm:w-auto justify-center gap-3 px-8 md:px-10 py-4 font-mono text-sm tracking-[0.12em] uppercase border border-border-strong bg-background text-foreground hover:border-accent hover:bg-surface-elevated transition-colors"
              >
                Open Player
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
