import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  Sparkles, FileText, Users, Rocket, ArrowRight, 
  CheckCircle2, Code2, Globe, Cpu, Layers, Download
} from "lucide-react";
import logoImg from "../assets/logo.jpg";

export const HowItWorksSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Bind scroll progress directly to this section's scroll duration
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Butter-smooth spring physics for bidirectional scrub
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001
  });

  // ── Phase 1: Step 1 (Describe Your Website) enters [0.05 -> 0.35] ──
  const step1X = useTransform(smooth, [0.05, 0.32], [-80, 0]);
  const step1Opacity = useTransform(smooth, [0.05, 0.28], [0, 1]);
  const step1Scale = useTransform(smooth, [0.05, 0.32], [0.92, 1]);
  const step1Rotate = useTransform(smooth, [0.05, 0.32], [-3, 0]);

  // ── Connector 1 (Step 1 -> Step 2) draws in [0.28 -> 0.48] ──
  const conn1Progress = useTransform(smooth, [0.28, 0.48], [0, 1]);
  const conn1Opacity = useTransform(smooth, [0.28, 0.42], [0, 1]);

  // ── Phase 2: Step 2 (7 Agents Collaborate) enters [0.35 -> 0.65] ──
  // Enters from opposite side (top/right) and takes visual spotlight
  const step2X = useTransform(smooth, [0.32, 0.58], [80, 0]);
  const step2Y = useTransform(smooth, [0.32, 0.58], [25, 0]);
  const step2Opacity = useTransform(smooth, [0.32, 0.52], [0, 1]);
  const step2Scale = useTransform(smooth, [0.32, 0.58, 0.85], [0.92, 1.05, 1.02]);
  const step2Rotate = useTransform(smooth, [0.32, 0.58], [3, 0]);

  // ── Connector 2 (Step 2 -> Step 3) draws in [0.55 -> 0.75] ──
  const conn2Progress = useTransform(smooth, [0.55, 0.75], [0, 1]);
  const conn2Opacity = useTransform(smooth, [0.55, 0.68], [0, 1]);

  // ── Phase 3: Step 3 (Download & Deploy) enters [0.62 -> 0.90] ──
  const step3X = useTransform(smooth, [0.62, 0.88], [90, 0]);
  const step3Opacity = useTransform(smooth, [0.62, 0.82], [0, 1]);
  const step3Scale = useTransform(smooth, [0.62, 0.88], [0.92, 1]);
  const step3Rotate = useTransform(smooth, [0.62, 0.88], [3, 0]);

  // ── Step 1 settling & subtle focus shift as other steps emerge ──
  const step1Dim = useTransform(smooth, [0.45, 0.7], [1, 0.94]);

  // ── Final Phase: Pipeline Badge & Summary Banner [0.82 -> 0.98] ──
  const bannerOpacity = useTransform(smooth, [0.82, 0.95], [0, 1]);
  const bannerY = useTransform(smooth, [0.82, 0.95], [20, 0]);

  // Active step progress indicator for top pill
  const activeStep = useTransform(smooth, (val) => {
    if (val < 0.35) return 1;
    if (val < 0.68) return 2;
    return 3;
  });

  return (
    <div 
      id="how-it-works"
      ref={containerRef} 
      className="relative h-[260vh] bg-slate-50/60 border-t border-slate-200"
    >
      {/* Pinned Sticky Viewport Frame */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
        
        {/* Subtle Background Mesh Canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50 -z-10" />
        
        {/* Ambient Warm Gradient Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-r from-rose-100/40 via-rose-50/20 to-slate-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-700 mb-3">
            <img src={logoImg} alt="WEBNTRA" className="w-4 h-4 rounded-full object-cover" />
            <span className="uppercase tracking-wider text-[11px] text-[#E11D48]">How It Works</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-medium">Scroll to explore workflow</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            From Idea to Website in 3 Steps
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
            Simply describe what you want, and our intelligent pipeline handles everything else.
          </p>

          {/* Workflow Stage Tracker */}
          <div className="mt-4 inline-flex items-center gap-3 px-4 py-1 rounded-full bg-white/80 border border-slate-200 text-xs font-semibold text-slate-600 shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
              <span>Step 1: Input</span>
            </span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Step 2: 7 AI Agents</span>
            </span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Step 3: Deploy</span>
            </span>
          </div>
        </div>

        {/* ── 3-STEP PIPELINE CARDS GRID ── */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center relative">
          
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STEP 1: Describe Your Website                                       */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <motion.div
            style={{
              x: step1X,
              opacity: step1Opacity,
              scale: step1Scale,
              rotate: step1Rotate,
            }}
            className="relative bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 flex flex-col justify-between h-full min-h-[340px] hover:shadow-2xl transition-shadow will-change-transform group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-[#E11D48] flex items-center justify-center font-black text-sm shadow-sm">
                    01
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Input & Vision
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#E11D48] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText size={18} />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-slate-900 mb-2.5 tracking-tight group-hover:text-[#E11D48] transition-colors">
                Describe Your Website
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Type a natural language description or attach reference images, videos, and files to guide the build process.
              </p>

              {/* Interactive Visual Cue Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="truncate">"Modern SaaS with dark mode & pricing"</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/70 text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-600">
                    + Attachments
                  </span>
                  <span>UI screenshots · sketches · specs</span>
                </div>
              </div>
            </div>

            {/* Bottom State Pill */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Phase 1: Input Ready</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                Prompts & Assets
              </span>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* CONNECTOR 1 (Desktop)                                               */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <motion.div 
            style={{ opacity: conn1Opacity }}
            className="hidden lg:flex absolute left-[31.5%] top-1/2 -translate-y-1/2 z-20 items-center pointer-events-none"
          >
            <div className="relative w-8 flex items-center justify-center">
              <motion.div 
                style={{ scaleX: conn1Progress }}
                className="w-8 h-0.5 bg-gradient-to-r from-[#E11D48] to-indigo-500 origin-left"
              />
              <motion.div 
                style={{ opacity: conn1Progress }}
                className="w-2 h-2 rounded-full bg-indigo-500 absolute -right-0.5 shadow-sm shadow-indigo-500/50"
              />
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: 7 Agents Collaborate (Primary / Featured Card)              */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <motion.div
            style={{
              x: step2X,
              y: step2Y,
              opacity: step2Opacity,
              scale: step2Scale,
              rotate: step2Rotate,
            }}
            className="relative bg-gradient-to-b from-rose-50/60 via-white to-white border-2 border-[#E11D48] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl shadow-[#E11D48]/15 flex flex-col justify-between h-full min-h-[360px] z-10 will-change-transform group"
          >
            {/* Primary Spotlight Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#E11D48] text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md shadow-[#E11D48]/30 flex items-center gap-1.5">
              <Cpu size={12} className="animate-spin-slow" />
              <span>Autonomous Core</span>
            </div>

            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-5 mt-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-[#E11D48] text-white flex items-center justify-center font-black text-sm shadow-md shadow-[#E11D48]/25">
                    02
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-[#E11D48]">
                    AI Multi-Agent Pipeline
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-rose-200/90 group-hover:scale-105 transition-transform bg-white p-0.5">
                  <img src={logoImg} alt="WEBNTRA" className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-slate-900 mb-2.5 tracking-tight group-hover:text-[#E11D48] transition-colors">
                7 Agents Collaborate
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                Our specialized agents work together — analyzing requirements, designing, coding, testing, debugging, securing, and deploying.
              </p>

              {/* Interactive Visual Cue Box: 7 Agents Micro-Grid */}
              <div className="bg-white/90 border border-rose-200/80 rounded-xl p-3.5 space-y-2 text-xs shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Synchronized Pipeline</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#E11D48] bg-rose-50 px-2 py-0.5 rounded-md font-bold">
                    7 / 7 Active
                  </span>
                </div>
                
                {/* Micro tags for the 7 stages */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {[
                    "Requirement", "Design", "Code", 
                    "Testing", "Debug", "Security", "Deployment"
                  ].map((agent, idx) => (
                    <span 
                      key={agent} 
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${
                        idx < 3 ? "bg-rose-50 text-[#E11D48] border border-rose-100" :
                        idx < 5 ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                        "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom State Pill */}
            <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold text-slate-800">Phase 2: Intelligent Pipeline</span>
              <span className="text-[#E11D48] font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                Continuous Audit
              </span>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* CONNECTOR 2 (Desktop)                                               */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <motion.div 
            style={{ opacity: conn2Opacity }}
            className="hidden lg:flex absolute left-[65%] top-1/2 -translate-y-1/2 z-20 items-center pointer-events-none"
          >
            <div className="relative w-8 flex items-center justify-center">
              <motion.div 
                style={{ scaleX: conn2Progress }}
                className="w-8 h-0.5 bg-gradient-to-r from-[#E11D48] to-emerald-500 origin-left"
              />
              <motion.div 
                style={{ opacity: conn2Progress }}
                className="w-2 h-2 rounded-full bg-emerald-500 absolute -right-0.5 shadow-sm shadow-emerald-500/50"
              />
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STEP 3: Download & Deploy                                           */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <motion.div
            style={{
              x: step3X,
              opacity: step3Opacity,
              scale: step3Scale,
              rotate: step3Rotate,
            }}
            className="relative bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 flex flex-col justify-between h-full min-h-[340px] hover:shadow-2xl transition-shadow will-change-transform group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm shadow-sm">
                    03
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Production Output
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Rocket size={18} />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-slate-900 mb-2.5 tracking-tight group-hover:text-emerald-600 transition-colors">
                Download & Deploy
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Get a complete, production-ready website package. Download instantly and publish anywhere — zero dependencies.
              </p>

              {/* Interactive Visual Cue Box: Production Files */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-700">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Download size={13} className="text-emerald-600" />
                    <span>production-website.zip</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Complete Package</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/70 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 size={11} /> 1-Click Export
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 size={11} /> Fully Responsive
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 size={11} /> Ready to Launch
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom State Pill */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Phase 3: Shipped</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Download size={13} />
                1-Click Export
              </span>
            </div>
          </motion.div>

        </div>

        {/* ── FINAL STATE COMPOSITION BANNER [Reveals smoothly as pipeline connects] ── */}
        <motion.div 
          style={{
            opacity: bannerOpacity,
            y: bannerY,
          }}
          className="mt-8 sm:mt-10 w-full max-w-4xl mx-auto will-change-transform"
        >
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#E11D48]/30">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#E11D48] uppercase tracking-wider">
                  Pipeline Verified
                </div>
                <div className="text-sm font-bold text-white">
                  User Idea <span className="text-slate-400">→</span> 7 AI Agents <span className="text-slate-400">→</span> Production Website
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Scroll down to inspect individual agents</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
