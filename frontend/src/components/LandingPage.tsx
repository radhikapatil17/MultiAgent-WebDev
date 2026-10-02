import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  Sparkles, ArrowRight, Wand2, ShieldCheck, Code2, Zap, 
  Terminal, Layers, CheckCircle2, ChevronRight, ChevronDown,
  Image, Video, Paperclip, Camera, X, Star, ArrowUpRight,
  Globe, Palette, TestTube2, Bug, Lock, Rocket, Users, BarChart3,
  Clock, Shield, FileText, Play, Plus, Download, Quote
} from "lucide-react";
import { User } from "../types";
import { HowItWorksSection } from "./HowItWorksSection";
import { PipelineWorkflowSection } from "./PipelineWorkflowSection";
import logoImg from "../assets/logo.jpg";

interface LandingPageProps {
  user: User | null;
  onStartWithPrompt: (prompt: string) => void;
  onOpenAuth: (reason?: string) => void;
}

/* ── Animation Variants ── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeIn: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const staggerContainer: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

/* ── Section Wrapper with InView animation ── */
const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = "", id }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ── Data ── */
const BLUEPRINTS = [
  {
    title: "Cloud Management Console",
    category: "Enterprise SaaS",
    description: "Multi-region cloud management console with live resource metrics, node status, and pricing calculator.",
    tags: ["Cloud", "Dashboard", "Real-time"],
    prompt: "Create an enterprise cloud management landing page with live metrics preview, server pricing calculator, and client trust logos.",
    icon: Globe,
    color: "#3B82F6",
    gradient: "from-blue-500/10 via-sky-500/5 to-transparent"
  },
  {
    title: "FinTech Payment Platform",
    category: "Financial Tech",
    description: "High-conversion financial services platform featuring transaction flow previews, security compliance badges, and integration docs.",
    tags: ["Fintech", "Security", "SaaS"],
    prompt: "Build an ultra-modern FinTech landing page with interactive currency conversion, feature highlight tabs, and pricing tiers.",
    icon: ShieldCheck,
    color: "#10B981",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent"
  },
  {
    title: "Creative Studio Portfolio",
    category: "Agency & Studio",
    description: "Minimalist engineering consultancy portfolio showcasing interactive case studies, performance metrics, and contact inquiry.",
    tags: ["Portfolio", "Minimal", "Creative"],
    prompt: "Generate a sleek, minimalist digital engineering studio portfolio showcasing case studies, services grid, interactive testimonials, and booking form.",
    icon: Palette,
    color: "#8B5CF6",
    gradient: "from-purple-500/10 via-violet-500/5 to-transparent"
  },
  {
    title: "Telehealth Network",
    category: "Healthcare",
    description: "Accessible telemedicine platform with provider scheduling, doctor specialty directory, and patient portal preview.",
    tags: ["Healthcare", "Booking", "Accessible"],
    prompt: "Design a clean, accessible telehealth network website with appointment booking modal, provider specialty directory, and patient reviews.",
    icon: Sparkles,
    color: "#E11D48",
    gradient: "from-rose-500/10 via-pink-500/5 to-transparent"
  }
];

const TESTIMONIALS = [
  { 
    name: "Sarah Chen", 
    role: "CTO, Apex Technologies", 
    text: "WEBNTRA cut our launch time from weeks to minutes. The quality of generated websites is production-ready.", 
    rating: 5,
    tag: "⚡ 10x Faster Launch" 
  },
  { 
    name: "Marcus Rivera", 
    role: "Product Lead, Nova Labs", 
    text: "The 7-agent pipeline ensures every aspect is covered — from design tokens to security audits. Incredibly thorough.", 
    rating: 5,
    tag: "🛡️ 7-Agent Engine" 
  },
  { 
    name: "Priya Sharma", 
    role: "Design Lead, Crafted Digital", 
    text: "I was skeptical about AI-generated websites, but WEBNTRA consistently delivers clean, high-performance websites.", 
    rating: 5,
    tag: "🎨 Design Excellence" 
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  user,
  onStartWithPrompt,
  onOpenAuth
}) => {
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Continuous scroll-driven convergence animation for the hero section
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Silky spring physics for butter-smooth scrubbing
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001
  });

  // Top status pill converges downward toward the central composition
  const pillY = useTransform(smoothProgress, [0, 0.7], [0, 36]);
  const pillScale = useTransform(smoothProgress, [0, 0.7], [1, 0.94]);
  const pillOpacity = useTransform(smoothProgress, [0, 0.7, 0.95], [1, 0.88, 0.25]);

  // Headline text elements converge inwards toward center
  // Left element: "Describe" moves down & inward right
  const descX = useTransform(smoothProgress, [0, 0.7], [0, 32]);
  const descY = useTransform(smoothProgress, [0, 0.7], [0, 16]);
  const descScale = useTransform(smoothProgress, [0, 0.7], [1, 0.96]);

  // Right element: "Your Vision." moves down & inward left
  const visionX = useTransform(smoothProgress, [0, 0.7], [0, -32]);
  const visionY = useTransform(smoothProgress, [0, 0.7], [0, 16]);
  const visionScale = useTransform(smoothProgress, [0, 0.7], [1, 0.96]);

  // Bottom focal line: "We'll Build It." moves upward toward the top line and tightens
  const buildY = useTransform(smoothProgress, [0, 0.7], [0, -22]);
  const buildScale = useTransform(smoothProgress, [0, 0.7], [1, 1.05]);

  // Subtitle converges upward toward the central composition
  const subtitleY = useTransform(smoothProgress, [0, 0.7], [0, -32]);
  const subtitleScale = useTransform(smoothProgress, [0, 0.7], [1, 0.95]);
  const subtitleOpacity = useTransform(smoothProgress, [0, 0.7, 0.95], [1, 0.85, 0.3]);

  // Prompt composer card moves upward with parallax depth
  const composerY = useTransform(smoothProgress, [0, 0.7], [0, -42]);
  const composerScale = useTransform(smoothProgress, [0, 0.7], [1, 0.985]);

  // Ambient glow contracts toward center composition
  const glowScale = useTransform(smoothProgress, [0, 0.7], [1, 0.82]);
  const glowOpacity = useTransform(smoothProgress, [0, 0.7], [0.65, 0.9]);

  // Typewriter placeholder prompts
  const TYPEWRITER_PROMPTS = [
    "Build a modern portfolio website for a software engineer with a dark theme...",
    "Create an e-commerce website for a fashion brand with product filtering...",
    "Build a SaaS dashboard with analytics, authentication and subscriptions...",
    "Create a restaurant website with online reservations and a beautiful menu...",
    "Design an ultra-clean healthcare platform with appointment booking...",
    "Create a real estate portal with virtual tours and mortgage calculator..."
  ];

  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Pause animation if user is actively entering text
    if (prompt.length > 0) return;

    const currentPrompt = TYPEWRITER_PROMPTS[typewriterIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (typewriterText.length < currentPrompt.length) {
        // Natural human-like typing speed variation (35-50ms)
        const delay = Math.random() * 15 + 35;
        timeout = setTimeout(() => {
          setTypewriterText(currentPrompt.slice(0, typewriterText.length + 1));
        }, delay);
      } else {
        // Sentence completed: hold pause so it can be read
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2400);
      }
    } else {
      if (typewriterText.length > 0) {
        // Smooth and quick backspacing speed (18-22ms)
        timeout = setTimeout(() => {
          setTypewriterText(currentPrompt.slice(0, typewriterText.length - 1));
        }, 20);
      } else {
        // Finished deleting: pause briefly then cycle to next prompt
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setTypewriterIndex((prev) => (prev + 1) % TYPEWRITER_PROMPTS.length);
        }, 350);
      }
    }

    return () => clearTimeout(timeout);
  }, [typewriterText, isDeleting, typewriterIndex, prompt]);

  // Close attach popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setIsAttachOpen(false);
      }
    };
    if (isAttachOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAttachOpen]);

  const handleBuildClick = (customPrompt?: string) => {
    const text = (customPrompt || prompt).trim() || typewriterText || "Create an enterprise cloud management landing page with live metrics preview, server pricing calculator, and client trust logos.";
    onStartWithPrompt(text);
  };

  const handleFileAttach = (files: FileList | null) => {
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#E11D48]/15 selection:text-[#E11D48]">
      
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFileAttach(e.target.files)} />
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileAttach(e.target.files)} />
      <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleFileAttach(e.target.files)} />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION (Scroll-driven convergence)                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 w-full max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        
        {/* Subtle Architectural Dot Grid (Kleap-inspired ambient canvas) */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)] -z-10" />

        {/* Ambient Pulsing Background Glows */}
        <motion.div 
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[580px] bg-gradient-to-b from-rose-100/70 via-rose-50/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10 will-change-transform" 
        />
        <motion.div 
          animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[8%] w-[320px] h-[320px] bg-gradient-to-br from-rose-200/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" 
        />
        <motion.div 
          animate={{ x: [0, -15, 0], y: [0, 12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-28 left-[6%] w-[300px] h-[300px] bg-gradient-to-br from-slate-200/50 to-transparent rounded-full blur-3xl pointer-events-none -z-10" 
        />

        {/* Status Pill (Scroll-driven downward convergence) */}
        <motion.div 
          style={{ y: pillY, scale: pillScale, opacity: pillOpacity }}
          initial={{ opacity: 0, y: -16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.03 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-semibold text-slate-700 mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default will-change-transform"
        >
          <img src={logoImg} alt="WEBNTRA" className="w-4 h-4 rounded-full object-cover shadow-xs border border-rose-200" />
          <span>Now with 7 Autonomous AI Agents</span>
          <span className="text-slate-300">·</span>
          <span className="text-[#E11D48] font-bold">Production-Ready</span>
        </motion.div>

        {/* Headline with Scroll-Driven Convergence into Central Composition */}
        <div className="max-w-5xl text-4xl sm:text-6xl md:text-7xl lg:text-[4.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.06]">
          {/* Top Line: Left & Right elements smoothly converge inward */}
          <div className="inline-flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4">
            <motion.span
              style={{ x: descX, y: descY, scale: descScale }}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block will-change-transform"
            >
              Describe
            </motion.span>
            <motion.span
              style={{ x: visionX, y: visionY, scale: visionScale }}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block will-change-transform"
            >
              Your Vision.
            </motion.span>
          </div>

          {/* Bottom Line: converges upward toward center composition */}
          <div className="block mt-1 sm:mt-2">
            <motion.span
              style={{ y: buildY, scale: buildScale }}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block bg-gradient-to-r from-[#E11D48] via-[#FF2E63] to-[#BE123C] bg-clip-text text-transparent will-change-transform"
            >
              We'll Build It.
            </motion.span>
          </div>
        </div>

        {/* Subtitle (Scroll-driven upward convergence) */}
        <motion.p 
          style={{ y: subtitleY, scale: subtitleScale, opacity: subtitleOpacity }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-base sm:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed will-change-transform"
        >
          WEBNTRA uses 7 specialized AI agents to transform your ideas into
          production-ready websites — from requirements to deployment, in seconds.
        </motion.p>

        {/* ── PROMPT COMPOSER BOX (Scroll-driven gentle parallax elevation) ── */}
        <motion.div 
          style={{ y: composerY, scale: composerScale }}
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 w-full max-w-5xl xl:max-w-6xl text-left will-change-transform"
        >
          <div className="relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-2xl shadow-slate-200/80 border border-slate-200/90 focus-within:border-[#E11D48]/50 focus-within:ring-4 focus-within:ring-[#E11D48]/10 transition-all duration-300">
            
            {/* Input Textarea Container with Layered Typewriter Placeholder */}
            <div className="relative min-h-[90px] sm:min-h-[110px]">
              
              {/* Typewriter Animated Placeholder Layer (only visible when prompt is empty) */}
              {!prompt && (
                <div 
                  className="absolute inset-0 pointer-events-none select-none text-slate-400 text-sm sm:text-base md:text-lg font-normal leading-relaxed overflow-hidden flex items-start flex-wrap"
                  aria-hidden="true"
                >
                  <span>{typewriterText}</span>
                  <span className="inline-block w-[2px] h-[1.15em] bg-[#E11D48] ml-0.5 translate-y-[2px] animate-cursor-blink align-baseline shadow-xs shrink-0" />
                </div>
              )}

              {/* Native Textarea */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleBuildClick();
                  }
                }}
                rows={3}
                className="relative z-10 w-full resize-none bg-transparent text-slate-900 text-sm sm:text-base md:text-lg font-normal focus:outline-none leading-relaxed min-h-[90px] sm:min-h-[110px]"
              />
            </div>

            {/* Attached Files Display */}
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={idx} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/70 border border-rose-200/80 rounded-lg text-xs text-slate-700 font-medium"
                  >
                    {file.type.startsWith("image/") ? <Image size={14} className="text-[#E11D48]" /> :
                     file.type.startsWith("video/") ? <Video size={14} className="text-[#E11D48]" /> :
                     <FileText size={14} className="text-[#E11D48]" />}
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeAttachment(idx)} 
                      className="text-slate-400 hover:text-red-500 transition p-0.5 rounded"
                      title="Remove attachment"
                    >
                      <X size={13} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Bottom Bar: stacks on mobile, spreads on desktop */}
            <div className="mt-4 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-100 gap-3 sm:gap-4">
              
              {/* Single Consolidated Attach Button with Popover */}
              <div ref={attachMenuRef} className="relative flex items-center justify-between sm:justify-start gap-2">
                
                {/* Single Attachment Trigger Button */}
                <button 
                  type="button"
                  onClick={() => setIsAttachOpen(!isAttachOpen)}
                  title="Attach references"
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    isAttachOpen || attachments.length > 0
                      ? "bg-rose-50 border-[#E11D48]/30 text-[#E11D48] shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Paperclip size={15} className={isAttachOpen ? "rotate-45 text-[#E11D48] transition-transform duration-200" : "transition-transform duration-200"} />
                  <span>Attach References</span>
                  {attachments.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#E11D48] text-white text-[10px] font-bold flex items-center justify-center">
                      {attachments.length}
                    </span>
                  )}
                </button>

                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Add images, video, documents, or photo references
                </span>

                {/* Floating Attach Menu Dropdown */}
                <AnimatePresence>
                  {isAttachOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 text-left"
                    >
                      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attach Reference</span>
                        <button 
                          type="button" 
                          onClick={() => setIsAttachOpen(false)} 
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      
                      <div className="p-1 space-y-1">
                        {/* Option 1: Images */}
                        <button
                          type="button"
                          onClick={() => {
                            imageInputRef.current?.click();
                            setIsAttachOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-[#E11D48] transition group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#E11D48] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                            <Image size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-[#E11D48]">Images & UI Designs</div>
                            <div className="text-[11px] text-slate-400">PNG, JPG, SVG, WebP screenshots</div>
                          </div>
                        </button>

                        {/* Option 2: Videos */}
                        <button
                          type="button"
                          onClick={() => {
                            videoInputRef.current?.click();
                            setIsAttachOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                            <Video size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Video Walkthroughs</div>
                            <div className="text-[11px] text-slate-400">MP4, WebM, screen captures</div>
                          </div>
                        </button>

                        {/* Option 3: Files & Documents */}
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setIsAttachOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 transition group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                            <FileText size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">Documents & Notes</div>
                            <div className="text-[11px] text-slate-400">PDF, TXT, MD, project notes</div>
                          </div>
                        </button>

                        {/* Option 4: Camera */}
                        <button
                          type="button"
                          onClick={() => {
                            const inp = document.createElement("input");
                            inp.type = "file";
                            inp.accept = "image/*";
                            inp.setAttribute("capture", "environment");
                            inp.onchange = (e) => handleFileAttach((e.target as HTMLInputElement).files);
                            inp.click();
                            setIsAttachOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-600 transition group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                            <Camera size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-amber-600">Take Photo / Camera</div>
                            <div className="text-[11px] text-slate-400">Snap sketch or whiteboard notes</div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Build Button */}
              <button
                type="button"
                onClick={() => handleBuildClick()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#FF2E63] hover:from-[#BE123C] hover:to-[#E11D48] text-white text-sm sm:text-base font-bold transition-all shadow-lg shadow-[#E11D48]/25 hover:shadow-xl hover:shadow-[#E11D48]/35 hover:scale-[1.02] active:scale-[0.98] group shrink-0"
              >
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                <span>{user ? "Build My Website" : "Sign In & Build"}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>

            </div>

          </div>

          {/* Quick Starters */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <span className="text-slate-400 font-medium text-xs mr-1">Try:</span>
            {[
              "SaaS Landing Page",
              "Portfolio Website",
              "E-Commerce Store",
              "Restaurant Website"
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  const fullPrompt = `Create a modern, production-ready ${chip} with interactive elements, responsive layout, and clean typography.`;
                  setPrompt(fullPrompt);
                  handleBuildClick(fullPrompt);
                }}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-[#E11D48] font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow hover:scale-105 active:scale-95"
              >
                {chip}
              </button>
            ))}
          </motion.div>

          {/* Kleap-Style Trust Strip (clean 2-col on mobile, flex on desktop) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12 text-xs sm:text-sm text-slate-500 font-medium"
          >
            <div className="flex items-center gap-2 justify-center">
              <Zap size={15} className="text-[#E11D48] shrink-0" />
              <span>Free instant generation</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Globe size={15} className="text-[#E11D48] shrink-0" />
              <span>Fully mobile responsive</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Download size={15} className="text-[#E11D48] shrink-0" />
              <span>1-Click Website Export</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <ShieldCheck size={15} className="text-[#E11D48] shrink-0" />
              <span>No credit card to start</span>
            </div>
          </motion.div>

        </motion.div>

        {/* Scroll Indicator */}
        <motion.button 
          onClick={() => scrollToSection("how-it-works")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-12 text-slate-400 hover:text-[#E11D48] transition animate-bounce p-2"
          aria-label="Scroll to how it works"
        >
          <ChevronDown size={22} />
        </motion.button>

      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. HOW IT WORKS — SCROLL-DRIVEN 3-STEP PIPELINE                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <HowItWorksSection />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. THE PIPELINE — 7 SPECIALIZED AI AGENTS CONTINUOUS WORKFLOW        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <PipelineWorkflowSection />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 5. BLUEPRINTS / TEMPLATES                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatedSection id="blueprints" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E11D48] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100 mb-4">
              <Layers size={12} />
              Templates
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              Start with a Blueprint
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Select any blueprint and generate a complete website in seconds.
            </p>
          </div>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BLUEPRINTS.map((bp, idx) => {
            const Icon = bp.icon;
            return (
              <motion.div 
                key={idx}
                variants={fadeUp}
                whileHover={{ y: -7, transition: { duration: 0.24, ease: "easeOut" } }}
                className="bg-white border border-slate-200 hover:border-rose-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 flex flex-col justify-between group relative"
              >
                {/* Top Glowing Color Stripe */}
                <div 
                  className="h-1 w-full opacity-60 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300"
                  style={{ backgroundColor: bp.color }}
                />

                <div>
                  {/* Card Header with Icon + Category */}
                  <div className={`p-5 border-b border-slate-100 bg-gradient-to-b ${bp.gradient} transition-colors duration-300`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 group-hover:border-rose-200 group-hover:text-[#E11D48] transition-colors shadow-2xs">
                        {bp.category}
                      </span>
                      <div 
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xs"
                        style={{ color: bp.color }}
                      >
                        <Icon size={16} />
                      </div>
                    </div>
                    <h4 className="font-extrabold text-base text-slate-900 mt-3 group-hover:text-[#E11D48] transition-colors">
                      {bp.title}
                    </h4>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {bp.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {bp.tags.map(t => (
                        <span 
                          key={t} 
                          className="text-[10px] font-semibold text-slate-600 bg-slate-100 group-hover:bg-rose-50/60 group-hover:text-slate-800 px-2.5 py-1 rounded-md transition-colors"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleBuildClick(bp.prompt)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 group-hover:bg-[#E11D48] text-slate-700 group-hover:text-white text-xs font-bold transition-all duration-200 group-hover:shadow-md group-hover:shadow-[#E11D48]/25"
                  >
                    <Sparkles size={13} className="group-hover:rotate-12 transition-transform duration-300" />
                    <span>Build This</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 6. TESTIMONIALS (WITH CONTINUOUS FLOATING ANIMATIONS)             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-24 sm:py-32 bg-slate-50 border-y border-slate-200 relative overflow-hidden">
        {/* Floating Background Ambient Glows */}
        <motion.div 
          animate={{ y: [0, -25, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-rose-200/40 blur-3xl pointer-events-none"
        />
        <motion.div 
          animate={{ y: [0, 25, 0], x: [0, -18, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-rose-100/50 blur-3xl pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            {/* Floating Top Trust Pill */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full border border-rose-100 shadow-sm mb-4"
            >
              <div className="flex -space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-[#E11D48] text-white text-[9px] flex items-center justify-center font-bold shadow-xs">S</span>
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] flex items-center justify-center font-bold shadow-xs">M</span>
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold shadow-xs">P</span>
              </div>
              <span className="font-bold text-slate-900">4.9 / 5</span>
              <span className="text-slate-400">• Loved by 1,200+ founders & creators</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Loved by Creators & Teams
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Real websites shipped in minutes with WEBNTRA's autonomous multi-agent engine.
            </p>
          </motion.div>

          {/* Testimonial Cards Grid with Staggered Floating Levitation */}
          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => {
              // Custom floating rhythms for each column to create natural organic levitation
              const floatConfig = [
                { yRange: [0, -10, 0], duration: 4.8, delay: 0 },
                { yRange: [-5, 8, -5], duration: 5.6, delay: 0.6 },
                { yRange: [0, -12, 0], duration: 4.4, delay: 1.2 }
              ][i % 3];

              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  animate={{ y: floatConfig.yRange }}
                  transition={{
                    duration: floatConfig.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: floatConfig.delay
                  }}
                  whileHover={{ 
                    y: -16, 
                    scale: 1.025, 
                    boxShadow: "0 20px 35px -10px rgba(225, 29, 72, 0.16)",
                    transition: { duration: 0.25, ease: "easeOut" }
                  }}
                  className="group relative bg-white/95 backdrop-blur border border-slate-200 hover:border-rose-300 rounded-2xl p-6 transition-colors duration-300 flex flex-col justify-between shadow-md shadow-slate-200/50 cursor-default"
                >
                  {/* Subtle Floating Watermark Quote Icon */}
                  <Quote 
                    className="absolute right-5 top-5 text-rose-100 group-hover:text-rose-200 transition-colors pointer-events-none" 
                    size={36} 
                  />

                  <div>
                    {/* Rating & Badge Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-[#E11D48] bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
                        {t.tag}
                      </span>
                    </div>

                    {/* Testimonial Quote */}
                    <p className="text-sm text-slate-700 leading-relaxed mb-5 italic relative z-10 font-normal">
                      "{t.text}"
                    </p>
                  </div>

                  {/* Author Meta */}
                  <div className="flex items-center gap-3 pt-3.5 border-t border-slate-100 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E11D48] to-rose-400 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-[#E11D48]/30 group-hover:scale-105 transition-transform">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-[#E11D48] transition-colors">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 7. PRICING                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatedSection id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
        <div className="w-full mx-auto">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E11D48] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100 mb-4">
              <BarChart3 size={12} />
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              Start Free. Scale as You Grow.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Full access to all 7 AI agents on every plan.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Starter</h3>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-black text-slate-900">$0</span>
                  <span className="text-sm text-slate-400 ml-1">/ free forever</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Full 7-Agent Pipeline</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Live Preview</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> 1-Click Package Export</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> 5 Projects / Month</li>
                </ul>
              </div>
              <button
                onClick={() => handleBuildClick()}
                className="mt-8 w-full py-3 rounded-xl border-2 border-slate-200 hover:border-[#E11D48] hover:text-[#E11D48] font-bold text-sm transition-all"
              >
                Get Started Free
              </button>
            </motion.div>

            {/* Pro (Featured) */}
            <motion.div variants={fadeUp} className="bg-white border-2 border-[#E11D48] rounded-2xl p-7 shadow-xl shadow-[#E11D48]/10 relative flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E11D48] text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                Most Popular
              </span>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Professional</h3>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-black text-slate-900">$29</span>
                  <span className="text-sm text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-[#E11D48] shrink-0" /> Unlimited Generations</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-[#E11D48] shrink-0" /> Priority Processing</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-[#E11D48] shrink-0" /> Multi-turn Refinements</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-[#E11D48] shrink-0" /> File & Image Uploads</li>
                </ul>
              </div>
              <button
                onClick={() => handleBuildClick()}
                className="mt-8 w-full py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-sm transition-all shadow-lg shadow-[#E11D48]/25"
              >
                Start Pro Plan
              </button>
            </motion.div>

            {/* Enterprise */}
            <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Enterprise</h3>
                <div className="mt-3 mb-6">
                  <span className="text-4xl font-black text-slate-900">$89</span>
                  <span className="text-sm text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Self-Hosted Options</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Custom Domain & Integrations</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Custom Agents</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> Dedicated SLA & Support</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth("Contact our team for Enterprise plans.")}
                className="mt-8 w-full py-3 rounded-xl border-2 border-slate-200 hover:border-[#E11D48] hover:text-[#E11D48] font-bold text-sm transition-all"
              >
                Contact Sales
              </button>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 8. FAQ                                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatedSection id="faq" className="py-20 sm:py-28 max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div variants={staggerContainer} className="space-y-3">
          {[
            {
              q: "Why is sign in required before building?",
              a: "Signing in creates your dedicated workspace session, ensuring all generated files, revision history, and website modifications are safely persisted across browser sessions."
            },
            {
              q: "Can I export and publish my website independently?",
              a: "Yes. WEBNTRA generates complete, production-ready website packages. You can download the complete archive with a single click and host it with any provider with zero dependencies."
            },
            {
              q: "What file types can I attach to my prompt?",
              a: "You can attach images (PNG, JPG, SVG), videos, and document files as references. These help our AI agents better understand your design vision and produce more accurate results."
            },
            {
              q: "What happens if a step in the pipeline fails?",
              a: "WEBNTRA includes built-in resilience. If any stage encounters an issue, intelligent fallback logic ensures that stage completes predictably so the full pipeline never stalls."
            },
            {
              q: "How do I refine the generated website?",
              a: "After the initial generation, you can use the multi-turn refinement bar in the Studio to describe changes. Each change re-runs the relevant pipeline agents to apply your modifications."
            }
          ].map((faq, i) => (
            <motion.div key={i} variants={fadeUp} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-sm transition">
              <button 
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full text-left p-5 flex items-center justify-between text-sm font-semibold text-slate-800 hover:text-[#E11D48] transition"
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 shrink-0 ml-3 ${faqOpen === i ? "rotate-180" : ""}`} />
              </button>
              {faqOpen === i && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                >
                  {faq.a}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 9. CTA BANNER                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div variants={fadeUp}>
            <div className="w-14 h-14 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl shadow-[#E11D48]/20 border-2 border-rose-100 bg-white p-1 hover:scale-105 transition-transform flex items-center justify-center">
              <img src={logoImg} alt="WEBNTRA" className="w-full h-full object-cover rounded-xl" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-xl mx-auto">
              Join thousands of creators, founders, and teams who use WEBNTRA to go from idea to live website in seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (!user) {
                    onOpenAuth("Create your free account to get started.");
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setTimeout(() => {
                      const input = document.querySelector("textarea") as HTMLTextAreaElement;
                      if (input) input.focus();
                    }, 350);
                  }
                }}
                className="px-8 py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-sm transition-all shadow-lg shadow-[#E11D48]/20 hover:shadow-xl hover:shadow-[#E11D48]/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <Sparkles size={16} />
                Get Started Free
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="px-8 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm transition-all hover:bg-slate-50"
              >
                See How It Works
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 10. FOOTER                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-rose-200 shadow-sm shrink-0 bg-white p-0.5">
                <img src={logoImg} alt="WEBNTRA" className="w-full h-full object-cover rounded-lg" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base">WEBNTRA</span>
            </div>

            {/* Copyright */}
            <div className="text-xs text-slate-400">
              © {new Date().getFullYear()} WEBNTRA. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
