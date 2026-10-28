"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "200M+", label: "Tracks Indexed" },
  { value: "8ms", label: "Avg. Latency" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "1024", label: "Active Threads" },
];

export default function WhySonar() {
  const container = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    const chars = textRef.current?.querySelectorAll(".m-char");
    if (chars) {
      gsap.fromTo(chars, { opacity: 0.06 }, {
        opacity: 1, stagger: 0.015, ease: "none",
        scrollTrigger: { trigger: textRef.current, start: "top 80%", end: "center center", scrub: true },
      });
    }
    gsap.fromTo(".stat-item", { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".stats-row", start: "top 85%" },
    });
  }, { scope: container });

  const text = "Audio is not just sound. It's infrastructure. Sonar was compiled to bridge the gap between code and emotion, giving you system-level precision over your listening experience.";

  return (
    <section ref={container} className="relative bg-surface border-y border-border-strong overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Manifesto */}
      <div className="py-28 md:py-36 px-6 sm:px-10 md:px-16 lg:px-20 border-b border-border-strong">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-12 border border-border-strong px-3 py-1.5 bg-background flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent animate-pulse" />
            SYSTEM MANIFESTO
          </div>
          <h2 
            ref={textRef}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold leading-[1.3] tracking-tight uppercase text-center"
          >
            {text.split("").map((char, i) => (
              <span key={i} className="m-char">{char}</span>
            ))}
          </h2>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row py-16 md:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-strong border border-border-strong">
          {stats.map((stat, i) => (
            <div key={i} className="stat-item bg-surface p-5 sm:p-8 md:p-10 flex flex-col items-center text-center gap-1.5 md:gap-2 group hover:bg-background transition-colors cursor-default">
              <span className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-foreground tracking-tight group-hover:text-accent transition-colors">
                {stat.value}
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] text-secondary tracking-widest uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
