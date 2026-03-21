'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Target,
  CalendarClock,
  MessageSquareText,
  FileCheck,
  ShieldCheck,
  Crosshair,
  Upload,
  ClipboardPaste,
  BarChart3,
  Check,
  X,
  Menu,
  ChevronRight,
  Zap,
  ArrowRight,
} from 'lucide-react';

/* ─── Animated counter hook ─── */
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const fitScore = useCounter(82, 1800, statsVisible);
  const runway = useCounter(124, 1800, statsVisible);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen bg-[#060A12] text-white overflow-x-hidden"
      style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
    >

      {/* ── Grid texture overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(251,191,36,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(251,191,36,0.4) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-amber-400/3 rounded-full blur-[100px]" />
      </div>

      {/* ══════════════════════════════════════════
          NAV
      ══════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#060A12]/95 backdrop-blur-xl border-b border-white/8 shadow-xl shadow-black/40'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-8 h-8 bg-amber-400 rotate-45 rounded-sm group-hover:rotate-[90deg] transition-transform duration-500" />
              <div className="absolute inset-0 w-8 h-8 bg-amber-400/30 rotate-45 rounded-sm blur-md group-hover:blur-lg transition-all duration-500" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Vet<span className="text-amber-400">SITREP</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">About</Link>
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">Pricing</Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">Sign In</Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-black text-sm font-semibold rounded-lg hover:bg-amber-300 transition-all duration-200 cursor-pointer shadow-lg shadow-amber-400/20 hover:shadow-amber-400/40"
            >
              Get Started <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A0F1A]/98 backdrop-blur-xl border-t border-white/8 px-6 py-4 flex flex-col gap-4">
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors py-2 cursor-pointer">About</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors py-2 cursor-pointer">Pricing</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors py-2 cursor-pointer">Sign In</Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-400 text-black font-semibold rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 py-24 w-full">
          <div className={`max-w-4xl transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/8 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase">Built by a Veteran · For Veterans</span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Don&apos;t Take Your
              <br />
              <span className="relative inline-block">
                <span className="text-amber-400">Next Job Blind.</span>
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-amber-400/60 to-transparent" />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mb-10">
              AI-powered career intelligence for transitioning service members.
              Upload your resume, paste any job posting, and get a full tactical
              assessment — fit score, financial runway, callback diagnostic,
              and a personalized 90-day transition plan.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/signup"
                className="group flex items-center justify-center gap-2 px-7 py-4 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-300 transition-all duration-200 cursor-pointer shadow-xl shadow-amber-400/25 hover:shadow-amber-400/45 hover:-translate-y-0.5"
              >
                Start Your Assessment
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 px-7 py-4 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/5 hover:border-white/25 transition-all duration-200 cursor-pointer backdrop-blur-sm"
              >
                See How It Works
              </a>
            </div>

            {/* Stats bar */}
            <div ref={statsRef} className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/8">
              <div>
                <div
                  className="text-3xl font-bold text-white mb-0.5"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  {fitScore / 10}
                  <span className="text-amber-400">/10</span>
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Avg Fit Score</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div
                  className="text-3xl font-bold text-white mb-0.5"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  {(runway / 10).toFixed(1)}
                  <span className="text-amber-400"> mo</span>
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Avg Financial Runway</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative right side element */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[45%] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#060A12] z-10" />
          {/* Hexagon grid visual */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute border border-amber-400/20 rotate-45"
                style={{
                  width: `${40 + (i % 4) * 20}px`,
                  height: `${40 + (i % 4) * 20}px`,
                  top: `${(i * 97) % 100}%`,
                  left: `${(i * 137) % 80}%`,
                  animationDelay: `${i * 0.3}s`,
                  opacity: 0.3 + (i % 3) * 0.2,
                }}
              />
            ))}
          </div>
          {/* Floating cards */}
          <div className="absolute top-1/4 right-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 w-64 shadow-2xl"
            style={{ animation: 'float 6s ease-in-out infinite' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center">
                <Target size={16} className="text-amber-400" />
              </div>
              <span className="text-sm font-semibold">Fit Analysis</span>
            </div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-400">Job Match Score</span>
              <span className="text-2xl font-bold text-amber-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>8.4</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>
          <div className="absolute top-1/2 right-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 w-56 shadow-2xl"
            style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '2s' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">90-Day Plan Active</span>
            </div>
            <div className="text-sm font-semibold mb-1">Week 3 of 12</div>
            <div className="text-xs text-slate-500">Network outreach campaign</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-28">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Process</span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Three Steps to Clarity
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              From upload to actionable intelligence in minutes.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector lines */}
            <div className="hidden md:block absolute top-14 left-[33%] right-[33%] h-px bg-gradient-to-r from-amber-400/30 via-amber-400/60 to-amber-400/30" />

            {[
              { icon: Upload, num: '01', title: 'Upload Your Resume', desc: 'Paste or upload your resume. SITREP maps your MOS, skills, and experience automatically.' },
              { icon: ClipboardPaste, num: '02', title: 'Paste a Job Posting', desc: 'Drop in any job URL or description. The AI analyzes it against your profile instantly.' },
              { icon: BarChart3, num: '03', title: 'Get Your Intel', desc: 'Receive your fit score, callback diagnostic, target roles, application strategy, and 90-day plan.' },
            ].map(({ icon: Icon, num, title, desc }, i) => (
              <div
                key={num}
                className="group relative bg-white/3 hover:bg-white/6 border border-white/8 hover:border-amber-400/30 rounded-2xl p-8 transition-all duration-300 cursor-default"
              >
                {/* Number badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center group-hover:bg-amber-400/20 transition-colors duration-300">
                    <Icon size={22} className="text-amber-400" />
                  </div>
                  <span
                    className="text-5xl font-bold text-white/8 group-hover:text-amber-400/20 transition-colors duration-300 select-none"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {num}
                  </span>
                </div>
                <h3
                  className="text-lg font-bold mb-3"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  {title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400/40 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — BENTO GRID
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-28 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <span className="inline-block text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Capabilities</span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Your Full Arsenal
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Every tool you need to execute a successful transition.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Target,
                title: 'AI Job Fit Analysis',
                desc: 'Get a fit score showing exactly how your military skills and experience match any civilian role.',
                accent: 'amber',
                size: 'normal',
              },
              {
                icon: CalendarClock,
                title: '90-Day Transition Plan',
                desc: 'AI-generated personalized plan to get you from separation to settled in 90 days.',
                accent: 'blue',
                size: 'normal',
              },
              {
                icon: MessageSquareText,
                title: 'AI Transition Q&A',
                desc: 'Ask anything about your transition. Get answers tailored to your situation, not generic advice.',
                accent: 'emerald',
                size: 'normal',
              },
              {
                icon: FileCheck,
                title: 'Document Prep Tracker',
                desc: 'Track every document you need — DD214, VA claims, resume versions — nothing falls through the cracks.',
                accent: 'purple',
                size: 'normal',
              },
              {
                icon: ShieldCheck,
                title: 'Benefits Checklist',
                desc: 'Comprehensive checklist of every benefit you\'ve earned. GI Bill, VA healthcare, disability — all tracked.',
                accent: 'amber',
                size: 'normal',
              },
              {
                icon: Crosshair,
                title: 'Callback Diagnostic',
                desc: 'Find out why you\'re not getting interviews. AI identifies positioning issues and keyword gaps.',
                accent: 'red',
                size: 'normal',
              },
            ].map(({ icon: Icon, title, desc, accent }) => {
              const accentMap: Record<string, string> = {
                amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20 group-hover:bg-amber-400/20',
                blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20 group-hover:bg-blue-400/20',
                emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 group-hover:bg-emerald-400/20',
                purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20 group-hover:bg-purple-400/20',
                red: 'text-red-400 bg-red-400/10 border-red-400/20 group-hover:bg-red-400/20',
              };
              return (
                <div
                  key={title}
                  className="group bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-2xl p-7 transition-all duration-300 cursor-default hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 transition-all duration-300 ${accentMap[accent]}`}>
                    <Icon size={20} />
                  </div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                  >
                    {title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMPARISON
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-28">
        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-16">
            <span className="inline-block text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Advantage</span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Why SITREP, Not ChatGPT?
            </h2>
            <p className="text-slate-400 text-lg">
              ChatGPT gives generic answers. SITREP gives mission-specific intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* ChatGPT col */}
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-8 py-5 border-b border-white/8 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="font-semibold text-slate-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>ChatGPT</span>
              </div>
              <div className="p-8 flex flex-col gap-5">
                {[
                  'Starts from scratch every time',
                  'Generic career advice for anyone',
                  'Walls of text, no structured output',
                  'No tracking or progress over time',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <X size={11} className="text-slate-400" />
                    </div>
                    <span className="text-slate-400 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SITREP col */}
            <div className="bg-amber-400/5 border border-amber-400/25 rounded-2xl overflow-hidden shadow-xl shadow-amber-400/5">
              <div className="px-8 py-5 border-b border-amber-400/15 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-semibold text-amber-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>SITREP</span>
              </div>
              <div className="p-8 flex flex-col gap-5">
                {[
                  'Your resume, finances, and MOS always factored in',
                  'Built for military-to-civilian transition specifically',
                  'Fit scores, stability ratings, and actionable plans',
                  'Track assessments and progress across multiple jobs',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-amber-400" />
                    </div>
                    <span className="text-white text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-28 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-4xl mx-auto px-6">

          <div className="text-center mb-16">
            <span className="inline-block text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Pricing</span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Choose Your Tier
            </h2>
            <p className="text-slate-400 text-lg">
              Start free. Upgrade when you need the full arsenal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <span
                  className="text-sm font-semibold text-slate-400 uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Basic
                </span>
                <div className="mt-3 flex items-end gap-1">
                  <span
                    className="text-5xl font-bold"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    $0
                  </span>
                  <span className="text-slate-400 mb-2">/forever</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">Get started with limited AI-powered assessments.</p>
              </div>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {['Limited job assessments', 'Basic transition Q&A', 'Document tracker', 'Benefits checklist'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check size={14} className="text-slate-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center py-3.5 px-6 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/5 hover:border-white/25 transition-all duration-200 cursor-pointer"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-gradient-to-b from-amber-400/10 to-amber-400/3 border border-amber-400/35 rounded-2xl p-8 flex flex-col shadow-2xl shadow-amber-400/10">
              {/* Recommended badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 px-4 py-1 bg-amber-400 rounded-full text-black text-xs font-bold">
                  <Zap size={11} />
                  RECOMMENDED
                </div>
              </div>

              <div className="mb-6 pt-2">
                <span
                  className="text-sm font-semibold text-amber-400 uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Pro
                </span>
                <div className="mt-3 flex items-end gap-1">
                  <span
                    className="text-5xl font-bold"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    $15
                  </span>
                  <span className="text-slate-400 mb-2">/month</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">Full access to every tool in the platform.</p>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {[
                  '50 job assessments/month',
                  '500 AI Q&A messages/month',
                  '5 transition plans/month',
                  'Callback diagnostics',
                  'Target role mapping',
                  'Application strategy',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white">
                    <div className="w-4 h-4 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                      <Check size={9} className="text-amber-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="group flex items-center justify-center gap-2 py-3.5 px-6 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-300 transition-all duration-200 cursor-pointer shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50"
              >
                Upgrade to Pro
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-amber-400/5 rounded-full blur-[80px]" />
          </div>

          <div className="relative bg-white/3 border border-white/10 rounded-3xl p-14 overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-400/5 rounded-tl-full" />

            <span className="inline-block text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">Mission Ready</span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-5"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Ready to Get Your SITREP?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Stop guessing. Start planning. Assess your next opportunity with
              the same rigor you applied to every mission.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group flex items-center gap-2 px-8 py-4 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-300 transition-all duration-200 cursor-pointer shadow-xl shadow-amber-400/30 hover:shadow-amber-400/50 hover:-translate-y-0.5"
              >
                Start Free Assessment
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 px-8 py-4 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/5 hover:border-white/25 transition-all duration-200 cursor-pointer"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/8 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-amber-400 rotate-45 rounded-sm" />
            <span
              className="font-bold text-sm"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Vet<span className="text-amber-400">SITREP</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs text-center">
            © {new Date().getFullYear()} VetSITREP. Built by a veteran, for veterans.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-slate-500 text-xs hover:text-white transition-colors cursor-pointer">About</Link>
            <Link href="/pricing" className="text-slate-500 text-xs hover:text-white transition-colors cursor-pointer">Pricing</Link>
            <Link href="/login" className="text-slate-500 text-xs hover:text-white transition-colors cursor-pointer">Sign In</Link>
          </div>
        </div>
      </footer>

      {/* ── Float animation keyframes ── */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
