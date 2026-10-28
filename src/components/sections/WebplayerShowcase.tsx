"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Play, SkipForward, SkipBack, Volume2, Sparkles, Monitor } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function WebplayerShowcase() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".ws-head", { opacity: 0, y: 25 }, {
      opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
      scrollTrigger: { trigger: container.current, start: "top 80%" },
    });
    gsap.fromTo(".ws-player", { opacity: 0, y: 40, scale: 0.98 }, {
      opacity: 1, y: 0, scale: 1, duration: 1, ease: "power4.out",
      scrollTrigger: { trigger: ".ws-player", start: "top 85%" },
    });
    gsap.fromTo(".ws-float", { opacity: 0, x: 30 }, {
      opacity: 1, x: 0, duration: 0.6, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ".ws-player", start: "top 70%" },
    });
  }, { scope: container });

  return (
    <section ref={container} className="relative py-28 md:py-36 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface overflow-hidden border-y border-border-strong">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="ws-head flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 border border-border-strong bg-background px-2.5 py-1 mb-5">
              <Monitor className="w-3 h-3 text-accent" />
              <span className="font-mono text-[10px] tracking-widest text-accent uppercase">Module // Webplayer</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-foreground leading-[0.95]">
              Built for <span className="text-accent">Flow State</span>
            </h2>
          </div>
          <p className="font-mono text-sm text-secondary max-w-md leading-relaxed border-l-2 border-accent pl-5">
            Zero clutter. Pure focused playback with intelligent audio engineering running silently underneath.
          </p>
        </div>

        {/* Player + Cards */}
        <div className="relative">
          <div className="ws-player w-full bg-background border border-border-strong overflow-hidden flex flex-col shadow-[6px_6px_0_rgba(98,54,244,0.1)]">
            {/* Browser bar */}
            <div className="h-10 border-b border-border-strong flex items-center justify-between px-4 bg-surface-elevated shrink-0">
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 border border-border-strong" />
                <div className="w-2.5 h-2.5 border border-border-strong" />
                <div className="w-2.5 h-2.5 border border-accent bg-accent/20" />
                <span className="font-mono text-[9px] text-secondary ml-3 tracking-widest uppercase hidden sm:inline">sonar://player/session_active</span>
              </div>
              <span className="font-mono text-[9px] text-accent uppercase tracking-widest">● LIVE</span>
            </div>
            
            {/* Main */}
            <div className="flex divide-x divide-border-strong" style={{ height: "420px" }}>
              {/* Sidebar */}
              <div className="w-52 hidden lg:flex flex-col bg-surface-elevated shrink-0">
                <div className="p-3 border-b border-border-strong font-mono text-[9px] tracking-widest uppercase text-secondary">Navigation</div>
                <div className="p-2.5 flex flex-col gap-1 font-mono text-[10px] uppercase flex-1">
                  {["Library", "Discover", "AI Generate", "Playlists", "Radio"].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2.5 p-2.5 cursor-pointer transition-colors ${i === 0 ? "border border-accent bg-background text-foreground" : "text-secondary hover:text-foreground hover:bg-surface"}`}>
                      {i === 0 && <span className="w-1.5 h-1.5 bg-accent" />}
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border-strong font-mono text-[9px] text-secondary">
                  <div className="flex justify-between mb-2"><span>CPU</span><span className="text-accent">12%</span></div>
                  <div className="w-full h-[2px] bg-border-strong"><div className="w-[12%] h-full bg-accent" /></div>
                </div>
              </div>

              {/* Visualizer */}
              <div className="flex-1 relative overflow-hidden bg-background group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                
                {/* Rotating diamond */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 md:w-44 md:h-44 border border-border-strong/60 bg-surface/30 flex items-center justify-center rotate-45 group-hover:rotate-[135deg] transition-transform duration-[1.5s] ease-[cubic-bezier(0.87,0,0.13,1)]">
                    <div className="w-20 h-20 md:w-24 md:h-24 border border-accent/60 bg-background/80 flex items-center justify-center -rotate-45 group-hover:-rotate-[135deg] transition-transform duration-[1.5s]">
                      <Play className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                </div>
                
                {/* Now Playing overlay */}
                <div className="absolute bottom-5 left-5 p-4 border border-border-strong bg-background/90 backdrop-blur-sm z-10">
                  <div className="font-mono text-[9px] text-accent mb-1.5 tracking-widest uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-accent animate-pulse" />Now Playing
                  </div>
                  <h3 className="text-xl font-display font-black text-foreground uppercase tracking-tight">Midnight City</h3>
                  <p className="text-secondary font-mono text-[10px] uppercase">M83 // Synthesizer Focus</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="h-16 border-t border-border-strong bg-surface-elevated flex items-center justify-between px-5 relative shrink-0">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-border-strong">
                <div className="h-full bg-accent w-[35%] relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-accent border border-foreground" />
                </div>
              </div>
              <span className="hidden md:block font-mono text-[10px] text-secondary">01:24 / 03:52</span>
              <div className="flex items-center gap-6">
                <SkipBack className="w-4 h-4 text-secondary hover:text-foreground cursor-pointer" />
                <div className="w-11 h-11 border border-foreground bg-foreground text-background flex items-center justify-center cursor-pointer hover:bg-accent hover:border-accent transition-colors">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
                <SkipForward className="w-4 h-4 text-secondary hover:text-foreground cursor-pointer" />
              </div>
              <div className="hidden md:flex items-center gap-2.5">
                <Volume2 className="w-3.5 h-3.5 text-secondary" />
                <div className="w-20 h-[2px] bg-border-strong"><div className="w-2/3 h-full bg-foreground" /></div>
              </div>
            </div>
          </div>

          {/* Floating AI Card */}
          <div className="ws-float absolute -right-3 xl:-right-6 top-16 w-64 bg-background border border-border-strong p-4 hidden xl:block shadow-[4px_4px_0_#6236F4]">
            <div className="flex justify-between items-center border-b border-border-strong pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">AI Inject</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="space-y-1.5 font-mono text-[10px] uppercase text-foreground">
              {["Oxygene Pt. 4", "Blade Runner Blues", "Digital Rain", "Night Drive"].map((t, i) => (
                <div key={i} className="flex items-center justify-between border border-border-strong p-2 hover:border-accent hover:bg-surface cursor-pointer transition-colors">
                  <span className="text-accent">0{i+1}</span><span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
