"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Sparkles, Compass, Radio, Cpu, Zap, Lock,
  ArrowRight, Terminal, ChevronDown, Check, X as XIcon,
  Brain, Wand2, Music, Shield
} from "lucide-react";
import { clsx } from "clsx";

gsap.registerPlugin(ScrollTrigger);

// ─── Data ─────────────────────────────────────────────────────────────────────

const coreFeatures = [
  {
    icon: Sparkles,
    num: "01",
    tag: "CORE",
    title: "AI Playlist Generation",
    headline: "Describe a mood. Get 15 tracks in 8ms.",
    desc: "The neural engine parses your natural language input through a fine-tuned LLM and cross-references a 200M+ track index in real-time. Emotional context, tempo, key, and energy level are all extracted and matched. No genre checkboxes. No star ratings.",
    specs: ["200M+ tracks indexed", "Sub-8ms response", "Natural language parsing", "Mood & energy profiling"],
    color: "#6236F4",
  },
  {
    icon: Compass,
    num: "02",
    tag: "DISCOVERY",
    title: "Contextual Discovery",
    headline: "Recommendations that actually understand you.",
    desc: "Forget collaborative filtering that just shows you what other people like. Sonar uses semantic audio analysis — BPM, harmonic progression, tonal balance — combined with your interaction graph to discover genuinely new music that fits your precise listening context.",
    specs: ["Semantic audio analysis", "Interaction graph learning", "Harmonic profiling", "Zero cold-start problem"],
    color: "#F43670",
  },
  {
    icon: Radio,
    num: "03",
    tag: "INTERFACE",
    title: "Terminal-Grade Player",
    headline: "Distraction-free. System-precise.",
    desc: "The webplayer is built for focus. Real-time telemetry headers, stream visualization, waveform analysis, and zero bloat. It's the player you'd build if you were an engineer. Every interaction is intentional, every animation is earned.",
    specs: ["Real-time stream telemetry", "Waveform visualization", "Keyboard-first shortcuts", "Offline-capable PWA"],
    color: "#36B4F4",
  },
  {
    icon: Cpu,
    num: "04",
    tag: "ENGINE",
    title: "Neural Processing Core",
    headline: "Custom LLM. Fine-tuned on 200M tracks.",
    desc: "Sonar's audio intelligence is not a wrapper around Spotify's API. The model was trained from scratch on raw audio fingerprints, lyrical content, metadata, and listener behavior graphs. It understands music the same way a music theorist does.",
    specs: ["Custom fine-tuned LLM", "Raw audio fingerprinting", "Multi-modal embeddings", "Streaming inference"],
    color: "#F4A936",
  },
  {
    icon: Zap,
    num: "05",
    tag: "SPEED",
    title: "Zero-Latency Streaming",
    headline: "The next track loads before you think about it.",
    desc: "Predictive buffering compiles your next 3 tracks before you ever press skip. Audio segments are pre-fetched, decoded, and staged in memory. You experience zero gap between tracks — ever. Even on 3G.",
    specs: ["3-track predictive buffer", "Adaptive bitrate streaming", "3G-resilient architecture", "Global CDN edge nodes"],
    color: "#36F4A9",
  },
  {
    icon: Lock,
    num: "06",
    tag: "SECURITY",
    title: "Encrypted Pipeline",
    headline: "Your data never leaves local runtime.",
    desc: "End-to-end encryption on all streams. The model inference runs on-device for personalization signals — your listening behavior is never transmitted to a third-party server. No telemetry. No ad profiling. Your ear is yours.",
    specs: ["E2E encrypted streams", "On-device ML inference", "Zero ad telemetry", "GDPR + CCPA compliant"],
    color: "#6236F4",
  },
];

const deepDives = [
  {
    icon: Brain,
    tag: "ENGINE // DEEP DIVE",
    title: "The Model",
    label: "Neural Intelligence",
    body: "Sonar&apos;s core is a 7-billion parameter transformer model, trained exclusively on audio data — not scraped internet text. It processes raw waveform fingerprints, harmonic relationships, and lyrical semantics simultaneously. When you type \"something like the drive home after a long Friday\", it doesn't search keywords. It reasons about emotional valence, tempo, and sonic texture.",
    stat1: { val: "7B", label: "Model Params" },
    stat2: { val: "200M", label: "Audio Fingerprints" },
    accent: "#6236F4",
  },
  {
    icon: Wand2,
    tag: "GENERATION // DEEP DIVE",
    title: "The Prompt",
    label: "Natural Language Interface",
    body: "No dropdowns. No sliders. Write like you talk. Sonar understands temporal context (\"focus music for a 3-hour sprint\"), negation (\"nothing with vocals\"), references (\"like Tycho but darker\"), and compound queries (\"upbeat but melancholic, lo-fi, Japanese jazz\"). The prompt is the playlist builder.",
    stat1: { val: "<8ms", label: "Inference Time" },
    stat2: { val: "∞", label: "Query Complexity" },
    accent: "#F43670",
  },
  {
    icon: Shield,
    tag: "PRIVACY // DEEP DIVE",
    title: "The Vault",
    label: "Your Data Stays Yours",
    body: "Every audio stream is AES-256 encrypted in transit and at rest. Personalization signals are processed on-device — no listening habits, mood data, or query history is sent to any server. No advertising SDK. No third-party analytics. You are not the product.",
    stat1: { val: "0", label: "Data Sold" },
    stat2: { val: "AES-256", label: "Encryption" },
    accent: "#36F4A9",
  },
];

const comparison = [
  { feature: "AI Playlist from Text", sonar: true, spotify: false, apple: false },
  { feature: "Semantic Audio Analysis", sonar: true, spotify: false, apple: false },
  { feature: "Custom Neural Model", sonar: true, spotify: true, apple: false },
  { feature: "Zero-Gap Streaming", sonar: true, spotify: true, apple: true },
  { feature: "On-Device Inference", sonar: true, spotify: false, apple: false },
  { feature: "No Ad Telemetry", sonar: true, spotify: false, apple: false },
  { feature: "API Access", sonar: true, spotify: true, apple: false },
  { feature: "FLAC / Lossless Audio", sonar: true, spotify: false, apple: true },
];

const techSpecs = [
  { label: "Model Architecture", value: "Transformer / 7B params" },
  { label: "Training Dataset", value: "200M+ audio fingerprints" },
  { label: "Inference Latency", value: "< 8ms p99" },
  { label: "Audio Formats", value: "MP3, AAC, FLAC, Opus" },
  { label: "Bitrate Range", value: "64kbps – Lossless" },
  { label: "CDN Nodes", value: "94 global edge locations" },
  { label: "API Protocol", value: "REST + WebSocket" },
  { label: "Encryption", value: "AES-256 / TLS 1.3" },
  { label: "Uptime SLA", value: "99.9% monthly" },
  { label: "Compliance", value: "GDPR, CCPA, SOC 2 Type II" },
];

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({ feat }: { feat: typeof coreFeatures[0] }) {
  const [open, setOpen] = useState(false);
  const Icon = feat.icon;

  return (
    <div
      className="feat-card border border-border-strong bg-background transition-all duration-300 overflow-hidden group"
      style={{ boxShadow: open ? `6px 6px 0 ${feat.color}33` : undefined }}
    >
      <button
        className="w-full flex items-center justify-between p-5 md:p-7 text-left cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 flex items-center justify-center border shrink-0 transition-all duration-300"
            style={{
              borderColor: open ? feat.color : "rgba(231,230,217,0.15)",
              backgroundColor: open ? `${feat.color}18` : "transparent",
            }}
          >
            <Icon className="w-5 h-5 transition-colors" style={{ color: open ? feat.color : "#888" }} />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] text-secondary tracking-widest uppercase">{feat.tag}</span>
              <span className="font-mono text-[10px] font-bold" style={{ color: feat.color }}>{feat.num}</span>
            </div>
            <h3 className="text-sm md:text-lg font-display font-black uppercase tracking-tight text-foreground">
              {feat.title}
            </h3>
          </div>
        </div>
        <ChevronDown className={clsx("w-5 h-5 text-secondary shrink-0 ml-4 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <div className={clsx("transition-all duration-500 overflow-hidden", open ? "max-h-[700px]" : "max-h-0")}>
        <div className="px-5 md:px-7 pb-7 border-t border-border-strong pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div>
            <p className="font-display font-bold text-base md:text-xl text-foreground leading-tight mb-4 uppercase tracking-tight">{feat.headline}</p>
            <p className="font-mono text-xs text-secondary leading-relaxed">{feat.desc}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[10px] tracking-widest text-secondary uppercase mb-1">Specifications</span>
            {feat.specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-3 border border-border-strong p-3 bg-surface">
                <Check className="w-3.5 h-3.5 shrink-0" style={{ color: feat.color }} />
                <span className="font-mono text-xs text-foreground">{spec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[2px] w-0 group-hover:w-full transition-all duration-500" style={{ backgroundColor: feat.color }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const featsRef = useRef<HTMLDivElement>(null);
  const deepRef = useRef<HTMLDivElement>(null);
  const compRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero
    gsap.fromTo(".fh-tag", { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.1 });
    gsap.fromTo(".fh-title", { opacity: 0, y: 60 }, { opacity: 1, y: 0, stagger: 0.08, duration: 1, ease: "power4.out", delay: 0.2 });
    gsap.fromTo(".fh-desc", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.7 });
    gsap.fromTo(".fh-stat", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power3.out", delay: 0.9 });
    gsap.fromTo(".fh-module", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "power3.out", delay: 0.4 });

    // Feature accordion
    gsap.fromTo(".feat-card", { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: "power3.out",
      scrollTrigger: { trigger: featsRef.current, start: "top 80%" },
    });

    // Deep dives
    gsap.fromTo(".deep-card", { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power3.out",
      scrollTrigger: { trigger: deepRef.current, start: "top 80%" },
    });

    // Comparison
    gsap.fromTo(".comp-row", { opacity: 0, x: -20 }, {
      opacity: 1, x: 0, stagger: 0.04, duration: 0.4, ease: "power3.out",
      scrollTrigger: { trigger: compRef.current, start: "top 80%" },
    });

    // Tech specs
    gsap.fromTo(".spec-row", { opacity: 0, x: -20 }, {
      opacity: 1, x: 0, stagger: 0.04, duration: 0.4, ease: "power3.out",
      scrollTrigger: { trigger: specsRef.current, start: "top 85%" },
    });
  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="bg-background min-h-screen">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] md:min-h-[90svh] flex flex-col justify-between pt-24 md:pt-36 border-b border-border-strong overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.025)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-accent/[0.03] to-transparent pointer-events-none" />

        <div className="relative z-10 px-4 sm:px-10 md:px-16 lg:px-20 flex flex-col lg:flex-row gap-8 lg:gap-0 justify-between items-start flex-1 py-8 md:py-16">
          {/* Left: Typography */}
          <div className="max-w-3xl flex-1">
            <div className="fh-tag inline-flex items-center gap-2 border border-border-strong bg-surface px-3 py-1.5 mb-6 md:mb-10">
              <Terminal className="w-3 h-3 text-accent" />
              <span className="font-mono text-[10px] tracking-widest text-accent uppercase">System // Feature Index</span>
            </div>

            <h1 className="mb-5 md:mb-8 overflow-hidden">
              <span className="fh-title block font-display font-black text-[14vw] sm:text-[9vw] md:text-[7vw] lg:text-[5.5vw] uppercase tracking-tighter leading-[0.88] text-foreground">
                Every Tool.
              </span>
              <span className="fh-title block font-display font-black text-[14vw] sm:text-[9vw] md:text-[7vw] lg:text-[5.5vw] uppercase tracking-tighter leading-[0.88] text-transparent [-webkit-text-stroke:1.5px_#E7E6D9] sm:[-webkit-text-stroke:2px_#E7E6D9]">
                One Engine.
              </span>
              <span className="fh-title block font-display font-black text-[14vw] sm:text-[9vw] md:text-[7vw] lg:text-[5.5vw] uppercase tracking-tighter leading-[0.88] text-accent">
                Zero Friction.
              </span>
            </h1>

            <p className="fh-desc font-mono text-xs sm:text-sm text-secondary max-w-xl leading-relaxed border-l-2 border-accent pl-4 sm:pl-5">
              Six core modules. One neural backbone. Sonar replaces every tool in your music workflow — discovery, generation, playback, and privacy — with a single, cohesive system built for precision listeners.
            </p>
          </div>

          {/* Right: Module Grid - hidden on mobile, shown below text */}
          <div className="w-full lg:w-auto lg:min-w-[340px] xl:min-w-[400px] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-px bg-border-strong border border-border-strong self-start lg:self-center">
            {coreFeatures.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="fh-module bg-background p-4 md:p-5 flex flex-col gap-4 group hover:bg-surface transition-colors cursor-default relative overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                    <Icon className="w-4 h-4 text-secondary group-hover:text-accent transition-colors" />
                    <span className="font-mono text-[10px] font-bold" style={{ color: feat.color }}>{feat.num}</span>
                  </div>
                  <div>
                    <div className="font-mono text-[8px] text-secondary/50 tracking-widest uppercase mb-1">{feat.tag}</div>
                    <div className="text-[11px] sm:text-xs font-display font-black uppercase tracking-tight text-foreground group-hover:text-accent transition-colors leading-tight">
                      {feat.title}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500" style={{ backgroundColor: feat.color }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats strip at the bottom of hero */}
        <div className="relative z-10 border-t border-border-strong bg-surface/80 backdrop-blur-sm px-4 sm:px-10 md:px-16 lg:px-20 py-4 md:py-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-x-8 md:gap-x-16">
            {[
              { val: "200M+", label: "Tracks Indexed" },
              { val: "<8ms", label: "Neural Latency" },
              { val: "99.9%", label: "Uptime" },
              { val: "94", label: "CDN Nodes" },
              { val: "0", label: "Data Sold" },
            ].map((s, i) => (
              <div key={i} className="fh-stat flex items-baseline gap-2 sm:gap-3">
                <span className="text-lg sm:text-xl md:text-2xl font-display font-black text-foreground">{s.val}</span>
                <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-secondary">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE ACCORDION ───────────────────────────────────────────────── */}
      <section ref={featsRef} className="py-20 md:py-28 px-4 sm:px-10 md:px-16 lg:px-20 bg-background">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-8 border-b border-border-strong">
          <div>
            <div className="inline-flex items-center gap-2 border border-border-strong bg-surface px-2.5 py-1 mb-4">
              <span className="w-1.5 h-1.5 bg-accent" />
              <span className="font-mono text-[10px] tracking-widest text-secondary uppercase">Module Index</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tight text-foreground leading-tight">
              Explore the <span className="text-accent">Full Stack</span>
            </h2>
          </div>
          <p className="font-mono text-xs text-secondary max-w-xs border-l-2 border-accent pl-4">
            Click any module to expand its full technical specification.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {coreFeatures.map((feat, i) => (
            <FeatureCard key={i} feat={feat} />
          ))}
        </div>
      </section>

      {/* ── DEEP DIVES ──────────────────────────────────────────────────────── */}
      <section ref={deepRef} className="py-20 md:py-28 px-4 sm:px-10 md:px-16 lg:px-20 bg-surface border-y border-border-strong relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12 pb-8 border-b border-border-strong">
            <div>
              <div className="inline-flex items-center gap-2 border border-border-strong bg-background px-2.5 py-1 mb-4">
                <Brain className="w-3 h-3 text-accent" />
                <span className="font-mono text-[10px] tracking-widest text-accent uppercase">Architecture // Deep Dive</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tight text-foreground leading-tight">
                How It <span className="text-accent">Actually Works</span>
              </h2>
            </div>
            <p className="font-mono text-xs text-secondary max-w-xs border-l-2 border-accent pl-4">
              No hand-wavy AI claims. Just how the system works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {deepDives.map((d, i) => {
              const Icon = d.icon;
              return (
                <div
                  key={i}
                  className="deep-card border border-border-strong bg-background p-6 md:p-8 flex flex-col gap-6 group hover:border-accent/50 transition-all duration-300"
                  style={{ boxShadow: "0 0 0 0 transparent" }}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 border flex items-center justify-center transition-all duration-300 group-hover:border-current" style={{ borderColor: `${d.accent}40`, backgroundColor: `${d.accent}10` }}>
                      <Icon className="w-5 h-5" style={{ color: d.accent }} />
                    </div>
                    <div className="font-mono text-[9px] text-secondary tracking-widest uppercase text-right">{d.tag}</div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] tracking-widest mb-2 uppercase" style={{ color: d.accent }}>{d.label}</div>
                    <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight text-foreground mb-4">{d.title}</h3>
                    <p className="font-mono text-xs text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: d.body }} />
                  </div>

                  <div className="flex gap-6 border-t border-border-strong pt-5 mt-auto">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-2xl font-display font-black text-foreground">{d.stat1.val}</span>
                      <span className="font-mono text-[9px] text-secondary uppercase tracking-widest">{d.stat1.label}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-2xl font-display font-black text-foreground">{d.stat2.val}</span>
                      <span className="font-mono text-[9px] text-secondary uppercase tracking-widest">{d.stat2.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ────────────────────────────────────────────────── */}
      <section ref={compRef} className="py-20 md:py-28 px-4 sm:px-10 md:px-16 lg:px-20 bg-background">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-8 border-b border-border-strong">
          <div>
            <div className="inline-flex items-center gap-2 border border-border-strong bg-surface px-2.5 py-1 mb-4">
              <Music className="w-3 h-3 text-accent" />
              <span className="font-mono text-[10px] tracking-widest text-secondary uppercase">Comparison // VS Others</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tight text-foreground leading-tight">
              Sonar vs <span className="text-accent">The Rest</span>
            </h2>
          </div>
          <p className="font-mono text-xs text-secondary max-w-xs border-l-2 border-accent pl-4">
            Measured features. No bias. Make an informed decision.
          </p>
        </div>

        {/* Outer wrapper with overflow-x-auto for mobile scroll */}
        <div className="border border-border-strong overflow-x-auto">
          {/* Inner wrapper with minimum width to prevent column squish */}
          <div className="min-w-[520px]">
            {/* Header */}
            <div className="grid grid-cols-4 gap-px bg-border-strong">
              <div className="bg-surface p-4 font-mono text-[10px] text-secondary uppercase tracking-widest">Feature</div>
              <div className="bg-accent/10 border-l border-accent p-4 font-mono text-[10px] text-accent uppercase tracking-widest text-center flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent animate-pulse" />
                SONAR
              </div>
              <div className="bg-surface p-4 font-mono text-[10px] text-secondary uppercase tracking-widest text-center">Spotify</div>
              <div className="bg-surface p-4 font-mono text-[10px] text-secondary uppercase tracking-widest text-center">Apple Music</div>
            </div>

            {/* Rows */}
            {comparison.map((row, i) => (
              <div key={i} className="comp-row grid grid-cols-4 gap-px bg-border-strong">
                <div className="bg-background p-4 font-mono text-xs text-secondary">{row.feature}</div>
                <div className="bg-accent/[0.04] border-l border-accent p-4 flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <div className="bg-background p-4 flex items-center justify-center">
                  {row.spotify 
                    ? <Check className="w-4 h-4 text-secondary/50" />
                    : <XIcon className="w-4 h-4 text-secondary/20" />
                  }
                </div>
                <div className="bg-background p-4 flex items-center justify-center">
                  {row.apple 
                    ? <Check className="w-4 h-4 text-secondary/50" />
                    : <XIcon className="w-4 h-4 text-secondary/20" />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH SPECS ──────────────────────────────────────────────────────── */}
      <section ref={specsRef} className="py-20 md:py-28 px-4 sm:px-10 md:px-16 lg:px-20 bg-surface border-y border-border-strong relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-8 border-b border-border-strong">
            <div>
              <div className="inline-flex items-center gap-2 border border-border-strong bg-background px-2.5 py-1 mb-4">
                <Cpu className="w-3 h-3 text-accent" />
                <span className="font-mono text-[10px] tracking-widest text-secondary uppercase">Technical // Specifications</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tight text-foreground leading-tight">
                Under the <span className="text-accent">Hood</span>
              </h2>
            </div>
            <p className="font-mono text-xs text-secondary max-w-xs border-l-2 border-accent pl-4">
              Hard numbers. No marketing fluff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-strong border border-border-strong">
            {techSpecs.map((spec, i) => (
              <div key={i} className="spec-row bg-surface p-5 md:p-6 flex justify-between items-center gap-4 group hover:bg-background transition-colors">
                <span className="font-mono text-xs text-secondary uppercase tracking-wide">{spec.label}</span>
                <span className="font-mono text-xs font-bold text-foreground group-hover:text-accent transition-colors text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 px-4 sm:px-10 md:px-16 lg:px-20 border-t border-border-strong bg-background overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.025)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/[0.05] rounded-full blur-[150px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase tracking-tight text-foreground leading-[0.9] mb-4">
              Ready to <span className="text-accent">Initialize?</span>
            </h2>
            <p className="font-mono text-sm text-secondary leading-relaxed">
              Join the engineering preview. The neural audio engine is live. No credit card required.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
            <Link
              href="/signup"
              className="group relative flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 font-mono text-xs font-bold tracking-[0.1em] uppercase hover:-translate-y-0.5 hover:translate-x-0.5 transition-transform w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-accent translate-y-[4px] -translate-x-[4px] -z-10 group-hover:translate-y-[2px] group-hover:-translate-x-[2px] transition-transform" />
              <span>Get Access</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/webplayer"
              className="flex items-center justify-center gap-3 px-8 py-4 font-mono text-xs tracking-[0.1em] uppercase border border-border-strong bg-surface text-foreground hover:border-accent hover:bg-surface-elevated transition-colors w-full sm:w-auto"
            >
              Open Player
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
