"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Terminal, Wand2 } from "lucide-react";
import { clsx } from "clsx";

gsap.registerPlugin(ScrollTrigger);

const prompts = [
  { cmd: "generate dark_focus --bpm 110 --no-vocals", mood: "Deep Focus", tracks: 12, dur: "48 min" },
  { cmd: "init sunset_drive --genre synthwave", mood: "Retro Wave", tracks: 8, dur: "32 min" },
  { cmd: "load gym_session // aggression=high", mood: "High Energy", tracks: 15, dur: "62 min" },
  { cmd: "compile ambient_rain --key Cmin --tempo slow", mood: "Ambient", tracks: 10, dur: "45 min" },
];

export default function AiExperience() {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % prompts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const target = prompts[active].cmd;
    setTyped("");
    let i = 0;
    const timer = setInterval(() => {
      if (i <= target.length) { setTyped(target.substring(0, i)); i++; }
      else { clearInterval(timer); }
    }, 25);
    return () => clearInterval(timer);
  }, [active]);

  useGSAP(() => {
    gsap.fromTo(".ai-head", { opacity: 0, y: 25 }, {
      opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
      scrollTrigger: { trigger: container.current, start: "top 80%" },
    });
    gsap.fromTo(".ai-panel", { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: ".ai-grid", start: "top 85%" },
    });
  }, { scope: container });

  return (
    <section ref={container} className="relative py-28 md:py-36 px-6 sm:px-10 md:px-16 lg:px-20 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.025)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="ai-head flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 pb-8 border-b border-border-strong">
          <div>
            <div className="inline-flex items-center gap-2 border border-border-strong bg-surface px-2.5 py-1 mb-5">
              <Wand2 className="w-3 h-3 text-accent" />
              <span className="font-mono text-[10px] tracking-widest text-accent uppercase">Neural Engine</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-foreground leading-[0.95]">
              Command <span className="text-accent">the Audio</span>
            </h2>
          </div>
          <p className="font-mono text-sm text-secondary max-w-md leading-relaxed border-l-2 border-accent pl-5">
            Stop scrolling through genres. Describe what you need in plain language and let the neural engine compile your soundtrack.
          </p>
        </div>

        {/* Two-column */}
        <div className="ai-grid grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left: Prompt Cards */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {prompts.map((p, i) => (
              <div
                key={i}
                onClick={() => setActive(i)}
                className={clsx(
                  "ai-panel p-5 border cursor-pointer transition-all duration-300",
                  active === i
                    ? "border-accent bg-surface shadow-[4px_4px_0_#6236F4]"
                    : "border-border-strong bg-background hover:border-foreground/40"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx("font-mono text-sm font-bold", active === i ? "text-accent" : "text-secondary")}>&gt;_</span>
                    <span className={clsx("font-mono text-xs uppercase font-bold tracking-wide", active === i ? "text-foreground" : "text-secondary")}>
                      {p.mood}
                    </span>
                  </div>
                  {active === i && (
                    <div className="flex items-center gap-2 font-mono text-[9px] text-accent uppercase">
                      <span>{p.tracks} tracks</span>
                      <span className="text-border-strong">|</span>
                      <span>{p.dur}</span>
                    </div>
                  )}
                </div>
                <p className={clsx(
                  "font-mono text-xs tracking-wide lowercase truncate",
                  active === i ? "text-secondary" : "text-secondary/40"
                )}>{p.cmd}</p>
              </div>
            ))}
          </div>

          {/* Right: Terminal */}
          <div className="ai-panel lg:col-span-3 bg-surface border border-border-strong overflow-hidden flex flex-col shadow-[6px_6px_0_rgba(98,54,244,0.08)]">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border-strong p-4 bg-background">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 border border-border-strong" />
                  <div className="w-2.5 h-2.5 border border-border-strong" />
                  <div className="w-2.5 h-2.5 border border-accent bg-accent/30" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-secondary">Terminal // AI Output</span>
              </div>
              <span className="font-mono text-[9px] uppercase text-accent animate-pulse">Processing</span>
            </div>

            {/* Input */}
            <div className="mx-4 mt-4 bg-background border border-border-strong p-4 relative">
              <div className="absolute inset-y-0 left-0 w-[2px] bg-accent" />
              <div className="flex items-center pl-2">
                <span className="font-mono text-xs text-accent mr-2 shrink-0">&gt;</span>
                <span className="font-mono text-sm text-foreground uppercase tracking-wide truncate">
                  {typed}<span className="animate-pulse text-accent">_</span>
                </span>
              </div>
            </div>

            {/* Track output */}
            <div className="flex-1 mx-4 my-4 bg-background border border-border-strong p-5 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-10 z-0" />
              
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-strong relative z-10">
                <span className="font-mono text-[10px] text-accent uppercase tracking-widest">Compiled Result</span>
                <span className="font-mono text-[10px] text-secondary">MOOD: <span className="text-foreground font-bold">{prompts[active].mood}</span></span>
              </div>

              <div className="space-y-2 relative z-10">
                {[
                  { name: "Neon District", artist: "Flow State", t: "4:12" },
                  { name: "Cyber Rain", artist: "Kavinsky", t: "3:45" },
                  { name: "Deep Current", artist: "Carbon Based", t: "5:18" },
                  { name: "Grid Runner", artist: "Com Truise", t: "3:52" },
                  { name: "Signal Path", artist: "Tycho", t: "4:30" },
                ].map((track, i) => (
                  <div key={i} className="flex items-center gap-3 border border-border-strong p-2.5 hover:border-accent hover:bg-surface cursor-pointer transition-colors group">
                    <span className="font-mono text-[10px] text-accent w-5 shrink-0">0{i+1}</span>
                    <div className="w-7 h-7 border border-border-strong bg-surface flex items-center justify-center shrink-0 group-hover:border-accent">
                      <Terminal className="w-3 h-3 text-secondary group-hover:text-accent" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-mono text-xs font-bold text-foreground uppercase truncate">{track.name}</span>
                      <span className="font-mono text-[9px] text-secondary uppercase truncate">{track.artist}</span>
                    </div>
                    <span className="font-mono text-[10px] text-secondary shrink-0">{track.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
