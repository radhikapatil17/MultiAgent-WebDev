import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  ArrowLeft, Sparkles, Download, Monitor, Tablet, Smartphone, Send, 
  Loader2, Check, Image, Video, Paperclip, Camera, X, Code2, Terminal, 
  Eye, FileText, Globe, RefreshCw, ExternalLink, ShieldCheck, Layers, 
  Copy, Edit3, CheckCircle2, ChevronDown, ChevronRight, Play, Maximize2,
  FolderTree, Wrench, Share2, FolderGit2, Settings, LogOut, User as UserIcon,
  Users, Server, Package, Plus, Trash2, Database
} from "lucide-react";
import JSZip from "jszip";
import { Agent, FileItem, Project, ChatMessage, User } from "../types";
import { generateWebsite, modifyWebsite, DEFAULT_AGENTS } from "../services/api";
import { saveProject, getProjectById } from "../services/projectStorage";
import { ensureFullStackProjectFiles } from "../utils/fullstackFiles";
import { DeployModal } from "./DeployModal";
import { AgentInspector } from "./AgentInspector";
import { MediaLibraryModal } from "./MediaLibraryModal";
import { CollaboratorsModal } from "./CollaboratorsModal";
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
  const [files, setFiles] = useState<FileItem[]>(() => {
    const raw = initialProject?.files || [];
    if (raw.length > 0) {
      return ensureFullStackProjectFiles(initialProject?.name || "Modern Web App", initialProject?.prompt || "", raw);
    }
    return raw;
  });
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
  const [collaboratorsOpen, setCollaboratorsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleCreateFile = () => {
    const rawName = newFileName.trim();
    if (!rawName) return;
    if (files.some(f => f.path.toLowerCase() === rawName.toLowerCase())) {
      alert("A file with this name already exists.");
      return;
    }
    let lang = "plaintext";
    if (rawName.endsWith(".html")) lang = "html";
    else if (rawName.endsWith(".css")) lang = "css";
    else if (rawName.endsWith(".js") || rawName.endsWith(".ts")) lang = "javascript";
    else if (rawName.endsWith(".json")) lang = "json";
    else if (rawName.endsWith(".sql")) lang = "sql";
    else if (rawName.endsWith(".md")) lang = "markdown";

    const defaultContent = rawName.endsWith(".html")
      ? `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${rawName}</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <nav><a href="index.html">← Back to Home</a></nav>\n  <main style="padding: 40px; font-family: sans-serif;">\n    <h1>${rawName}</h1>\n    <p>Custom page created in WEBNTRA Studio.</p>\n  </main>\n</body>\n</html>`
      : rawName.endsWith(".css")
      ? `/* ${rawName} */\n`
      : rawName.endsWith(".js")
      ? `// ${rawName}\nconsole.log('${rawName} initialized');\n`
      : rawName.endsWith(".sql")
      ? `-- ${rawName}\nCREATE TABLE IF NOT EXISTS records (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n`
      : `// ${rawName}\n`;

    const newFile: FileItem = { path: rawName, content: defaultContent, language: lang };
    const updated = [...files, newFile];
    setFiles(updated);
    setSelectedPath(rawName);
    setNewFileName("");
    setIsCreatingFile(false);
  };

  const handleDeleteFile = (pathToDelete: string) => {
    if (pathToDelete.toLowerCase() === "index.html") {
      alert("The primary index.html file cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to delete ${pathToDelete}?`)) return;
    const updated = files.filter(f => f.path !== pathToDelete);
    setFiles(updated);
    if (selectedPath === pathToDelete) {
      setSelectedPath(updated[0]?.path || "index.html");
    }
  };

  // Guarantee all full-stack files (server.js, package.json, README.md) are present
  useEffect(() => {
    if (files.length > 0 && (!files.some(f => f.path.toLowerCase() === "server.js") || !files.some(f => f.path.toLowerCase() === "package.json"))) {
      setFiles(prev => ensureFullStackProjectFiles(projectName, prompt, prev));
    }
  }, [files.length, projectName, prompt]);

  // Active Preview Page for multi-page applications
  const [activePreviewPage, setActivePreviewPage] = useState<string>("index.html");

  // Metadata for SDLC Inspection
  const [sdlcMetadata, setSdlcMetadata] = useState<{
    requirements?: any;
    design?: any;
    tests?: any;
    debug?: any;
    security?: any;
    deployment?: any;
  }>(() => ({
    requirements: initialProject?.requirements,
    design: initialProject?.design,
    tests: initialProject?.tests,
    debug: initialProject?.debug,
    security: initialProject?.security,
    deployment: initialProject?.deployment
  }));

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

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
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    if (isAttachOpen || profileDropdownOpen || moreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAttachOpen, profileDropdownOpen, moreMenuOpen]);

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

  // Handle inter-page iframe navigation
  useEffect(() => {
    const handleMsg = (ev: MessageEvent) => {
      if (ev.data?.type === "NAVIGATE_PAGE" && ev.data?.page) {
        const target = String(ev.data.page).replace(/^\.\//, "").split("?")[0].split("#")[0];
        const match = files.find(f => f.path.toLowerCase() === target.toLowerCase() || f.path.toLowerCase().endsWith("/" + target.toLowerCase()));
        if (match) {
          setActivePreviewPage(match.path);
        }
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, [files]);

  // Compiled Preview HTML
  const previewHtml = useMemo(() => {
    if (!files.length) return "";
    const activeDoc = files.find(f => f.path.toLowerCase() === activePreviewPage.toLowerCase())
      || files.find(f => f.path.toLowerCase() === "index.html")
      || files.find(f => f.path.endsWith(".html"));
    if (!activeDoc) return "";
    let html = activeDoc.content;
    const css = files.filter(f => f.path.endsWith(".css")).map(f => f.content).join("\n");
    // Exclude Node.js server scripts from being injected into the browser preview DOM
    const js = files.filter(f => f.path.endsWith(".js") && !f.path.toLowerCase().includes("server")).map(f => f.content).join("\n");

    // Guard against preview iframe navigating away, handle inter-page links, and simulate backend REST API responses
    const guardScript = `
      <script>
        (function() {
          // Intercept fetch calls to /api/* so interactive buttons work smoothly in preview
          var origFetch = window.fetch;
          window.fetch = function(url, options) {
            if (typeof url === 'string' && url.indexOf('/api/') !== -1) {
              var dummyData = { success: true, status: 'healthy', message: 'Simulated API Success', timestamp: new Date().toISOString() };
              if (url.indexOf('health') !== -1) dummyData = { status: 'healthy', uptime: 1042, version: '2.0.0' };
              if (url.indexOf('analytics') !== -1) dummyData = { revenue: [120, 160, 210, 270, 350, 480], users: [60, 95, 140, 220, 310, 520] };
              if (url.indexOf('appointment') !== -1 || url.indexOf('booking') !== -1) dummyData = { success: true, id: 'bk_' + Math.random().toString(36).substring(2, 8), message: 'Booking confirmed!' };
              return Promise.resolve(new Response(JSON.stringify(dummyData), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              }));
            }
            return origFetch.apply(this, arguments);
          };

          document.addEventListener('click', function(e) {
            var a = e.target.closest('a');
            if (a) {
              var href = a.getAttribute('href') || '';
              // Intercept internal page transitions like href="about.html"
              if (href.indexOf('.html') !== -1 && !href.startsWith('http') && !href.startsWith('//')) {
                e.preventDefault();
                window.parent.postMessage({ type: 'NAVIGATE_PAGE', page: href }, '*');
                return;
              }
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
  }, [files, activePreviewPage, previewKey]);

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
        debug: sdlcMetadata.debug,
        security: sdlcMetadata.security,
        deployment: sdlcMetadata.deployment
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

      const fullFiles = ensureFullStackProjectFiles(res.projectName || projectName, targetPrompt, res.files);
      setFiles(fullFiles);
      setAgents(res.agents);
      setLogs(res.logs);
      setSelectedPath(fullFiles[0]?.path || "index.html");
      if (!isModification && res.projectName) {
        setProjectName(res.projectName);
      }
      setSdlcMetadata({
        requirements: res.requirements,
        design: res.design,
        tests: res.tests,
        debug: res.debug,
        security: res.security,
        deployment: res.deployment
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
    const allFiles = ensureFullStackProjectFiles(projectName, prompt, files);
    const zip = new JSZip();
    allFiles.forEach(f => zip.file(f.path, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-fullstack.zip`;
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

        {/* ── RIGHT: Download ZIP (primary CTA) + ⋯ More + Profile ── */}
        <div className="flex items-center gap-2">

          {/* ⋯ More menu */}
          <div ref={moreMenuRef} className="relative">
            <button
              onClick={() => setMoreMenuOpen(o => !o)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                moreMenuOpen
                  ? "bg-slate-100 border-slate-300 text-slate-900"
                  : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="More actions"
            >
              <span className="text-base leading-none tracking-widest">···</span>
            </button>

            {moreMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50">
                {/* Collaborate */}
                <button
                  onClick={() => { setCollaboratorsOpen(true); setMoreMenuOpen(false); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Users size={14} className="text-violet-500" />
                  Collaborate
                </button>

                {/* Refresh Preview */}
                <button
                  onClick={() => { setPreviewKey(k => k + 1); setMoreMenuOpen(false); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <RefreshCw size={14} className="text-slate-400" />
                  Refresh Preview
                </button>

                {/* Open in new tab */}
                <button
                  onClick={() => { handleOpenInNewTab(); setMoreMenuOpen(false); }}
                  disabled={!files.length}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
                >
                  <ExternalLink size={14} className="text-slate-400" />
                  Open in New Tab
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Publish / Export */}
                <button
                  onClick={() => { setDeployModalOpen(true); setMoreMenuOpen(false); }}
                  disabled={!files.length}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
                >
                  <Globe size={14} className="text-slate-400" />
                  Publish / Export
                </button>
              </div>
            )}
          </div>

          {/* Download ZIP — primary CTA */}
          <button
            onClick={downloadZip}
            disabled={!files.length}
            className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#E11D48]/20 disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Profile Dropdown */}
          {user && (
            <>
              <div className="w-px h-5 bg-slate-200 mx-0.5" />
              <div ref={profileDropdownRef} className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
                  title="Profile & Settings"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E11D48] to-rose-400 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown size={12} className={`text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setProfileDropdownOpen(false); onBackToDashboard(); }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FolderGit2 size={14} /> My Projects
                      </button>
                      <button
                        onClick={() => { setProfileDropdownOpen(false); if (onOpenSettings) onOpenSettings(); }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Settings size={14} /> Workspace Settings
                      </button>
                    </div>
                    {onLogout && (
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                          className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut size={14} /> Sign Out
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

            {/* Right side: viewport icons (preview only) + media */}
            <div className="flex items-center gap-2">
              {activeTab === "preview" && (
                <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  {[
                    { key: "desktop", icon: Monitor },
                    { key: "tablet", icon: Tablet },
                    { key: "mobile", icon: Smartphone },
                  ].map(d => (
                    <button
                      key={d.key}
                      onClick={() => setDevice(d.key as typeof device)}
                      title={d.key.charAt(0).toUpperCase() + d.key.slice(1)}
                      className={`p-1.5 rounded-lg transition ${
                        device === d.key
                          ? "bg-white text-[#E11D48] shadow-xs"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      <d.icon size={13} />
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setMediaModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-[#E11D48] hover:bg-rose-50 rounded-lg transition"
              >
                <Image size={13} />
                <span className="hidden md:inline">Media</span>
              </button>
            </div>
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

                  <div className="flex items-center gap-2 max-w-md">
                    <div className="bg-white border border-slate-200 px-3 py-0.5 rounded-md font-mono text-[10px] text-slate-600 flex items-center gap-1.5 truncate">
                      <Globe size={11} className="text-emerald-500 shrink-0" />
                      <span className="truncate">https://preview.webntra.app/{projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/{activePreviewPage}</span>
                    </div>

                    {/* Multi-Page Selector */}
                    {files.filter(f => f.path.endsWith(".html")).length > 1 && (
                      <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px] shrink-0">
                        <span className="text-slate-400 font-bold">Page:</span>
                        <select
                          value={activePreviewPage}
                          onChange={(e) => setActivePreviewPage(e.target.value)}
                          className="bg-transparent font-mono font-bold text-slate-800 text-[10px] focus:outline-none cursor-pointer"
                        >
                          {files.filter(f => f.path.endsWith(".html")).map(p => (
                            <option key={p.path} value={p.path}>{p.path}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const blob = new Blob([previewHtml], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                      }}
                      title="Open website in standalone new browser tab"
                      className="px-2 py-0.5 rounded font-mono text-[10px] text-slate-600 hover:bg-slate-200 transition flex items-center gap-1"
                    >
                      <ExternalLink size={11} />
                      <span className="hidden sm:inline">New Tab</span>
                    </button>
                    <button
                      onClick={() => setShowConsole(!showConsole)}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] transition ${showConsole ? "bg-slate-900 text-white" : "hover:bg-slate-200 text-slate-600"}`}
                    >
                      Console ({logs.length})
                    </button>
                  </div>
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
                <div className="col-span-3 border-r border-slate-200 p-3 bg-slate-50 overflow-y-auto flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Project Files</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setIsCreatingFile(!isCreatingFile)}
                          title="Create new file"
                          className="p-1 text-slate-500 hover:text-[#E11D48] hover:bg-rose-50 rounded-md transition"
                        >
                          <Plus size={13} />
                        </button>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-rose-50 text-[#E11D48] rounded-full border border-rose-200">
                          {files.length} files
                        </span>
                      </div>
                    </div>

                    {/* Inline Create File Box */}
                    {isCreatingFile && (
                      <div className="mb-3 p-2 bg-white rounded-xl border border-rose-200 shadow-xs">
                        <input
                          type="text"
                          autoFocus
                          placeholder="e.g. about.html, schema.sql"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateFile();
                            if (e.key === "Escape") setIsCreatingFile(false);
                          }}
                          className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E11D48]"
                        />
                        <div className="flex items-center justify-end gap-1.5 mt-2">
                          <button
                            onClick={() => setIsCreatingFile(false)}
                            className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-600 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateFile}
                            className="px-2.5 py-0.5 text-[10px] font-bold bg-[#E11D48] text-white rounded-md hover:bg-[#BE123C]"
                          >
                            Add File
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Unbounded Multi-Language File Tree */}
                    <div className="space-y-3">
                      {/* 1. Pages & UI */}
                      {files.some(f => f.path.match(/\.(html|htm|jsx|tsx|vue|svelte)$/i)) && (
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1">
                            <Globe size={10} className="text-orange-500" />
                            <span>Pages & UI</span>
                          </div>
                          <div className="space-y-0.5">
                            {files.filter(f => f.path.match(/\.(html|htm|jsx|tsx|vue|svelte)$/i)).map(f => (
                              <div
                                key={f.path}
                                onClick={() => setSelectedPath(f.path)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between group cursor-pointer ${
                                  selectedPath === f.path
                                    ? "bg-white text-[#E11D48] font-bold shadow-2xs border border-slate-200"
                                    : "text-slate-600 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Globe size={13} className="text-orange-500 shrink-0" />
                                  <span className="truncate">{f.path}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {f.path.toLowerCase() !== "index.html" && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.path); }}
                                      title="Delete file"
                                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 rounded transition"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                  <span className="text-[9px] uppercase font-bold text-slate-400">{f.language}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Stylesheets */}
                      {files.some(f => f.path.match(/\.(css|scss|sass|less)$/i)) && (
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1">
                            <Layers size={10} className="text-blue-500" />
                            <span>Design & Styles</span>
                          </div>
                          <div className="space-y-0.5">
                            {files.filter(f => f.path.match(/\.(css|scss|sass|less)$/i)).map(f => (
                              <div
                                key={f.path}
                                onClick={() => setSelectedPath(f.path)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between group cursor-pointer ${
                                  selectedPath === f.path
                                    ? "bg-white text-[#E11D48] font-bold shadow-2xs border border-slate-200"
                                    : "text-slate-600 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Layers size={13} className="text-blue-500 shrink-0" />
                                  <span className="truncate">{f.path}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.path); }}
                                    title="Delete file"
                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 rounded transition"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                  <span className="text-[9px] uppercase font-bold text-slate-400">{f.language}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. Client Logic & Scripts */}
                      {files.some(f => f.path.match(/\.(js|ts)$/i) && !f.path.toLowerCase().includes("server") && !f.path.startsWith("routes/") && !f.path.startsWith("api/")) && (
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1">
                            <Code2 size={10} className="text-amber-500" />
                            <span>Client Scripts</span>
                          </div>
                          <div className="space-y-0.5">
                            {files.filter(f => f.path.match(/\.(js|ts)$/i) && !f.path.toLowerCase().includes("server") && !f.path.startsWith("routes/") && !f.path.startsWith("api/")).map(f => (
                              <div
                                key={f.path}
                                onClick={() => setSelectedPath(f.path)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between group cursor-pointer ${
                                  selectedPath === f.path
                                    ? "bg-white text-[#E11D48] font-bold shadow-2xs border border-slate-200"
                                    : "text-slate-600 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Code2 size={13} className="text-amber-500 shrink-0" />
                                  <span className="truncate">{f.path}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.path); }}
                                    title="Delete file"
                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 rounded transition"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                  <span className="text-[9px] uppercase font-bold text-slate-400">{f.language}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. Backend & REST APIs */}
                      {files.some(f => f.path.toLowerCase().includes("server") || f.path.match(/\.(py|php|rb|go)$/i) || f.path.startsWith("routes/") || f.path.startsWith("api/")) && (
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1">
                            <Server size={10} className="text-emerald-500" />
                            <span>Backend & APIs</span>
                          </div>
                          <div className="space-y-0.5">
                            {files.filter(f => f.path.toLowerCase().includes("server") || f.path.match(/\.(py|php|rb|go)$/i) || f.path.startsWith("routes/") || f.path.startsWith("api/")).map(f => (
                              <div
                                key={f.path}
                                onClick={() => setSelectedPath(f.path)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between group cursor-pointer ${
                                  selectedPath === f.path
                                    ? "bg-white text-[#E11D48] font-bold shadow-2xs border border-slate-200"
                                    : "text-slate-600 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Server size={13} className="text-emerald-500 shrink-0" />
                                  <span className="truncate">{f.path}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">{f.language}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 5. Database & Schemas */}
                      {files.some(f => f.path.match(/\.(sql|prisma)$/i) || f.path.includes("schema")) && (
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1">
                            <Database size={10} className="text-purple-500" />
                            <span>Database & Schemas</span>
                          </div>
                          <div className="space-y-0.5">
                            {files.filter(f => f.path.match(/\.(sql|prisma)$/i) || f.path.includes("schema")).map(f => (
                              <div
                                key={f.path}
                                onClick={() => setSelectedPath(f.path)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between group cursor-pointer ${
                                  selectedPath === f.path
                                    ? "bg-white text-[#E11D48] font-bold shadow-2xs border border-slate-200"
                                    : "text-slate-600 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Database size={13} className="text-purple-500 shrink-0" />
                                  <span className="truncate">{f.path}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">{f.language}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 6. Config & Documentation */}
                      {files.some(f => ["package.json", "readme.md", ".env.example", ".env", "dockerfile"].includes(f.path.toLowerCase()) || f.path.match(/\.(json|md|yml|yaml|env)$/i)) && (
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1">
                            <FolderGit2 size={10} className="text-indigo-500" />
                            <span>Config & Documentation</span>
                          </div>
                          <div className="space-y-0.5">
                            {files.filter(f => ["package.json", "readme.md", ".env.example", ".env", "dockerfile"].includes(f.path.toLowerCase()) || f.path.match(/\.(json|md|yml|yaml|env)$/i)).map(f => (
                              <div
                                key={f.path}
                                onClick={() => setSelectedPath(f.path)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between group cursor-pointer ${
                                  selectedPath === f.path
                                    ? "bg-white text-[#E11D48] font-bold shadow-2xs border border-slate-200"
                                    : "text-slate-600 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {f.path.toLowerCase() === "package.json" && <FolderGit2 size={13} className="text-rose-500 shrink-0" />}
                                  {f.path.toLowerCase() === "readme.md" && <FileText size={13} className="text-indigo-500 shrink-0" />}
                                  {!["package.json", "readme.md"].includes(f.path.toLowerCase()) && <FileText size={13} className="text-slate-400 shrink-0" />}
                                  <span className="truncate">{f.path}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">{f.language}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Download ZIP CTA at bottom of file tree */}
                  <div className="pt-3 mt-3 border-t border-slate-200">
                    <button
                      onClick={downloadZip}
                      className="w-full py-2 px-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-[#E11D48] rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs group"
                    >
                      <Download size={13} className="text-[#E11D48] group-hover:translate-y-0.5 transition-transform" />
                      <span>Download Complete ZIP</span>
                    </button>
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
                  files={files}
                  projectName={projectName}
                  requirements={sdlcMetadata.requirements}
                  design={sdlcMetadata.design}
                  tests={sdlcMetadata.tests}
                  debug={sdlcMetadata.debug}
                  security={sdlcMetadata.security}
                  deployment={sdlcMetadata.deployment}
                  onSelectFile={(path) => {
                    setSelectedPath(path);
                    setActiveTab("code");
                  }}
                  onDownloadZip={downloadZip}
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

      {/* Collaborators Modal */}
      {collaboratorsOpen && (
        <CollaboratorsModal
          projectId={projectId}
          projectName={projectName}
          ownerName={user?.name || "You"}
          ownerEmail={user?.email || ""}
          onClose={() => setCollaboratorsOpen(false)}
        />
      )}

    </div>
  );
};
