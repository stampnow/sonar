"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Terminal, Search, ChevronDown, ArrowRight,
  Zap, Radio, Cpu, Lock, Sparkles, MessageSquare,
  Book, Github, Twitter, Circle, CheckCircle2, AlertCircle,
  Send, Mail, Clock, LifeBuoy
} from "lucide-react";
import { clsx } from "clsx";

gsap.registerPlugin(ScrollTrigger);

// ─── Data ─────────────────────────────────────────────────────────────────────

const systemStatus = [
  { label: "API Gateway", status: "operational" },
  { label: "Audio Streaming CDN", status: "operational" },
  { label: "Neural Inference Engine", status: "operational" },
  { label: "Auth & Session Layer", status: "operational" },
  { label: "Track Index / Search", status: "degraded" },
  { label: "Analytics Pipeline", status: "operational" },
];

const quickLinks = [
  { icon: Book, label: "Documentation", desc: "Full API reference + SDK guides", href: "#", tag: "DOCS" },
  { icon: Github, label: "GitHub", desc: "Open-source SDKs and examples", href: "#", tag: "CODE" },
  { icon: Twitter, label: "Status Updates", desc: "Follow for real-time incidents", href: "#", tag: "SOCIAL" },
  { icon: LifeBuoy, label: "Community Forum", desc: "Ask questions, get answers", href: "#", tag: "COMMUNITY" },
];

const faqs = [
  {
    category: "GENERAL",
    q: "What is Sonar?",
    a: "Sonar is a neural audio platform that uses a 7-billion parameter AI model to generate playlists, discover music, and power playback — all from natural language descriptions. Think of it as an intelligent system for your listening workflow.",
  },
  {
    category: "GENERAL",
    q: "How does AI playlist generation work?",
    a: "You type a description — mood, context, tempo, anything. Sonar's neural engine parses your input, extracts emotional valence, BPM range, harmonic profile, and energy level, then cross-references 200M+ tracks to compile a playlist in under 8ms. No genre dropdowns. No sliders.",
  },
  {
    category: "ACCOUNT",
    q: "How do I reset my password?",
    a: "Go to the login page and click '[ FORGOT ]' below the password field. Enter the email associated with your account and you'll receive a one-time reset link valid for 15 minutes. Check your spam folder if it doesn't arrive within 2 minutes.",
  },
  {
    category: "ACCOUNT",
    q: "Can I change my account email?",
    a: "Yes. Navigate to Settings → Account → Identity and click 'Change Email'. You'll need to verify both your old and new email addresses. The change takes effect immediately after both verifications are complete.",
  },
  {
    category: "PLAYBACK",
    q: "Why is there a gap between tracks?",
    a: "There shouldn't be — zero-gap streaming is a core feature. If you're experiencing gaps, it's likely due to a slow network connection preventing our 3-track predictive buffer from loading. Try switching to a lower audio quality in Settings → Playback → Quality.",
  },
  {
    category: "PLAYBACK",
    q: "Does Sonar support offline playback?",
    a: "Offline mode is available on CORE and SYS plans. Download up to 500 tracks for offline playback via the Library → Download Queue. Downloaded tracks expire after 30 days if you don't sync your account.",
  },
  {
    category: "API",
    q: "How do I get API access?",
    a: "API access is available on the SYS plan. After upgrading, navigate to Settings → Developer → API Keys to generate your first key. The full REST + WebSocket documentation is available at docs.sonar.dev.",
  },
  {
    category: "API",
    q: "What are the API rate limits?",
    a: "SYS plan: 10,000 requests/hour for REST endpoints, 100 concurrent WebSocket connections. If you need higher limits for enterprise use cases, contact us directly at sys@sonar.dev.",
  },
  {
    category: "PRIVACY",
    q: "What data does Sonar collect?",
    a: "Sonar collects the minimum necessary to provide the service: your account email, anonymized playback events (track played, skipped, duration), and AI prompt text for model improvement (opt-out available in Privacy Settings). We collect zero ad telemetry, zero third-party tracking.",
  },
  {
    category: "PRIVACY",
    q: "How is my audio data encrypted?",
    a: "All audio streams are encrypted using AES-256 in transit and at rest. Personalization inference runs on-device — your listening behavior never leaves your local runtime. We are GDPR, CCPA, and SOC 2 Type II compliant.",
  },
];

const categories = ["ALL", "GENERAL", "ACCOUNT", "PLAYBACK", "API", "PRIVACY"];

// ─── Components ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  if (status === "operational") return <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />;
  if (status === "degraded") return <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0 animate-pulse" />;
  return <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />;
}

function FaqItem({ faq }: { faq: typeof faqs[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={clsx(
      "border border-border-strong bg-background transition-all duration-300 overflow-hidden",
      open && "shadow-[4px_4px_0_rgba(98,54,244,0.2)]"
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left cursor-pointer group"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <span className="font-mono text-[9px] text-accent border border-accent/40 px-1.5 py-0.5 uppercase tracking-widest shrink-0 mt-0.5">{faq.category}</span>
          <span className="text-sm md:text-base font-display font-bold uppercase tracking-tight text-foreground group-hover:text-accent transition-colors leading-tight">{faq.q}</span>
        </div>
        <ChevronDown className={clsx("w-5 h-5 text-secondary shrink-0 transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div className={clsx("transition-all duration-400 overflow-hidden", open ? "max-h-[300px]" : "max-h-0")}>
        <div className="px-5 md:px-6 pb-6 pt-0 border-t border-border-strong">
          <p className="font-mono text-xs text-secondary leading-relaxed pt-5">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const filteredFaqs = faqs.filter(f => {
    const matchesCategory = activeCategory === "ALL" || f.category === activeCategory;
    const matchesSearch = searchQuery === "" ||
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const overallStatus = systemStatus.some(s => s.status === "outage")
    ? "outage"
    : systemStatus.some(s => s.status === "degraded")
    ? "degraded"
    : "operational";

  useGSAP(() => {
    gsap.fromTo(".sp-hero-el", { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: "power3.out", delay: 0.2
    });
    gsap.fromTo(".sp-quick", { opacity: 0, y: 25 }, {
      opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: "power3.out",
      scrollTrigger: { trigger: ".sp-quick-grid", start: "top 85%" }
    });
    gsap.fromTo(".sp-status-row", { opacity: 0, x: -15 }, {
      opacity: 1, x: 0, stagger: 0.04, duration: 0.4, ease: "power3.out",
      scrollTrigger: { trigger: ".sp-status-grid", start: "top 85%" }
    });
    gsap.fromTo(".sp-contact-el", { opacity: 0, y: 25 }, {
      opacity: 1, y: 0, stagger: 0.06, duration: 0.6, ease: "power3.out",
      scrollTrigger: { trigger: ".sp-contact", start: "top 80%" }
    });
  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="bg-background min-h-screen">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 md:pt-40 pb-0 border-b border-border-strong overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.025)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 px-4 sm:px-10 md:px-16 lg:px-20 pb-12 md:pb-16">
          <div className="sp-hero-el inline-flex items-center gap-2 border border-border-strong bg-surface px-3 py-1.5 mb-8">
            <LifeBuoy className="w-3 h-3 text-accent" />
            <span className="font-mono text-[10px] tracking-widest text-accent uppercase">System // Support</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-20 mb-10">
            <div className="flex-1">
              <h1 className="sp-hero-el font-display font-black text-[12vw] sm:text-[8vw] md:text-[6vw] lg:text-[5vw] uppercase tracking-tighter leading-[0.88] mb-4">
                <span className="text-foreground block">How Can We</span>
                <span className="text-accent block">Help You?</span>
              </h1>
              <p className="sp-hero-el font-mono text-sm text-secondary leading-relaxed max-w-lg border-l-2 border-accent pl-4">
                Search the knowledge base, browse FAQs, check system status, or open a ticket. Average response time: <span className="text-foreground font-bold">&lt;2 hours</span>.
              </p>
            </div>

            {/* System Status Badge */}
            <div className="sp-hero-el shrink-0">
              <div className={clsx(
                "inline-flex items-center gap-3 border px-4 py-3",
                overallStatus === "operational" ? "border-green-500/40 bg-green-500/5" :
                overallStatus === "degraded" ? "border-yellow-400/40 bg-yellow-400/5" :
                "border-red-500/40 bg-red-500/5"
              )}>
                {overallStatus === "operational"
                  ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                  : <AlertCircle className="w-4 h-4 text-yellow-400" />
                }
                <div>
                  <div className="font-mono text-[10px] text-secondary uppercase tracking-widest">System Status</div>
                  <div className={clsx(
                    "font-mono text-xs font-bold uppercase tracking-widest",
                    overallStatus === "operational" ? "text-green-500" :
                    overallStatus === "degraded" ? "text-yellow-400" : "text-red-500"
                  )}>
                    {overallStatus === "operational" ? "All Systems Online" :
                     overallStatus === "degraded" ? "Partial Degradation" : "Outage Detected"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="sp-hero-el relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs, docs, guides..."
              className="w-full bg-surface border border-border-strong pl-12 pr-6 py-4 font-mono text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] text-secondary border border-border-strong px-1.5 py-0.5 hidden sm:block">
              ↵ ENTER
            </kbd>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 sm:px-10 md:px-16 lg:px-20 border-b border-border-strong">
        <div className="sp-quick-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                href={item.href}
                className="sp-quick group border border-border-strong bg-background p-6 flex flex-col gap-4 hover:border-accent hover:shadow-[4px_4px_0_rgba(98,54,244,0.15)] transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 border border-border-strong flex items-center justify-center bg-surface group-hover:border-accent group-hover:bg-accent/10 transition-all duration-300">
                    <Icon className="w-4 h-4 text-secondary group-hover:text-accent transition-colors" />
                  </div>
                  <span className="font-mono text-[9px] tracking-widest text-secondary/50 uppercase">{item.tag}</span>
                </div>
                <div>
                  <div className="font-display font-black text-sm uppercase tracking-tight text-foreground group-hover:text-accent transition-colors mb-1">{item.label}</div>
                  <div className="font-mono text-[10px] text-secondary leading-relaxed">{item.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-secondary/30 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300 mt-auto" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section ref={faqRef} className="py-16 md:py-24 px-4 sm:px-10 md:px-16 lg:px-20 bg-background">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-8 border-b border-border-strong">
          <div>
            <div className="inline-flex items-center gap-2 border border-border-strong bg-surface px-2.5 py-1 mb-4">
              <MessageSquare className="w-3 h-3 text-accent" />
              <span className="font-mono text-[10px] tracking-widest text-secondary uppercase">FAQ // Knowledge Base</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tight text-foreground leading-tight">
              Frequently <span className="text-accent">Asked</span>
            </h2>
          </div>
          <p className="font-mono text-xs text-secondary max-w-xs border-l-2 border-accent pl-4">
            {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} found.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                "font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors whitespace-nowrap shrink-0",
                activeCategory === cat
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-strong text-secondary hover:border-accent/50 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="flex flex-col gap-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => <FaqItem key={i} faq={faq} />)
          ) : (
            <div className="border border-border-strong bg-surface p-10 flex flex-col items-center text-center gap-4">
              <Terminal className="w-8 h-8 text-secondary/40" />
              <p className="font-mono text-sm text-secondary">No results for &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("ALL"); }}
                className="font-mono text-xs text-accent border border-accent/40 px-4 py-2 hover:bg-accent/10 transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── SYSTEM STATUS ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 sm:px-10 md:px-16 lg:px-20 bg-surface border-y border-border-strong relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-8 border-b border-border-strong">
            <div>
              <div className="inline-flex items-center gap-2 border border-border-strong bg-background px-2.5 py-1 mb-4">
                <Circle className="w-3 h-3 text-green-500 fill-green-500" />
                <span className="font-mono text-[10px] tracking-widest text-secondary uppercase">Infrastructure // Status</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tight text-foreground leading-tight">
                System <span className="text-accent">Health</span>
              </h2>
            </div>
            <p className="font-mono text-xs text-secondary max-w-xs border-l-2 border-accent pl-4">
              Real-time status for all Sonar infrastructure components.
            </p>
          </div>

          <div className="sp-status-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {systemStatus.map((s, i) => (
              <div key={i} className="sp-status-row border border-border-strong bg-background p-4 md:p-5 flex items-center justify-between gap-3 group hover:bg-surface transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusDot status={s.status} />
                  <span className="font-mono text-xs text-foreground truncate">{s.label}</span>
                </div>
                <span className={clsx(
                  "font-mono text-[9px] uppercase tracking-widest shrink-0",
                  s.status === "operational" ? "text-green-500" :
                  s.status === "degraded" ? "text-yellow-400" : "text-red-500"
                )}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          {/* Uptime Bar */}
          <div className="mt-8 border border-border-strong bg-background p-5 md:p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">90-Day Uptime</span>
              <span className="font-mono text-sm font-bold text-foreground">99.9%</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 90 }, (_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "flex-1 h-6 md:h-8 rounded-sm",
                    i === 87 ? "bg-yellow-400/60" : "bg-green-500/60"
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-mono text-[9px] text-secondary">90 days ago</span>
              <span className="font-mono text-[9px] text-secondary">Today</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ────────────────────────────────────────────────────── */}
      <section className="sp-contact py-16 md:py-24 px-4 sm:px-10 md:px-16 lg:px-20 bg-background">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left: Info */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="sp-contact-el inline-flex items-center gap-2 border border-border-strong bg-surface px-2.5 py-1 mb-6">
              <Mail className="w-3 h-3 text-accent" />
              <span className="font-mono text-[10px] tracking-widest text-secondary uppercase">Contact // Ticket</span>
            </div>
            <h2 className="sp-contact-el text-2xl md:text-4xl font-display font-black uppercase tracking-tight text-foreground leading-tight mb-5">
              Open a <span className="text-accent">Ticket</span>
            </h2>
            <p className="sp-contact-el font-mono text-xs text-secondary leading-relaxed border-l-2 border-accent pl-4 mb-10">
              Can&apos;t find your answer in the FAQ? Open a support ticket and our engineering team will get back to you.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: Clock, label: "Response Time", val: "< 2 hours" },
                { icon: Zap, label: "Priority Queue", val: "SYS Plan" },
                { icon: MessageSquare, label: "Support Hours", val: "24/7 Mon–Fri" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="sp-contact-el flex items-center gap-4 border border-border-strong bg-surface p-4">
                    <div className="w-9 h-9 border border-border-strong bg-background flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-secondary uppercase tracking-widest">{item.label}</div>
                      <div className="font-mono text-xs font-bold text-foreground">{item.val}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Form */}
          <div className="flex-1 max-w-2xl">
            {submitted ? (
              <div className="sp-contact-el border border-green-500/40 bg-green-500/5 p-10 flex flex-col items-center text-center gap-5">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <div>
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-foreground mb-2">Ticket Submitted</h3>
                  <p className="font-mono text-xs text-secondary">We&apos;ve received your message and will respond to {formState.email} within 2 hours.</p>
                </div>
                <button
                  onClick={() => { setSubmitted(false); setFormState({ name: "", email: "", subject: "", message: "" }); }}
                  className="font-mono text-xs border border-border-strong px-5 py-2.5 text-secondary hover:border-accent hover:text-foreground transition-colors"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sp-contact-el flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-secondary">Name</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
                      placeholder="Your name"
                      className="bg-surface border border-border-strong px-4 py-3 font-mono text-sm text-foreground placeholder:text-secondary/40 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="sp-contact-el flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-secondary">Email</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState(s => ({ ...s, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="bg-surface border border-border-strong px-4 py-3 font-mono text-sm text-foreground placeholder:text-secondary/40 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div className="sp-contact-el flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-secondary">Subject</label>
                  <select
                    required
                    value={formState.subject}
                    onChange={(e) => setFormState(s => ({ ...s, subject: e.target.value }))}
                    className="bg-surface border border-border-strong px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a topic...</option>
                    <option value="account">Account & Billing</option>
                    <option value="playback">Playback Issues</option>
                    <option value="ai">AI Playlist Issues</option>
                    <option value="api">API & Integration</option>
                    <option value="privacy">Privacy & Data</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="sp-contact-el flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-secondary">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={formState.message}
                    onChange={(e) => setFormState(s => ({ ...s, message: e.target.value }))}
                    placeholder="Describe your issue in detail. Include any error codes, steps to reproduce, and what you've already tried..."
                    className="bg-surface border border-border-strong px-4 py-3 font-mono text-sm text-foreground placeholder:text-secondary/40 focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>

                <div className="sp-contact-el">
                  <button
                    type="submit"
                    className="group relative flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 font-mono text-xs font-bold tracking-[0.1em] uppercase hover:-translate-y-0.5 hover:translate-x-0.5 transition-transform w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-accent translate-y-[4px] -translate-x-[4px] -z-10 group-hover:translate-y-[2px] group-hover:-translate-x-[2px] transition-transform" />
                    <Send className="w-4 h-4" />
                    <span>Submit Ticket</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── EMERGENCY CONTACTS ──────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 px-4 sm:px-10 md:px-16 lg:px-20 border-t border-border-strong bg-surface">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <p className="font-mono text-xs text-secondary mb-1 uppercase tracking-widest">Direct Channels</p>
            <div className="flex flex-wrap gap-4 md:gap-8 font-mono text-xs">
              <a href="mailto:support@sonar.dev" className="text-foreground hover:text-accent transition-colors flex items-center gap-2">
                <span className="text-accent">▸</span> support@sonar.dev
              </a>
              <a href="mailto:sys@sonar.dev" className="text-foreground hover:text-accent transition-colors flex items-center gap-2">
                <span className="text-accent">▸</span> sys@sonar.dev <span className="text-secondary/50">(Enterprise)</span>
              </a>
              <a href="mailto:privacy@sonar.dev" className="text-foreground hover:text-accent transition-colors flex items-center gap-2">
                <span className="text-accent">▸</span> privacy@sonar.dev
              </a>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-xs text-secondary hover:text-accent transition-colors shrink-0"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Back to Home
          </Link>
        </div>
      </section>

    </main>
  );
}
