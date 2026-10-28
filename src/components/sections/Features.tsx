"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Sparkles, Compass, Radio, Cpu, Zap, Lock } from "lucide-react";
import { clsx } from "clsx";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: Sparkles, num: "01", title: "AI Playlist Generation", desc: "Describe any mood or context in natural language. The engine compiles a personalized playlist in milliseconds.", tag: "CORE" },
  { icon: Compass, num: "02", title: "Contextual Discovery", desc: "Find music through semantic analysis — not genre checkboxes. Recommendations that actually understand you.", tag: "DISCOVERY" },
  { icon: Radio, num: "03", title: "Terminal-Grade Player", desc: "A distraction-free webplayer with real-time telemetry, stream visualization, and deep-focus engineering.", tag: "INTERFACE" },
  { icon: Cpu, num: "04", title: "Neural Processing", desc: "Custom LLM fine-tuned on 200M+ tracks. Understands BPM, key, harmonic profiles and emotional context.", tag: "ENGINE" },
  { icon: Zap, num: "05", title: "Zero-Latency Streaming", desc: "Pre-compiled audio buffers with predictive caching. The next track loads before you even think about it.", tag: "SPEED" },
  { icon: Lock, num: "06", title: "Encrypted Pipeline", desc: "End-to-end encryption. Your data never leaves the local runtime. No telemetry, no third-party tracking.", tag: "SECURITY" },
];

export default function Features() {
  const container = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useGSAP(() => {
    gsap.fromTo(".feat-head", { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: container.current, start: "top 80%" },
    });
    gsap.fromTo(".feat-card", { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power3.out",
      scrollTrigger: { trigger: ".feat-grid", start: "top 85%" },
    });
  }, { scope: container });

  return (
    <section ref={container} className="relative py-28 md:py-36 px-6 sm:px-10 md:px-16 lg:px-20 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.025)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="feat-head flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 pb-8 border-b border-border-strong">
          <div>
            <div className="inline-flex items-center gap-2 border border-border-strong bg-surface px-2.5 py-1 mb-5">
              <span className="w-1.5 h-1.5 bg-accent" />
              <span className="font-mono text-[10px] tracking-widest text-secondary uppercase">Section // Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-foreground leading-[0.95]">
              Intelligent by <span className="text-accent">Design</span>
            </h2>
          </div>
          <p className="font-mono text-sm text-secondary max-w-md leading-relaxed border-l-2 border-accent pl-5">
            Every feature is engineered to eliminate the friction between you and the perfect audio environment.
          </p>
        </div>

        {/* 6-card grid */}
        <div className="feat-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <div
              key={i}
              className={clsx(
                "feat-card group relative p-7 md:p-8 border bg-background cursor-default transition-all duration-300",
                hovered === i
                  ? "border-accent shadow-[4px_4px_0_#6236F4] -translate-y-1"
                  : "border-border-strong hover:border-foreground/30"
              )}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={clsx(
                  "w-11 h-11 border flex items-center justify-center transition-all duration-300",
                  hovered === i ? "border-accent bg-accent/10" : "border-border-strong bg-surface"
                )}>
                  <feat.icon className={clsx("w-5 h-5 transition-colors", hovered === i ? "text-accent" : "text-secondary")} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-secondary/50 tracking-widest uppercase">{feat.tag}</span>
                  <span className="font-mono text-xs text-accent font-bold">{feat.num}</span>
                </div>
              </div>
              <h3 className={clsx(
                "text-base md:text-lg font-display font-bold uppercase tracking-tight mb-3 transition-colors",
                hovered === i ? "text-accent" : "text-foreground"
              )}>
                {feat.title}
              </h3>
              <p className="font-mono text-xs text-secondary leading-relaxed">{feat.desc}</p>
              
              {/* Growing accent line */}
              <div className={clsx(
                "absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-500",
                hovered === i ? "w-full" : "w-0"
              )} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
