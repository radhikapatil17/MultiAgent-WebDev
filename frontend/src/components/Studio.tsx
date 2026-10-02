import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  ArrowLeft, Sparkles, Download, Monitor, Tablet, Smartphone, Send, 
  Loader2, Check, Image, Video, Paperclip, Camera, X, Code2, Terminal, 
  Eye, FileText, Globe, RefreshCw, ExternalLink, ShieldCheck, Layers, 
  Copy, Edit3, CheckCircle2, ChevronDown, ChevronRight, Play, Maximize2,
  FolderTree, Wrench, Share2, FolderGit2, Settings, LogOut, User as UserIcon
} from "lucide-react";
import JSZip from "jszip";
import { Agent, FileItem, Project, ChatMessage, User } from "../types";
import { generateWebsite, modifyWebsite, DEFAULT_AGENTS } from "../services/api";
import { saveProject, getProjectById } from "../services/projectStorage";
import { DeployModal } from "./DeployModal";
import { AgentInspector } from "./AgentInspector";
import { MediaLibraryModal } from "./MediaLibraryModal";
import logoImg from "../assets/logo.jpg";

interface StudioProps {
  initialPrompt?: string;
  project?: Project | null;
  onBackToLanding: () => void;
  onBackToDashboard: () => void;
  user?: User | null;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onUpdateUser?: (user: User) => void;
}

export const Studio: React.FC<StudioProps> = ({ 
  initialPrompt = "", 
  project: initialProject,
  onBackToLanding,
  onBackToDashboard,
  user,
  onLogout,
  onOpenSettings,
  onUpdateUser
}) => {
  const [projectId, setProjectId] = useState<string>(() => initialProject?.id || "proj_" + Math.random().toString(36).substring(2, 9));
  const [projectName, setProjectName] = useState<string>(() => initialProject?.name || "Modern Web Application");
  const [isEditingName, setIsEditingName] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt || initialProject?.prompt || "");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (initialProject?.prompt) {
      return [
        { id: "msg_1", role: "user", content: initialProject.prompt, timestamp: new Date(initialProject.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        { id: "msg_2", role: "assistant", content: `Generated complete website with 7-agent SDLC pipeline for ${initialProject.name}. Ready to preview, edit or deploy!`, timestamp: new Date(initialProject.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      ];
    }
    return [];
  });
  
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [files, setFiles] = useState<FileItem[]>(() => initialProject?.files || []);
  const [selectedPath, setSelectedPath] = useState("index.html");
  const [agents, setAgents] = useState<Agent[]>(() => initialProject?.agents || DEFAULT_AGENTS);
  const [logs, setLogs] = useState<string[]>(() => initialProject?.logs || ["WEBNTRA Studio Engine initialized."]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "agents" | "assets">("preview");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [editedCode, setEditedCode] = useState("");
  const [codeDirty, setCodeDirty] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Metadata for SDLC Inspection
  const [sdlcMetadata, setSdlcMetadata] = useState<{
    requirements?: any;
    design?: any;
    tests?: any;
    security?: any;
  }>(() => ({
    requirements: initialProject?.requirements,
    design: initialProject?.design,
    tests: initialProject?.tests,
    security: initialProject?.security
  }));

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // ── Resizable Divider State ──
  const [leftPanelPct, setLeftPanelPct] = useState(41.67); // ~5/12 cols default
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPctRef = useRef(0);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Handle outside click for attachments and profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setIsAttachOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (isAttachOpen || profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAttachOpen, profileDropdownOpen]);

  // ── Divider drag handlers ──
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartPctRef.current = leftPanelPct;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (me: MouseEvent) => {
      if (!isDraggingRef.current || !workspaceRef.current) return;
      const containerWidth = workspaceRef.current.getBoundingClientRect().width;
      const deltaPx = me.clientX - dragStartXRef.current;
      const deltaPct = (deltaPx / containerWidth) * 100;
      const newPct = Math.min(Math.max(dragStartPctRef.current + deltaPct, 20), 75);
      setLeftPanelPct(newPct);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isGenerating]);

  // Initial trigger if initialPrompt is provided and project has no files
  useEffect(() => {
    if (initialPrompt && (!files.length || initialPrompt !== prompt)) {
      setPrompt(initialPrompt);
      handleGenerate(initialPrompt, false);
    }
  }, [initialPrompt]);

  // Selected file sync with editor
  const selectedFile = useMemo(() => {
    return files.find(f => f.path === selectedPath) || files[0] || { path: "index.html", content: "", language: "html" };
  }, [files, selectedPath]);

  useEffect(() => {
    setEditedCode(selectedFile.content || "");
    setCodeDirty(false);
  }, [selectedFile]);

  // Compiled Preview HTML
  const previewHtml = useMemo(() => {
    if (!files.length) return "";
    const index = files.find(f => f.path.toLowerCase() === "index.html");
    if (!index) return "";
    let html = index.content;
    const css = files.filter(f => f.path.endsWith(".css")).map(f => f.content).join("\n");
    const js = files.filter(f => f.path.endsWith(".js")).map(f => f.content).join("\n");

    // Guard against preview iframe navigating to host root or breaking sandbox
    const guardScript = `
      <script>
        (function() {
          document.addEventListener('click', function(e) {
            var a = e.target.closest('a');
            if (a) {
              var href = a.getAttribute('href') || '';
              if (href.startsWith('#')) {
                e.preventDefault();
                var el = document.querySelector(href);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else if (href === '/' || href === '' || href.indexOf('localhost') !== -1) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else if (href.startsWith('http')) {
                a.target = '_blank';
              }
            }
          }, true);
          document.addEventListener('submit', function(e) {
            e.preventDefault();
            var btn = e.target.querySelector('button[type="submit"], input[type="submit"]') || e.target.querySelector('button');
            if (btn) {
              var prev = btn.textContent;
              btn.textContent = 'Submitted! ✨';
              setTimeout(function() { btn.textContent = prev; }, 2500);
            }
          }, true);
        })();
      </script>
    `;

    if (css) html = html.replace("</head>", `<style>\n${css}\n</style></head>`);
    if (js) html = html.replace("</body>", `<script>\n${js}\n</script>${guardScript}</body>`);
    else html = html.replace("</body>", `${guardScript}</body>`);
    return html;
  }, [files, previewKey]);

  // Auto-save project state to storage
  useEffect(() => {
    if (files.length > 0) {
      saveProject({
        id: projectId,
        name: projectName,
        prompt: prompt || projectName,
        files,
        agents,
        logs,
        createdAt: initialProject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["Webntra", "7-Agent SDLC"],
        category: "Web Application",
        requirements: sdlcMetadata.requirements,
        design: sdlcMetadata.design,
        tests: sdlcMetadata.tests,
        security: sdlcMetadata.security
      });
    }
  }, [files, projectName, agents, logs, sdlcMetadata]);

  // Main Generation Handler (Initial or Modification)
  const handleGenerate = async (targetPrompt: string, isModification = false) => {
    const p = targetPrompt.trim();
    if (!p || isGenerating) return;

    setIsGenerating(true);
    const userMsgId = "msg_" + Date.now();
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add user chat message
    setChatMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        content: p,
        timestamp,
        attachments: attachments.map(a => ({ name: a.name, type: a.type }))
      }
    ]);
    setAttachments([]);

    // Animate agents in real time
    setAgents(DEFAULT_AGENTS.map((a, i) => i === 0 ? { ...a, status: "running", detail: "Active" } : { ...a, status: "pending", detail: "Waiting" }));

    try {
      let enhancedPrompt = p;
      if (!isModification) {
        const bizName = localStorage.getItem("webntra_pref_bizname");
        const brandColor = localStorage.getItem("webntra_pref_brandcolor");
        const tone = localStorage.getItem("webntra_pref_tone");
        const parts: string[] = [];
        // Only inject if user set a real custom business name, never force Webntra
        if (bizName && !bizName.toLowerCase().includes("webntra")) {
          parts.push(`Brand Name: "${bizName}"`);
        }
        if (brandColor && brandColor !== "#E11D48") {
          parts.push(`Accent Color: ${brandColor}`);
        }
        if (tone && tone !== "Modern Minimalist") {
          parts.push(`Aesthetic: ${tone}`);
        }
        if (parts.length > 0 && !p.toLowerCase().includes((bizName || "").toLowerCase())) {
          enhancedPrompt = `${p}\n(Please apply user brand kit: ${parts.join(", ")})`;
        }
      }

      const res = isModification && files.length > 0
        ? await modifyWebsite(p, files, (updatedAgents, log) => {
            setAgents(updatedAgents);
            setLogs(prev => [...prev, log]);
          })
        : await generateWebsite(enhancedPrompt, (updatedAgents, log) => {
            setAgents(updatedAgents);
            setLogs(prev => [...prev, log]);
          });

      setFiles(res.files);
      setAgents(res.agents);
      setLogs(res.logs);
      setSelectedPath(res.files[0]?.path || "index.html");
      if (!isModification && res.projectName) {
        setProjectName(res.projectName);
      }
      setSdlcMetadata({
        requirements: res.requirements,
        design: res.design,
        tests: res.tests,
        security: res.security
      });

      // Add assistant response
      setChatMessages(prev => [
        ...prev,
        {
          id: "msg_ai_" + Date.now(),
          role: "assistant",
          content: isModification
            ? `Successfully applied your updates to ${res.projectName || projectName} with the 7-agent pipeline.`
            : `Built ${res.projectName || projectName} with complete HTML, responsive CSS, and dynamic JavaScript.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
      setPreviewKey(k => k + 1);
    }
  };

  const handleApplyManualCode = () => {
    const updated = files.map(f => f.path === selectedPath ? { ...f, content: editedCode } : f);
    setFiles(updated);
    setCodeDirty(false);
    setPreviewKey(k => k + 1);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const downloadZip = async () => {
    if (!files.length) return;
    const zip = new JSZip();
    files.forEach(f => zip.file(f.path, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const QUICK_REFINEMENTS = [
    "✨ Add smooth scroll animations",
    "🌓 Add working Dark / Light mode toggle",
    "📱 Make navigation sticky with glassmorphism",
    "📝 Add interactive contact form validation",
    "💳 Add interactive pricing comparison toggle",
    "🎨 Refresh theme with modern vibrance"
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col select-none">
      
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && setAttachments(prev => [...prev, ...Array.from(e.target.files!)])} />
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && setAttachments(prev => [...prev, ...Array.from(e.target.files!)])} />
      <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => e.target.files && setAttachments(prev => [...prev, ...Array.from(e.target.files!)])} />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP STUDIO CONTROL BAR (Unified IDE Header - 1 Single Brand Logo)  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="h-14 border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between bg-white sticky top-0 z-30 shadow-xs">
        
        {/* Left: Brand Logo + Breadcrumbs + Project Name */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Main WEBNTRA Brand Logo (Single source of truth) */}
          <div 
            onClick={onBackToDashboard}
            className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
            title="Return to Projects Dashboard"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-rose-200/90 group-hover:scale-105 transition-all bg-white p-0.5 flex items-center justify-center shrink-0">
              <img src={logoImg} alt="WEBNTRA" className="w-full h-full object-cover rounded-lg" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 group-hover:text-[#E11D48] transition-colors hidden sm:inline">
              WEBNTRA
            </span>
          </div>

          <span className="text-slate-300 font-light select-none">/</span>

          {/* Breadcrumb: Projects */}
          <button
            onClick={onBackToDashboard}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1 hover:underline"
            title="All Projects"
          >
            <span>Projects</span>
          </button>

          <span className="text-slate-300 font-light select-none">/</span>

          {/* Project Title (Inline Editable - NO DUPLICATE LOGO) */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                type="text"
                autoFocus
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-[#E11D48] focus:outline-none"
              />
            ) : (
              <div 
                onClick={() => setIsEditingName(true)}
                className="group flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-lg transition"
                title="Click to rename project"
              >
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate max-w-[120px] sm:max-w-[200px]">
                  {projectName}
                </span>
                <Edit3 size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Saved
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        {activeTab === "preview" && (
          <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shadow-xs">
            {[
              { key: "desktop", label: "Desktop", icon: Monitor, dims: "100%" },
              { key: "tablet", label: "Tablet", icon: Tablet, dims: "768px" },
              { key: "mobile", label: "Mobile", icon: Smartphone, dims: "375px" },
            ].map(d => (
              <button
                key={d.key}
                onClick={() => setDevice(d.key as typeof device)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  device === d.key ? "bg-white text-[#E11D48] shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <d.icon size={13} />
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Right: Studio Action Buttons & User Profile */}
        <div className="flex items-center gap-2">
          {/* Refresh Preview */}
          <button
            onClick={() => setPreviewKey(k => k + 1)}
            title="Reload Preview Frame"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
          >
            <RefreshCw size={14} />
          </button>

          {/* Open in Standalone Tab */}
          <button
            onClick={handleOpenInNewTab}
            disabled={!files.length}
            title="Open Live Website in New Window"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200 disabled:opacity-40"
          >
            <ExternalLink size={14} />
          </button>

          {/* Export & Deploy Modal */}
          <button
            onClick={() => setDeployModalOpen(true)}
            disabled={!files.length}
            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-40"
          >
            <Globe size={13} />
            <span className="hidden sm:inline">Publish / Export</span>
          </button>

          {/* Download ZIP */}
          <button
            onClick={downloadZip}
            disabled={!files.length}
            className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#E11D48]/20 disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download ZIP</span>
          </button>

          {/* Profile Dropdown Menu */}
          {user && (
            <>
              <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />
              <div ref={profileDropdownRef} className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
                  title="Profile & Workspace Settings"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E11D48] to-rose-400 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown size={13} className={`text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { setProfileDropdownOpen(false); onBackToDashboard(); }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FolderGit2 size={14} />
                        <span>My Projects</span>
                      </button>

                      <button
                        onClick={() => { setProfileDropdownOpen(false); if (onOpenSettings) onOpenSettings(); }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Settings size={14} />
                        <span>Workspace Settings</span>
                      </button>
                    </div>

                    {onLogout && (
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                          className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MAIN WORKSPACE (Left: AI Agent Studio | Right: Canvas)              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        ref={workspaceRef}
        className="flex-1 flex flex-col lg:flex-row overflow-hidden"
        style={{ height: "calc(100vh - 3.5rem)" }}
      >
        {/* ── LEFT PANEL: AI MULTI-TURN COPILOT ── */}
        <div
          className="bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col overflow-hidden h-2/5 lg:h-auto flex-shrink-0"
          style={{ width: `${leftPanelPct}%`, maxWidth: '100%' }}
        >
          
          {/* 7-Agent Workflow Strip */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                7-Agent SDLC Pipeline
              </span>
              <span className="text-[10px] font-bold text-[#E11D48]">
                {agents.filter(a => a.status === "completed").length}/7 Verified
              </span>
            </div>

            {/* Micro Agent Badges */}
            <div className="grid grid-cols-7 gap-1">
              {agents.map((ag, i) => (
                <div
                  key={ag.key}
                  title={`${ag.name}: ${ag.status} — ${ag.role}`}
                  className={`p-1.5 rounded-lg border text-center transition-all ${
                    ag.status === "running"
                      ? "bg-rose-50 border-[#E11D48] text-[#E11D48] shadow-xs"
                      : ag.status === "completed"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  <div className="text-[9px] font-black">{i + 1}</div>
                  <div className="text-[8.5px] font-extrabold capitalize truncate">
                    {ag.key === "requirements" ? "Reqs" : ag.key === "accessibility" ? "A11y" : ag.key}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Stream Area */}
          <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.length === 0 && (
              <div className="p-6 text-center text-slate-400 my-auto">
                <Sparkles size={32} className="mx-auto text-rose-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">What would you like to build?</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Describe any website or application. The 7 specialized AI agents will plan, design, code, test, and package it.
                </p>
              </div>
            )}

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {msg.role === "user" ? "You" : "WEBNTRA AI"}
                  </span>
                  <span className="text-[9px] text-slate-300">{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs max-w-[90%] leading-relaxed shadow-xs ${
                    msg.role === "user"
                      ? "bg-[#E11D48] text-white rounded-tr-none font-medium"
                      : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                  }`}
                >
                  {msg.content}

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20 flex flex-wrap gap-1">
                      {msg.attachments.map((att, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-black/20 text-[10px] flex items-center gap-1">
                          <Paperclip size={10} />
                          {att.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 animate-pulse">
                <Loader2 size={15} className="animate-spin text-[#E11D48]" />
                <span className="font-semibold">7 Agents are actively synthesizing changes...</span>
              </div>
            )}
          </div>

          {/* Quick Refinement Chips */}
          {files.length > 0 && !isGenerating && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Suggested Refinements:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-1">
                {QUICK_REFINEMENTS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleGenerate(sug, true)}
                    className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-rose-50 hover:text-[#E11D48] border border-slate-200 hover:border-rose-200 rounded-lg whitespace-nowrap transition shadow-2xs"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Prompt Composer Dock */}
          <div className="p-3.5 border-t border-slate-200 bg-white">
            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] text-slate-700">
                    <Paperclip size={10} className="text-[#E11D48]" />
                    <span className="max-w-[100px] truncate">{file.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#E11D48]/20 focus-within:border-[#E11D48] transition">
              {/* Attachment Popover */}
              <div ref={attachMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsAttachOpen(!isAttachOpen)}
                  className={`p-2 rounded-xl text-slate-400 hover:text-[#E11D48] hover:bg-rose-50 transition ${
                    attachments.length > 0 ? "text-[#E11D48] bg-rose-50" : ""
                  }`}
                  title="Attach references"
                >
                  <Paperclip size={16} />
                </button>

                {isAttachOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50">
                    <button
                      type="button"
                      onClick={() => { imageInputRef.current?.click(); setIsAttachOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-[#E11D48] text-xs font-semibold text-left transition"
                    >
                      <Image size={14} className="text-[#E11D48]" />
                      <span>Upload Images</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMediaModalOpen(true); setIsAttachOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-[#E11D48] text-xs font-semibold text-left transition"
                    >
                      <Sparkles size={14} className="text-[#E11D48]" />
                      <span>Stock Media Library</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.click(); setIsAttachOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-[#E11D48] text-xs font-semibold text-left transition"
                    >
                      <FileText size={14} className="text-[#E11D48]" />
                      <span>Attach Documents</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Textarea */}
              <textarea
                rows={1}
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && refinementPrompt.trim()) {
                    e.preventDefault();
                    handleGenerate(refinementPrompt, files.length > 0);
                    setRefinementPrompt("");
                  }
                }}
                placeholder={files.length ? "Ask AI agents to modify, style, or add features..." : "Describe the website you want to build..."}
                className="flex-1 px-2 py-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => {
                  if (refinementPrompt.trim()) {
                    handleGenerate(refinementPrompt, files.length > 0);
                    setRefinementPrompt("");
                  }
                }}
                disabled={isGenerating || !refinementPrompt.trim()}
                className="p-2.5 bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-40 text-white rounded-xl transition shadow-sm"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>

        </div>

        {/* ── DRAG DIVIDER (desktop only) ── */}
        <div
          onMouseDown={handleDividerMouseDown}
          className="hidden lg:flex flex-col items-center justify-center w-1 bg-slate-200 hover:bg-[#E11D48] transition-colors duration-150 flex-shrink-0 group"
          style={{ cursor: "col-resize", zIndex: 10 }}
          title="Drag to resize panels"
        >
          <div className="w-0.5 h-10 rounded-full bg-slate-400 group-hover:bg-white transition-colors duration-150" />
        </div>

        {/* ── RIGHT PANEL: MULTI-MODE CANVAS ── */}
        <div
          className="bg-slate-100 flex flex-col overflow-hidden flex-1"
          style={{ minWidth: 0 }}
        >
          
          {/* Canvas Sub-Header Tabs */}
          <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-white">
            <div className="flex items-center gap-1">
              {[
                { key: "preview", label: "Live Preview", icon: Eye },
                { key: "code", label: "Code & Files", icon: Code2 },
                { key: "agents", label: "7-Agent Inspector", icon: ShieldCheck },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as typeof activeTab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === t.key
                      ? "bg-[#E11D48] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <t.icon size={13} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Media Library Quick Opener */}
            <button
              onClick={() => setMediaModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-[#E11D48] hover:bg-rose-50 rounded-lg transition"
            >
              <Image size={13} />
              <span>Media Library</span>
            </button>
          </div>

          {/* Canvas Viewport Body */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            
            {/* ── TAB 1: LIVE INTERACTIVE PREVIEW ── */}
            {activeTab === "preview" && (
              <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Simulated Browser Frame Bar */}
                <div className="h-9 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>

                  <div className="bg-white border border-slate-200 px-4 py-0.5 rounded-md font-mono text-[10px] text-slate-600 flex items-center gap-1.5 max-w-xs truncate">
                    <Globe size={11} className="text-emerald-500" />
                    <span>https://preview.webntra.app/{projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</span>
                  </div>

                  <button
                    onClick={() => setShowConsole(!showConsole)}
                    className={`px-2 py-0.5 rounded font-mono text-[10px] transition ${showConsole ? "bg-slate-900 text-white" : "hover:bg-slate-200 text-slate-600"}`}
                  >
                    Console ({logs.length})
                  </button>
                </div>

                {/* Preview iframe container */}
                <div className="flex-1 bg-slate-200/50 p-2 sm:p-4 overflow-auto flex items-start justify-center">
                  {previewHtml ? (
                    <div
                      style={{
                        width: device === "mobile" ? "375px" : device === "tablet" ? "768px" : "100%",
                        height: device === "mobile" ? "667px" : device === "tablet" ? "1024px" : "100%"
                      }}
                      className="bg-white rounded-xl border border-slate-300 shadow-lg overflow-hidden transition-all duration-300 flex flex-col"
                    >
                      <iframe
                        key={previewKey}
                        title="Live Website Preview"
                        sandbox="allow-scripts allow-forms allow-modals allow-popups"
                        srcDoc={previewHtml}
                        className="w-full h-full border-none flex-1"
                      />
                    </div>
                  ) : (
                    <div className="my-auto text-center p-8">
                      {isGenerating ? (
                        <>
                          <Loader2 size={32} className="mx-auto text-[#E11D48] mb-3 animate-spin" />
                          <h4 className="text-sm font-bold text-slate-800">7 AI Agents are generating your website</h4>
                          <p className="text-xs text-slate-400 mt-1">Requirement → Design → Code → Testing → Debug → Security → Deployment</p>
                        </>
                      ) : (
                        <>
                          <Sparkles size={32} className="mx-auto text-slate-300 mb-3" />
                          <h4 className="text-sm font-bold text-slate-700">Studio Ready</h4>
                          <p className="text-xs text-slate-400 mt-1">Enter a prompt in the left chat panel to generate a live website.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Console Drawer */}
                {showConsole && (
                  <div className="h-36 bg-slate-900 text-slate-300 font-mono text-[10px] p-3 overflow-y-auto border-t border-slate-800">
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800 text-slate-400">
                      <span>CONSOLE & AGENT LOGS</span>
                      <button onClick={() => setShowConsole(false)}>✕</button>
                    </div>
                    {logs.map((l, i) => (
                      <div key={i} className="mb-0.5">
                        <span className="text-[#E11D48] mr-1.5">›</span>
                        <span>{l}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* ── TAB 2: CODE & FILES EDITOR ── */}
            {activeTab === "code" && (
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-12">
                
                {/* File Tree Explorer (3 cols) */}
                <div className="col-span-3 border-r border-slate-200 p-3 bg-slate-50 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Project Files</span>
                    <span className="text-[10px] font-mono text-slate-400">{files.length} files</span>
                  </div>
                  <div className="space-y-1">
                    {files.map(f => (
                      <button
                        key={f.path}
                        onClick={() => setSelectedPath(f.path)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                          selectedPath === f.path
                            ? "bg-white text-[#E11D48] font-bold shadow-xs border border-slate-200"
                            : "text-slate-600 hover:bg-white"
                        }`}
                      >
                        <span className="truncate">{f.path}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-400">{f.language}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Editor (9 cols) */}
                <div className="col-span-9 flex flex-col bg-slate-900 text-white overflow-hidden">
                  {/* Editor Header */}
                  <div className="h-10 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">{selectedPath}</span>
                      {codeDirty && (
                        <span className="text-amber-400 text-[10px]">● Unsaved edits</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyCode}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 transition"
                      >
                        {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedCode ? "Copied" : "Copy"}</span>
                      </button>

                      {codeDirty && (
                        <button
                          onClick={handleApplyManualCode}
                          className="px-3 py-1 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <Play size={11} />
                          <span>Apply to Preview</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Code Textarea */}
                  <textarea
                    value={editedCode}
                    onChange={(e) => {
                      setEditedCode(e.target.value);
                      setCodeDirty(true);
                    }}
                    spellCheck={false}
                    className="flex-1 w-full p-4 font-mono text-xs bg-slate-900 text-slate-200 border-none resize-none focus:outline-none leading-relaxed"
                  />
                </div>

              </div>
            )}

            {/* ── TAB 3: 7-AGENT SDLC INSPECTOR ── */}
            {activeTab === "agents" && (
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <AgentInspector
                  agents={agents}
                  logs={logs}
                  requirements={sdlcMetadata.requirements}
                  design={sdlcMetadata.design}
                  tests={sdlcMetadata.tests}
                  security={sdlcMetadata.security}
                />
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Deploy & Export Modal */}
      <DeployModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        projectName={projectName}
        files={files}
      />

      {/* Media Assets Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onInsertImage={(url) => {
          setRefinementPrompt(prev => `${prev} Use image ${url} in the hero banner.`);
        }}
      />

    </div>
  );
};
