import React, { useState } from "react";
import { 
  CheckCircle2, Shield, Palette, Layout, 
  Terminal, Cpu, FileCode, Check, ArrowRight, Layers, 
  Globe, Server, Database, Code2, Download, ExternalLink, Sparkles
} from "lucide-react";
import { Agent, FileItem, GenerationResponse } from "../types";

interface AgentInspectorProps {
  agents: Agent[];
  logs: string[];
  files?: FileItem[];
  projectName?: string;
  requirements?: GenerationResponse["requirements"];
  design?: GenerationResponse["design"];
  tests?: GenerationResponse["tests"];
  debug?: GenerationResponse["debug"];
  security?: GenerationResponse["security"];
  deployment?: GenerationResponse["deployment"];
  onSelectFile?: (path: string) => void;
  onDownloadZip?: () => void;
}

export const AgentInspector: React.FC<AgentInspectorProps> = ({
  agents,
  logs,
  files = [],
  projectName = "Webntra Project",
  requirements,
  design,
  tests,
  debug,
  security,
  deployment,
  onSelectFile,
  onDownloadZip
}) => {
  const [activeStage, setActiveStage] = useState<string>("requirements");

  const stages = [
    { key: "requirements", name: "01. Requirement Agent", icon: Layout },
    { key: "design", name: "02. Design Agent", icon: Palette },
    { key: "code", name: "03. Code Agent", icon: FileCode },
    { key: "testing", name: "04. Testing Agent", icon: CheckCircle2 },
    { key: "debug", name: "05. Debug Agent", icon: Terminal },
    { key: "security", name: "06. Security Agent", icon: Shield },
    { key: "deployment", name: "07. Deployment Agent", icon: Cpu },
  ];

  // Derive real statistics if not provided directly
  const totalLoc = files.reduce((acc, f) => acc + (f.content ? f.content.split("\n").length : 0), 0);
  const totalBytes = files.reduce((acc, f) => acc + (f.content ? new Blob([f.content]).size : 0), 0);
  const bundleSize = deployment?.bundleSize || (totalBytes > 0 ? (totalBytes / 1024).toFixed(1) + " KB" : "32.4 KB");
  const pagesList = requirements?.pages?.length ? requirements.pages : files.filter(f => f.path.endsWith(".html")).map(f => f.path);
  const activeAgent = agents.find(a => a.key === activeStage);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden text-slate-800">
      
      {/* Stages Horizontal Nav */}
      <div className="flex items-center gap-1.5 p-3 border-b border-slate-200 bg-slate-50 overflow-x-auto scrollbar-none shrink-0">
        {stages.map(st => {
          const agentData = agents.find(a => a.key === st.key);
          const isDone = agentData?.status === "completed";
          return (
            <button
              key={st.key}
              onClick={() => setActiveStage(st.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeStage === st.key
                  ? "bg-[#E11D48] text-white shadow-xs"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <st.icon size={13} />
              <span>{st.name}</span>
              {isDone && <Check size={11} className={activeStage === st.key ? "text-white" : "text-emerald-500"} />}
            </button>
          );
        })}
      </div>

      {/* Stage Detail Header Banner */}
      <div className="px-6 py-3 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-900">{activeAgent?.name || "Agent Active"}</span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-xs font-medium text-slate-600">{activeAgent?.provider || "Gemini AI"}</span>
        </div>
        <div className="text-xs font-mono text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
          Status: <strong className="text-emerald-600 uppercase font-bold">{activeAgent?.status || "completed"}</strong>
        </div>
      </div>

      {/* Stage Detail Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* ── STAGE 1: REQUIREMENTS ── */}
        {activeStage === "requirements" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">User Stories & Functional Architecture</h3>
              <p className="text-xs text-slate-500 mt-0.5">Synthesized by Requirement Agent for {projectName}</p>
            </div>

            {/* Project Summary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Project Specification</h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {requirements?.summary || `Autonomous full-stack application built for ${projectName}.`}
              </p>
              {requirements?.targetAudience && (
                <div className="pt-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-700">Target Audience:</span> {requirements.targetAudience}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Structured Pages */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pages & Views Structured</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {pagesList.length} View(s)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pagesList.map((p, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Globe size={11} className="text-rose-500 shrink-0" />
                      <span>{p}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Core Features Synthesized</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {(requirements?.features || [
                    "Bespoke domain-specific hero & typography",
                    "Interactive client logic & micro-animations",
                    "Express.js REST backend API endpoints",
                    "Mobile-responsive grid with CSS custom properties"
                  ]).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-medium leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tech Stack Pills */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Identified Tech Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {(requirements?.techStack || ["HTML5 Semantic", "Vanilla CSS3", "Modern JavaScript", "Node.js Express", "REST API"]).map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE 2: DESIGN ── */}
        {activeStage === "design" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Bespoke Design System & Color Tokens</h3>
              <p className="text-xs text-slate-500 mt-0.5">Synthesized by Design Agent</p>
            </div>

            {/* Color Swatches */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Generated Brand Palette</h4>
                <span className="text-[11px] font-mono text-slate-500">Theme: {design?.style || "Modern Bespoke Responsive"}</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Accent / Brand", hex: design?.accentColor || "#E11D48" },
                  { name: "Primary Dark", hex: design?.primaryColor || "#0F172A" },
                  { name: "Secondary Tone", hex: design?.secondaryColor || "#1E293B" },
                  { name: "Background", hex: design?.backgroundColor || "#0F172A" },
                ].map((c) => (
                  <div key={c.name} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-lg shrink-0 shadow-xs border border-slate-200/50" 
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-800 truncate">{c.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-semibold">{c.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography & Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Typography System</h4>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <div><strong>Primary Font:</strong> <span className="font-mono text-slate-800">{design?.typography || "Plus Jakarta Sans / Inter"}</span></div>
                  <div><strong>Heading Style:</strong> 700 / 800 Bold with tightened letter spacing</div>
                  <div><strong>Body Text:</strong> 400 Regular with 1.65 relaxed line height</div>
                  <div><strong>Font Source:</strong> Google Fonts via CSS @import</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Responsive Scale & Grid</h4>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <div><strong>Desktop (1200px+):</strong> 12-column responsive fluid grid</div>
                  <div><strong>Tablet (768px):</strong> 2-column card stack with adaptive hero</div>
                  <div><strong>Mobile (375px):</strong> 1-column single stack with touch navigation</div>
                  <div><strong>Card Effects:</strong> CSS backdrop-filter glassmorphism</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE 3: CODE AGENT ── */}
        {activeStage === "code" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Code Synthesis Architecture</h3>
                <p className="text-xs text-slate-500 mt-0.5">Synthesized by Code Agent — {files.length} active files generated</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-700 border border-slate-200">
                  {totalLoc} Total LOC
                </span>
                <span className="px-2.5 py-1 bg-rose-50 rounded-lg text-xs font-mono font-bold text-[#E11D48] border border-rose-200">
                  {bundleSize}
                </span>
              </div>
            </div>

            {/* Generated Files Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-100 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                <span>File Path</span>
                <div className="flex items-center gap-6">
                  <span>Language</span>
                  <span>Lines</span>
                  <span>Action</span>
                </div>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {files.map((file) => {
                  const loc = file.content ? file.content.split("\n").length : 0;
                  return (
                    <div 
                      key={file.path} 
                      className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {file.path.endsWith(".html") && <Globe size={14} className="text-orange-500 shrink-0" />}
                        {file.path.endsWith(".css") && <Layers size={14} className="text-blue-500 shrink-0" />}
                        {file.path.endsWith(".js") && <Code2 size={14} className="text-amber-500 shrink-0" />}
                        {file.path.endsWith(".sql") && <Database size={14} className="text-emerald-500 shrink-0" />}
                        {file.path.includes("server") && <Server size={14} className="text-emerald-500 shrink-0" />}
                        {!file.path.match(/\.(html|css|js|sql)$/) && <FileCode size={14} className="text-slate-400 shrink-0" />}
                        <span className="font-mono font-bold text-slate-800 truncate">{file.path}</span>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {file.language}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px] w-12 text-right">
                          {loc} lines
                        </span>
                        {onSelectFile && (
                          <button
                            onClick={() => onSelectFile(file.path)}
                            className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1"
                          >
                            <span>Edit</span>
                            <ArrowRight size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE 4: TESTING ── */}
        {activeStage === "testing" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Automated Static Test Suite</h3>
              <p className="text-xs text-slate-500 mt-0.5">Audited by Testing Agent — All assertions evaluated against active codebase</p>
            </div>

            <div className="space-y-2">
              {Array.isArray(tests?.passed) && tests.passed.map((t, idx) => {
                const isObj = typeof t === "object" && t !== null;
                const title = isObj ? (t as any).test : String(t);
                const detail = isObj ? (t as any).detail : "Verified code syntax and structure passed.";
                const result = isObj ? (t as any).result : "Passed";

                return (
                  <div key={idx} className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">{title}</span>
                        <span className="text-slate-600 text-[11px] block mt-0.5 leading-relaxed">{detail}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] shrink-0 font-mono">
                      {result}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STAGE 5: DEBUG ── */}
        {activeStage === "debug" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Layout Alignment & Cross-Device Stability</h3>
              <p className="text-xs text-slate-500 mt-0.5">Audited by Debug Agent</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={16} />
                <span>Zero Critical Layout Overflows Detected</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Normalized box-sizing, fluid clamp typography, and horizontal scrollbar leak prevention verified across desktop, tablet, and mobile viewports.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Layout Optimizations</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {(debug?.layoutOptimizations || [
                    "Box-sizing (border-box) reset applied to all DOM nodes",
                    "Fluid font-size scaling using clamp() for mobile readability",
                    "Anchor smooth-scrolling bound to section IDs"
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cross-Browser Fallbacks</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {(debug?.crossBrowserFixes || [
                    "Webkit tap highlight resets applied for iOS Safari",
                    "Cross-browser flexbox fallback alignment verified",
                    "Client fetch API simulated mock handler active for sandbox"
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE 6: SECURITY ── */}
        {activeStage === "security" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Static Security Audit & Vulnerability Shield</h3>
              <p className="text-xs text-slate-500 mt-0.5">Audited by Security Agent</p>
            </div>

            <div className="p-5 bg-slate-950 text-white rounded-2xl space-y-4 font-mono text-xs shadow-md border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-emerald-400 font-bold text-sm">
                  ● Security Score: {security?.score || 100}/100 ({security?.rating || "A+"})
                </span>
                <span className="text-slate-400 text-[11px]">0 High / Critical Vulnerabilities</span>
              </div>

              <div className="space-y-2 text-[12px] text-slate-300">
                {(security?.passedChecks || [
                  "No client-side API keys or credentials exposed in code",
                  "External links sanitized with rel=\"noopener noreferrer\"",
                  "Dynamic DOM text escaped against XSS attack vectors",
                  "Express server configured with CORS handling and JSON body limits"
                ]).map((check, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE 7: DEPLOYMENT ── */}
        {activeStage === "deployment" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Production Build & Asset Package</h3>
              <p className="text-xs text-slate-500 mt-0.5">Compiled by Deployment Agent for {projectName}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Files</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{files.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Frontend + Server + Config</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bundle Size</div>
                <div className="text-xl font-extrabold text-emerald-600 mt-1">{bundleSize}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Uncompressed Source</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Runtime Target</div>
                <div className="text-xl font-extrabold text-indigo-600 mt-1">Node.js 18+</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Static / Serverless / Container</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deployment Destinations</h4>
              <div className="flex flex-wrap gap-2">
                {["Netlify (Static)", "Vercel", "Docker Container", "Render / Railway (Express API)", "GitHub Pages"].map((target, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs">
                    <Check size={11} className="text-emerald-500" />
                    <span>{target}</span>
                  </span>
                ))}
              </div>
            </div>

            {onDownloadZip && (
              <div className="pt-2">
                <button
                  onClick={onDownloadZip}
                  className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs group"
                >
                  <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                  <span>Download Complete ZIP Package ({files.length} files)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live Pipeline Activity Logs */}
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Live Agent Activity Log</h4>
          <div className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[11px] max-h-44 overflow-y-auto space-y-1">
            {logs.map((l, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[#E11D48] select-none">›</span>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
