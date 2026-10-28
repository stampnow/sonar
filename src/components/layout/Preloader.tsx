"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Preloader() {
  const container = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [complete, setComplete] = useState(false);
  // null = not yet checked, true = show, false = skip
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);

  // Check sessionStorage on mount — only runs in the browser
  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("sonar_preloader_seen");
    if (alreadySeen) {
      // Already ran this session → skip immediately
      setShouldShow(false);
      document.body.style.overflow = "auto";
    } else {
      setShouldShow(true);
      sessionStorage.setItem("sonar_preloader_seen", "1");
    }
  }, []);

  // Smooth animated counter
  const animateCounter = useCallback(() => {
    const counter = { val: 0 };
    gsap.to(counter, {
      val: 100,
      duration: 2.8,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.floor(counter.val)).padStart(3, "0");
        }
      },
      onComplete: () => {
        setTimeout(() => setComplete(true), 400);
      },
    });
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    // Entrance animations
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Logo pieces fly in
      tl.fromTo(".pre-logo-svg", { scale: 0, rotate: -180, opacity: 0 }, {
        scale: 1, rotate: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)",
      })
      .fromTo(".pre-logo-text", { y: 20, opacity: 0, letterSpacing: "0.5em" }, {
        y: 0, opacity: 1, letterSpacing: "0.05em", duration: 0.6, ease: "power3.out",
      }, "-=0.3")
      .fromTo(".pre-subtitle", { y: 10, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.4, ease: "power3.out",
      }, "-=0.2")
      // Progress bar container
      .fromTo(".pre-progress-track", { scaleX: 0 }, {
        scaleX: 1, duration: 0.5, ease: "power3.out",
      }, "-=0.1")
      // Boot lines stagger in
      .fromTo(".pre-boot-line", { x: -20, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.3, stagger: 0.15, ease: "power3.out",
      }, "-=0.2")
      // Decorative corner lines
      .fromTo(".pre-corner", { scaleX: 0, scaleY: 0 }, {
        scaleX: 1, scaleY: 1, duration: 0.4, stagger: 0.05, ease: "power2.out",
      }, "-=0.5");

      // Start counting after entrance
      tl.call(() => { animateCounter(); });

      // Animate the equalizer bars continuously
      gsap.to(".eq-bar", {
        scaleY: "random(0.3, 1)",
        duration: 0.3,
        stagger: { each: 0.05, repeat: -1, yoyo: true },
        ease: "steps(4)",
      });

    }, container.current!);

    return () => ctx.revert();
  }, [shouldShow, animateCounter]);

  // Exit animation
  useGSAP(() => {
    if (!complete) return;

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "auto";
      },
    });

    // Content scales down and fades
    tl.to(".pre-content", {
      scale: 0.9, opacity: 0, duration: 0.4, ease: "power3.inOut",
    })
    // Wipe lines sweep across
    .fromTo(".pre-wipe", { xPercent: -100 }, {
      xPercent: 0, duration: 0.4, stagger: 0.06, ease: "power4.inOut",
    })
    // Then wipe lines leave
    .to(".pre-wipe", {
      xPercent: 100, duration: 0.4, stagger: 0.06, ease: "power4.inOut",
    }, "+=0.1")
    .set(container.current, { display: "none" });
  }, { scope: container, dependencies: [complete] });

  // Not yet checked or should be skipped → render nothing
  if (shouldShow === null || shouldShow === false) return null;

  return (
    <div ref={container} className="fixed inset-0 z-[9999] bg-background font-mono select-none pointer-events-auto overflow-hidden">

      {/* Wipe transition layers */}
      <div className="pre-wipe absolute inset-0 bg-accent z-50 pointer-events-none" style={{ transform: "translateX(-100%)" }} />
      <div className="pre-wipe absolute inset-0 bg-foreground z-50 pointer-events-none" style={{ transform: "translateX(-100%)" }} />
      <div className="pre-wipe absolute inset-0 bg-background z-50 pointer-events-none" style={{ transform: "translateX(-100%)" }} />

      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Corner decorations */}
      <div className="pre-corner absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-accent origin-top-left" />
      <div className="pre-corner absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-accent origin-top-right" />
      <div className="pre-corner absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-accent origin-bottom-left" />
      <div className="pre-corner absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-accent origin-bottom-right" />

      {/* Main content */}
      <div className="pre-content absolute inset-0 flex flex-col items-center justify-center gap-10">

        {/* Logo Assembly */}
        <div className="flex flex-col items-center gap-4">
          <div className="pre-logo-svg">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground">
              <path d="M0 0H12V12H24V24H12V12H0V0Z" fill="currentColor" />
              <path d="M12 0H24V12L12 0Z" fill="#6236F4" />
              <path d="M0 12H12V24L0 12Z" fill="#6236F4" />
            </svg>
          </div>
          <span className="pre-logo-text text-3xl font-display font-black tracking-tight text-foreground uppercase">
            SONAR
          </span>
          <span className="pre-subtitle text-[10px] tracking-[0.4em] text-secondary uppercase">
            Neural Audio Engine
          </span>
        </div>

        {/* Equalizer visualization */}
        <div className="flex items-end justify-center gap-[3px] h-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="eq-bar w-[3px] bg-accent origin-bottom"
              style={{
                height: "100%",
                transform: `scaleY(${0.2 + Math.random() * 0.8})`,
              }}
            />
          ))}
        </div>

        {/* Counter + Progress */}
        <div className="w-72 flex flex-col gap-3">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] tracking-widest text-secondary uppercase">Initializing</span>
            <span ref={counterRef} className="text-4xl font-display font-black text-foreground tracking-tighter tabular-nums">
              000
            </span>
          </div>
          <div className="pre-progress-track h-[3px] w-full bg-border-strong overflow-hidden origin-left">
            <div className="h-full bg-accent animate-[preload-bar_2.8s_power2.inOut_forwards]" 
              style={{
                animation: "preload-bar 2.8s cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards",
              }}
            />
          </div>
        </div>

        {/* Boot log */}
        <div className="w-72 flex flex-col gap-2 text-[10px] tracking-wide">
          <div className="pre-boot-line flex justify-between text-secondary">
            <span>&gt; Audio buffers allocated</span>
            <span className="text-accent">[OK]</span>
          </div>
          <div className="pre-boot-line flex justify-between text-secondary">
            <span>&gt; Neural engine sync</span>
            <span className="text-accent">[OK]</span>
          </div>
          <div className="pre-boot-line flex justify-between text-secondary">
            <span>&gt; Playlist compiler online</span>
            <span className="text-accent">[OK]</span>
          </div>
          <div className="pre-boot-line flex justify-between text-secondary">
            <span>&gt; System ready</span>
            <span className="text-accent animate-pulse">_</span>
          </div>
        </div>
      </div>

      {/* CSS animation for progress bar */}
      <style jsx>{`
        @keyframes preload-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
