import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { 
  Globe, Palette, Code2, TestTube2, Bug, Lock, Rocket, 
  Sparkles, CheckCircle2, ChevronRight, 
  ArrowRight, Layers, ShieldCheck, Cpu
} from "lucide-react";
import logoImg from "../assets/logo.jpg";

export interface PipelineAgent {
  step: string;
  name: string;
  role: string;
  description: string;
  icon: React.ElementType;
  outputBadge: string;
  accentColor: string;
  telemetry: string[];
}

export const PIPELINE_AGENTS: PipelineAgent[] = [
  {
    step: "01",
    name: "Requirement Agent",
    role: "User Stories & Architecture",
    description: "Translates your prompt into detailed user stories, page hierarchy, and responsive layout specifications.",
    icon: Globe,
    outputBadge: "Structure Mapped",
    accentColor: "#E11D48",
    telemetry: ["User Story Matrix", "Layout Hierarchy", "Content Outlines"]
  },
  {
    step: "02",
    name: "Design Agent",
    role: "Design System & Tokens",
    description: "Creates a complete design system with typography scales, color palettes, spacing rules, and component tokens.",
    icon: Palette,
    outputBadge: "Design Tokens",
    accentColor: "#F43F5E",
    telemetry: ["Color Palettes", "Typography Scale", "Component Spacing"]
  },
  {
    step: "03",
    name: "Code Agent",
    role: "Full Structure Construction",
    description: "Builds a complete, modern, and interactive website structure directly from design specifications.",
    icon: Code2,
    outputBadge: "Interactive Bundle",
    accentColor: "#E11D48",
    telemetry: ["Clean Component Tree", "Modern Styling", "State Handlers"]
  },
  {
    step: "04",
    name: "Testing Agent",
    role: "Validation & Accessibility",
    description: "Verifies structural integrity, accessibility standards, and multi-device responsiveness.",
    icon: TestTube2,
    outputBadge: "Passed Audit",
    accentColor: "#6366F1",
    telemetry: ["Accessibility Audit", "Viewport Tests", "Element Hierarchy"]
  },
  {
    step: "05",
    name: "Debug Agent",
    role: "Automated Alignment & Polish",
    description: "Refines layout alignment, interaction performance, and ensures smooth cross-device stability automatically.",
    icon: Bug,
    outputBadge: "Auto-Optimized",
    accentColor: "#EC4899",
    telemetry: ["Layout Correction", "Performance Boost", "Cross-Platform Check"]
  },
  {
    step: "06",
    name: "Security Agent",
    role: "Safety & Privacy Enforcement",
    description: "Audits for vulnerabilities, validates user input elements, and enforces strict safety and privacy standards.",
    icon: Lock,
    outputBadge: "0 Vulnerabilities",
    accentColor: "#10B981",
    telemetry: ["Input Sanitization", "Safety Audit", "Privacy Verification"]
  },
  {
    step: "07",
    name: "Deployment Agent",
    role: "Production Bundle & Launch",
    description: "Packages the complete, verified website, verifies assets, and prepares instant export and launch.",
    icon: Rocket,
    outputBadge: "Ready to Launch",
    accentColor: "#059669",
    telemetry: ["Asset Optimization", "Production Archive", "Instant Export"]
  }
];

export const PipelineWorkflowSection: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0);
  const [activeStageStep, setActiveStageStep] = useState<number>(0);

  // Cycle the active spotlight agent periodically for telemetry preview
  useEffect(() => {
    if (isPaused || hoveredAgent !== null) return;
    const interval = setInterval(() => {
      setActiveStageStep((prev) => (prev + 1) % PIPELINE_AGENTS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused, hoveredAgent]);

  // Triple set of agents ensures an uninterrupted, seamless infinite track
  const duplicatedAgents = [...PIPELINE_AGENTS, ...PIPELINE_AGENTS, ...PIPELINE_AGENTS];

  return (
    <section id="pipeline" className="relative py-24 sm:py-32 bg-[#090D16] text-white overflow-hidden select-none border-y border-slate-800">
      
      {/* ── AMBIENT GLOW & RADIAL GRADIENTS ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-[#E11D48]/15 via-[#E11D48]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      
      {/* Subtle Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold text-slate-300 mb-4 shadow-lg shadow-black/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E11D48] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E11D48]" />
            </span>
            <span className="text-[#E11D48] uppercase tracking-wider font-extrabold text-[11px]">The Pipeline</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-medium">Continuous Multi-Agent Flow</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            7 Specialized AI Agents
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl mx-auto leading-relaxed">
            Your project travels continuously through an autonomous seven-stage pipeline — each agent analyzing, refining, and advancing your website to production readiness.
          </p>
        </div>

        {/* ── TELEMETRY FLOW BAR (Idea to Production) ── */}
        <div className="mb-12 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-2xl max-w-5xl mx-auto hidden md:block">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            
            {/* Start Node */}
            <div className="flex items-center gap-2 shrink-0 px-2 py-1 bg-slate-800/80 rounded-lg text-[11px] font-bold text-slate-300">
              <Sparkles size={13} className="text-[#E11D48]" />
              <span>User Idea</span>
            </div>

            {PIPELINE_AGENTS.map((agent, idx) => {
              const isCurrent = activeStageStep === idx;
              const Icon = agent.icon;
              return (
                <React.Fragment key={agent.step}>
                  {/* Glowing Connection Track */}
                  <div className="h-0.5 w-6 lg:w-10 bg-slate-800 relative overflow-hidden shrink-0">
                    {isCurrent && (
                      <motion.div 
                        layoutId="activeTrackPulse"
                        className="absolute inset-0 bg-gradient-to-r from-[#E11D48] to-rose-400"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>

                  {/* Agent Node Pill */}
                  <button
                    onClick={() => {
                      setSelectedAgentIndex(idx);
                      setActiveStageStep(idx);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all shrink-0 text-[11px] font-semibold ${
                      isCurrent 
                        ? "bg-[#E11D48] text-white shadow-lg shadow-[#E11D48]/30 scale-105" 
                        : "bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50"
                    }`}
                  >
                    <Icon size={13} className={isCurrent ? "text-white animate-pulse" : "text-slate-400"} />
                    <span className="hidden lg:inline">{agent.name.replace(" Agent", "")}</span>
                    <span className="lg:hidden">{agent.step}</span>
                  </button>
                </React.Fragment>
              );
            })}

            {/* End Node */}
            <div className="h-0.5 w-6 lg:w-10 bg-slate-800 shrink-0" />
            <div className="flex items-center gap-2 shrink-0 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/30 rounded-lg text-[11px] font-bold text-emerald-400 shadow-sm shadow-emerald-500/20">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Production Website</span>
            </div>

          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── INFINITE CONTINUOUS HORIZONTAL PIPELINE TRACK ──                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div 
        className="relative w-full overflow-hidden py-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          setHoveredAgent(null);
        }}
      >
        {/* Left & Right Fade Gradients for Seamless Infinity */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 lg:w-48 bg-gradient-to-r from-[#090D16] via-[#090D16]/90 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 lg:w-48 bg-gradient-to-l from-[#090D16] via-[#090D16]/90 to-transparent z-20 pointer-events-none" />

        {/* Global Pipeline Laser Connection Line Behind Cards */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-800 to-transparent -translate-y-1/2 z-0">
          {/* Animated Traveling Data Pulse */}
          <div className="w-48 h-full bg-gradient-to-r from-transparent via-[#E11D48] to-transparent animate-pulse" />
        </div>

        {/* The Continuous Infinite Marquee Loop */}
        <div className="flex items-center">
          <div 
            className={`flex items-center gap-6 sm:gap-8 will-change-transform ${
              isPaused || hoveredAgent !== null ? "animate-marquee-paused" : "animate-marquee-smooth"
            }`}
            style={{
              width: "max-content",
            }}
          >
            {duplicatedAgents.map((agent, index) => {
              const uniqueKey = `${agent.step}-${index}`;
              const Icon = agent.icon;
              const isItemHovered = hoveredAgent === index;
              const isStageActive = (index % PIPELINE_AGENTS.length) === activeStageStep;

              return (
                <div
                  key={uniqueKey}
                  onMouseEnter={() => {
                    setHoveredAgent(index);
                    setActiveStageStep(index % PIPELINE_AGENTS.length);
                  }}
                  className={`relative group shrink-0 transition-all duration-300 cursor-pointer w-[320px] sm:w-[360px] ${
                    isStageActive || isItemHovered
                      ? "scale-105 z-10"
                      : "scale-95 opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* Outer Ambient Glow for Spotlight Card */}
                  <div 
                    className={`absolute -inset-1 rounded-3xl transition-opacity duration-300 blur-xl ${
                      isStageActive || isItemHovered 
                        ? "bg-[#E11D48]/30 opacity-100" 
                        : "bg-transparent opacity-0 group-hover:opacity-40 group-hover:bg-[#E11D48]/20"
                    }`} 
                  />

                  {/* Glassmorphic Agent Card */}
                  <div 
                    className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-7 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between h-[360px] ${
                      isStageActive || isItemHovered
                        ? "bg-slate-900/95 border-2 border-[#E11D48] shadow-2xl shadow-[#E11D48]/20 ring-4 ring-[#E11D48]/10"
                        : "bg-slate-900/75 border border-slate-800/90 shadow-xl hover:border-slate-700"
                    }`}
                  >
                    {/* Top Status Bar */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <span 
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs transition-all shadow-md ${
                            isStageActive || isItemHovered 
                              ? "bg-[#E11D48] text-white shadow-[#E11D48]/40" 
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {agent.step}
                        </span>
                        
                        {/* Live Processing Beacon */}
                        {(isStageActive || isItemHovered) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[#E11D48] text-[10px] font-bold tracking-wider uppercase animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                            Active Stage
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Pipeline Node
                          </span>
                        )}
                      </div>

                      {/* Agent Icon with Floating Micro-Bob */}
                      <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isStageActive || isItemHovered
                            ? "bg-gradient-to-br from-[#E11D48] to-[#BE123C] text-white shadow-lg shadow-[#E11D48]/30 scale-110"
                            : "bg-slate-800/80 text-slate-400 group-hover:text-white border border-slate-700"
                        }`}
                      >
                        <Icon size={18} className={isStageActive ? "animate-bounce-gentle" : ""} />
                      </div>
                    </div>

                    {/* Agent Name & Role */}
                    <div>
                      <div className="text-[11px] font-mono font-semibold text-[#E11D48] tracking-wider uppercase mb-1">
                        {agent.role}
                      </div>
                      <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:text-rose-200 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                        {agent.description}
                      </p>
                    </div>

                    {/* Telemetry Tags / Output Proof */}
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-mono text-[10px]">VERIFIED OUTPUT</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          {agent.outputBadge}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {agent.telemetry.map((t, i) => (
                          <span 
                            key={i} 
                            className="text-[9px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Connector arrow indicator on right */}
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 z-10 group-hover:border-[#E11D48] group-hover:text-[#E11D48] shadow-sm">
                      <ChevronRight size={12} />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>



      </div>

    </section>
  );
};
