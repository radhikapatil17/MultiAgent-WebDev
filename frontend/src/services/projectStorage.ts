import { Project, FileItem, Agent } from "../types";
import { DEFAULT_AGENTS } from "./api";

const STORAGE_KEY = "webntra_projects_v2";
const SETTINGS_KEY = "webntra_settings_v2";

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getSampleProjects();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to read projects from storage:", e);
    return getSampleProjects();
  }
}

export function getProjectById(id: string): Project | null {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
}

export function saveProject(project: Project): void {
  try {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    const updatedProject = { ...project, updatedAt: new Date().toISOString() };
    if (index >= 0) {
      projects[index] = updatedProject;
    } else {
      projects.unshift(updatedProject);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn("Failed to save project:", e);
  }
}

export function deleteProject(id: string): void {
  try {
    const projects = getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn("Failed to delete project:", e);
  }
}

export function duplicateProject(id: string): Project | null {
  const existing = getProjectById(id);
  if (!existing) return null;
  const newProj: Project = {
    ...existing,
    id: "proj_" + Math.random().toString(36).substring(2, 9),
    name: `${existing.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveProject(newProj);
  return newProj;
}

export function createNewProject(prompt: string, name?: string): Project {
  const newProj: Project = {
    id: "proj_" + Math.random().toString(36).substring(2, 9),
    name: name || inferProjectName(prompt),
    prompt,
    files: [],
    agents: DEFAULT_AGENTS.map((a: Agent) => ({ ...a, status: "pending" as const, detail: "Waiting to begin" })),
    logs: ["Project created. Awaiting AI generation..."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: inferTags(prompt),
    category: inferCategory(prompt)
  };
  saveProject(newProj);
  return newProj;
}

function inferProjectName(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("cloud") || p.includes("console")) return "Aether Cloud";
  if (p.includes("fintech") || p.includes("payment")) return "PayVero Gateway";
  if (p.includes("telehealth") || p.includes("health") || p.includes("doctor")) return "PulseHealth Network";
  if (p.includes("portfolio") || p.includes("creative studio")) return "Carter Studio";
  if (p.includes("restaurant") || p.includes("kitchen")) return "Luma Kitchen";
  if (p.includes("ecommerce") || p.includes("shop")) return "Nova Store";
  if (p.includes("saas")) return "Orbit SaaS";
  return "WEBNTRA Project";
}

function inferTags(prompt: string): string[] {
  const p = prompt.toLowerCase();
  const tags = ["Responsive", "Vanilla HTML/CSS/JS"];
  if (p.includes("cloud") || p.includes("saas")) tags.push("Cloud", "SaaS", "Dashboard");
  if (p.includes("fintech") || p.includes("payment")) tags.push("Fintech", "Security", "Payments");
  if (p.includes("telehealth") || p.includes("health")) tags.push("Healthcare", "Appointments", "HIPAA");
  if (p.includes("portfolio") || p.includes("studio")) tags.push("Portfolio", "Agency", "Minimal");
  return tags.slice(0, 4);
}

function inferCategory(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("cloud") || p.includes("saas")) return "Enterprise SaaS";
  if (p.includes("fintech") || p.includes("payment")) return "Financial Tech";
  if (p.includes("telehealth") || p.includes("health")) return "Healthcare";
  if (p.includes("portfolio") || p.includes("studio")) return "Agency & Studio";
  if (p.includes("restaurant")) return "Food & Hospitality";
  if (p.includes("ecommerce") || p.includes("shop")) return "E-Commerce";
  return "General Web";
}

function getSampleProjects(): Project[] {
  return [
    {
      id: "proj_sample_cloud",
      name: "Aether Cloud Console",
      prompt: "Create an enterprise cloud management SaaS website with live resource metrics preview, server pricing calculator, and client trust logos.",
      category: "Enterprise SaaS",
      tags: ["Cloud", "SaaS", "Dashboard", "Real-time"],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      agents: [
        { key: "requirements", name: "Requirement Agent", provider: "WEBNTRA Engine", status: "completed", detail: "Structured 5 core pages", role: "Requirements Analysis" },
        { key: "design", name: "Design Agent", provider: "WEBNTRA Engine", status: "completed", detail: "Rose/Slate enterprise palette", role: "Design Systems" },
        { key: "code", name: "Code Agent", provider: "WEBNTRA Engine", status: "completed", detail: "Clean modular files generated", role: "Full-Stack Code" },
        { key: "testing", name: "Testing Agent", provider: "WEBNTRA Engine", status: "completed", detail: "100% responsiveness score", role: "Automated Testing" },
        { key: "debug", name: "Debug Agent", provider: "WEBNTRA Engine", status: "completed", detail: "Cross-browser aligned", role: "Quality Debugging" },
        { key: "security", name: "Security Agent", provider: "WEBNTRA Engine", status: "completed", detail: "0 vulnerabilities found", role: "Security Audit" },
        { key: "deployment", name: "Deployment Agent", provider: "WEBNTRA Engine", status: "completed", detail: "Production package ready", role: "Build & Deploy" }
      ],
      logs: ["Requirements completed", "Design tokens created", "HTML/CSS/JS built", "All security checks passed"],
      files: [
        {
          path: "index.html",
          language: "html",
          content: `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aether Cloud Console</title><link rel="stylesheet" href="styles.css"></head><body><nav><a class="brand" href="#overview">Aether Cloud<b>.</b></a><div class="nav-links"><a href="#clusters">Clusters</a><a href="#metrics">Live Metrics</a><a href="#pricing">Pricing</a><a href="#contact">Contact</a></div><button class="menu">☰</button></nav><main><section id="overview" class="hero"><div class="eyebrow">Enterprise Cloud Infrastructure</div><h1>High-Performance Multi-Region Cloud Engine<span>.</span></h1><p>Orchestrate server nodes, live telemetry metrics, and auto-scaling clusters across 40+ global regions in real time.</p><div class="actions"><a class="button primary" href="#clusters">Launch Cluster</a><a class="button ghost" href="#metrics">Live Demo</a></div></section><section id="clusters" class="cards-section"><div class="section-head"><span>Architecture</span><h2>Global Cluster Nodes</h2></div><div class="grid"><article class="card"><div class="card-no">01</div><h3>Zero-Latency Edge Nodes</h3><p>Sub-5ms response times distributed globally with automatic failover routing.</p></article><article class="card"><div class="card-no">02</div><h3>Live Resource Telemetry</h3><p>Stream real-time CPU, memory, and bandwidth utilization directly to your command console.</p></article><article class="card"><div class="card-no">03</div><h3>Automated Dynamic Scaling</h3><p>Scale workloads up or down dynamically based on live traffic spikes.</p></article></div></section></main><footer>Generated by WEBNTRA AI Studio</footer><script src="script.js"></script></body></html>`
        },
        {
          path: "styles.css",
          language: "css",
          content: `*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:system-ui,-apple-system,sans-serif;color:#0f172a;background:#fafafa}a{text-decoration:none;color:inherit}nav{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,6vw,88px);background:rgba(255,255,255,.94);border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:10;backdrop-filter:blur(16px)}.brand{font-weight:800;font-size:20px;letter-spacing:-.03em;color:#0f172a}.brand b{color:#E11D48}.nav-links{display:flex;gap:24px;font-size:14px;font-weight:600;color:#64748b}.nav-links a:hover{color:#E11D48}.hero{padding:clamp(80px,12vw,140px) clamp(20px,8vw,120px);background:radial-gradient(circle at 80% 10%,#ffe4e6 0,transparent 35%),linear-gradient(135deg,#fff,#fff1f2 60%,#fafafa)}.eyebrow{color:#E11D48;text-transform:uppercase;letter-spacing:.14em;font-size:11px;font-weight:800}.hero h1{font-size:clamp(40px,6vw,84px);line-height:1.05;letter-spacing:-.04em;max-width:900px;margin:20px 0;color:#0f172a}.hero h1 span{color:#E11D48}.hero p{font-size:clamp(16px,2vw,19px);line-height:1.65;color:#64748b;max-width:640px}.actions{display:flex;gap:12px;margin-top:32px}.button{display:inline-flex;align-items:center;justify-content:center;padding:13px 24px;border-radius:12px;font-weight:700;font-size:14px;transition:all .2s}.primary{background:#E11D48;color:white;box-shadow:0 8px 20px rgba(225,29,72,.25)}.primary:hover{background:#be123c;transform:translateY(-1px)}.ghost{border:1px solid #e2e8f0;background:white;color:#334155}.cards-section{padding:72px clamp(20px,8vw,120px)}.section-head h2{font-size:36px;letter-spacing:-.03em;margin:10px 0 24px;color:#0f172a}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}.card{padding:28px;border:1px solid #e2e8f0;border-radius:20px;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.03)}.card-no{font-size:12px;font-weight:800;color:#E11D48;margin-bottom:24px}.card h3{font-size:19px;margin:0 0 10px;color:#0f172a;font-weight:700}.card p{color:#64748b;line-height:1.6;font-size:14px}footer{padding:32px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;text-align:center}`
        },
        {
          path: "script.js",
          language: "javascript",
          content: `console.log("Aether Cloud console initialized.");`
        }
      ]
    },
    {
      id: "proj_sample_fintech",
      name: "PayVero Gateway",
      prompt: "Build an ultra-modern FinTech payment gateway website with real-time multi-currency converter, interactive transaction analytics demo, PCI-DSS security badges, and developer SDK docs.",
      category: "Financial Tech",
      tags: ["Fintech", "Security", "Payments", "PCI-DSS"],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      agents: [
        { key: "requirements", name: "Requirement Agent", provider: "WEBNTRA Engine", status: "completed", detail: "Fintech spec mapped", role: "Requirements Analysis" },
        { key: "design", name: "Design Agent", provider: "WEBNTRA Engine", status: "completed", detail: "High-trust security UI", role: "Design Systems" },
        { key: "code", name: "Code Agent", provider: "WEBNTRA Engine", status: "completed", detail: "Interactive currency converter", role: "Full-Stack Code" },
        { key: "testing", name: "Testing Agent", provider: "WEBNTRA Engine", status: "completed", detail: "Pass: layout & validation", role: "Automated Testing" },
        { key: "debug", name: "Debug Agent", provider: "WEBNTRA Engine", status: "completed", detail: "No regressions", role: "Quality Debugging" },
        { key: "security", name: "Security Agent", provider: "WEBNTRA Engine", status: "completed", detail: "PCI compliance rules check", role: "Security Audit" },
        { key: "deployment", name: "Deployment Agent", provider: "WEBNTRA Engine", status: "completed", detail: "Ready to deploy", role: "Build & Deploy" }
      ],
      logs: ["FinTech specifications parsed", "Security badges verified", "Interactive converter validated"],
      files: [
        {
          path: "index.html",
          language: "html",
          content: `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PayVero Payment Gateway</title><link rel="stylesheet" href="styles.css"></head><body><nav><a class="brand" href="#home">PayVero<b>.</b></a><div class="nav-links"><a href="#features">Features</a><a href="#security">Security</a><a href="#developers">Developers</a></div></nav><main><section class="hero"><h1>Next-Gen Payment Infrastructure for Global Commerce<span>.</span></h1><p>Instant multi-currency settlement, AI-driven fraud shield, and developer-first SDKs with 99.999% uptime.</p></section></main><footer>Generated by WEBNTRA AI Studio</footer></body></html>`
        },
        {
          path: "styles.css",
          language: "css",
          content: `body{margin:0;font-family:system-ui,sans-serif;background:#fff;color:#0f172a}nav{height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 50px;border-bottom:1px solid #e2e8f0}.brand{font-weight:800;font-size:22px;color:#0f172a}.brand b{color:#E11D48}.nav-links{display:flex;gap:20px;font-size:14px;font-weight:600;color:#64748b}.hero{padding:100px 50px;text-align:center}h1{font-size:56px;letter-spacing:-.04em;max-width:850px;margin:0 auto 20px}h1 span{color:#E11D48}p{color:#64748b;font-size:18px;max-width:600px;margin:0 auto}footer{padding:30px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:12px}`
        }
      ]
    }
  ];
}
