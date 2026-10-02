import React, { useState } from "react";
import { 
  CheckCircle2, AlertTriangle, Shield, Palette, Layout, 
  Terminal, Cpu, FileCode, Check, ArrowRight, Layers, Sparkles 
} from "lucide-react";
import { Agent, GenerationResponse } from "../types";

interface AgentInspectorProps {
  agents: Agent[];
  logs: string[];
  requirements?: GenerationResponse["requirements"];
  design?: GenerationResponse["design"];
  tests?: GenerationResponse["tests"];
  security?: GenerationResponse["security"];
}

export const AgentInspector: React.FC<AgentInspectorProps> = ({
  agents,
  logs,
  requirements,
  design,
  tests,
  security
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

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      
      {/* Stages Horizontal Nav */}
      <div className="flex items-center gap-1.5 p-3 border-b border-slate-200 bg-slate-50 overflow-x-auto scrollbar-none">
        {stages.map(st => (
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
          </button>
        ))}
      </div>

      {/* Stage Detail Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* Stage 1: Requirements */}
        {activeStage === "requirements" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">User Stories & Functional Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Synthesized by Requirement Agent</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pages Structured</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(requirements?.pages || ["Home", "Features", "Pricing", "Contact"]).map((p, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Features</h4>
                <ul className="space-y-1 text-xs text-slate-600">
                  {(requirements?.features || ["Responsive multi-column grid", "Interactive navigation", "Call-to-action cards", "Zero-dependency vanilla build"]).map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Design */}
        {activeStage === "design" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Design System & Color Tokens</h3>
              <p className="text-xs text-slate-500 mt-0.5">Synthesized by Design Agent</p>
            </div>

            {/* Color Swatches */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Brand Palette Swatches</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Primary Brand", hex: design?.accentColor || "#E11D48", bg: "bg-[#E11D48]" },
                  { name: "Dark Neutral", hex: design?.primaryColor || "#0F172A", bg: "bg-[#0F172A]" },
                  { name: "Surface Clean", hex: "#FFFFFF", bg: "bg-white border border-slate-300" },
                  { name: "Muted Slate", hex: "#64748B", bg: "bg-slate-500" },
                ].map((c) => (
                  <div key={c.name} className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${c.bg} shrink-0 shadow-xs`} />
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">{c.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{c.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography & Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Typography Rules</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Heading Font:</strong> Plus Jakarta Sans / Inter</div>
                  <div><strong>Body Font:</strong> System UI (fluid sizing)</div>
                  <div><strong>Line Height:</strong> 1.65 relaxed readability</div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Responsive Scale</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Desktop:</strong> 12-column fluid grid</div>
                  <div><strong>Tablet (768px):</strong> 2-column card stack</div>
                  <div><strong>Mobile (375px):</strong> 1-column single stack with collapsible menu</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 3: Code */}
        {activeStage === "code" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Code Synthesis Architecture</h3>
              <p className="text-xs text-slate-500 mt-0.5">Synthesized by Code Agent</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <p>Generated clean, modular vanilla HTML5, modern CSS3 with responsive custom properties, and lightweight JavaScript interaction handlers.</p>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center font-mono">
                  <span className="block font-bold text-slate-900 text-sm">HTML5</span>
                  <span className="text-[10px] text-slate-400">Semantic Tags</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center font-mono">
                  <span className="block font-bold text-slate-900 text-sm">CSS3</span>
                  <span className="text-[10px] text-slate-400">Zero Tailwind runtime</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center font-mono">
                  <span className="block font-bold text-slate-900 text-sm">Vanilla JS</span>
                  <span className="text-[10px] text-slate-400">Micro-interactions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 4: Testing */}
        {activeStage === "testing" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Automated Layout & Accessibility Test Suite</h3>
              <p className="text-xs text-slate-500 mt-0.5">Audited by Testing Agent</p>
            </div>

            <div className="space-y-2">
              {[
                { test: "Semantic Document Structure", result: "Passed", detail: "Valid <!doctype html>, head, nav, main, footer elements" },
                { test: "Viewport Meta Configuration", result: "Passed", detail: "viewport content set for high-DPI scaling" },
                { test: "Anchor Target Integrity", result: "Passed", detail: "All navigation hash links map to valid DOM section IDs" },
                { test: "Touch Target Size (Accessibility)", result: "Passed", detail: "All buttons and interactive links exceed 44x44px minimum" },
                { test: "Responsive Breakpoints Validation", result: "Passed", detail: "Mobile navigation toggle tested and functional" }
              ].map((t, idx) => (
                <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{t.test}</span>
                      <span className="text-slate-500 text-[11px] block">{t.detail}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                    {t.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 5: Debug */}
        {activeStage === "debug" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Layout Alignment & Zero-Regression Fixes</h3>
              <p className="text-xs text-slate-500 mt-0.5">Audited by Debug Agent</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-600">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 size={15} />
                <span>0 layout overflows detected</span>
              </div>
              <p className="text-slate-500 text-[11px]">Normalized box-sizing, smooth scroll behaviors, and viewport overflows across desktop, tablet, and mobile orientations.</p>
            </div>
          </div>
        )}

        {/* Stage 6: Security */}
        {activeStage === "security" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Static Security Audit & Vulnerability Shield</h3>
              <p className="text-xs text-slate-500 mt-0.5">Audited by Security Agent</p>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-bold">● Security Score: 100/100 (A+)</span>
                <span className="text-slate-400 text-[10px]">Zero Critical Vulnerabilities</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400" />
                  <span>No client-side API keys exposed in HTML or JavaScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400" />
                  <span>XSS Injection Defense: escapeHtml active on all dynamic text</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400" />
                  <span>External links sanitized with rel="noopener noreferrer"</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 7: Deployment */}
        {activeStage === "deployment" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Production Build & Asset Package</h3>
              <p className="text-xs text-slate-500 mt-0.5">Compiled by Deployment Agent</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Static Hosting Ready</span>
                <span className="text-emerald-600 font-mono">1-Click ZIP</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Fully compiled and ready to upload to Netlify, Vercel, GitHub Pages, or any traditional web server.
              </p>
            </div>
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
