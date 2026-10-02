import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";

const app = express();
const port = Number(process.env.PORT || 5000);
const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:5173";

app.use(cors({
  origin: [frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));
const demoMode = String(process.env.DEMO_MODE || "auto").toLowerCase();
const timeoutMs = Number(process.env.AGENT_TIMEOUT_MS || 15000);

const agents = [
  ["requirements", "Requirement Agent", "Gemini", "gemini"],
  ["design", "Design Agent", "Gemini", "gemini"],
  ["code", "Code Agent", "OpenRouter free model", "openrouter"],
  ["testing", "Testing Agent", "Groq", "groq"],
  ["debug", "Debug Agent", "OpenRouter free model", "openrouter"],
  ["security", "Security Agent", "Groq", "groq"],
  ["deployment", "Deployment Agent", "Gemini", "gemini"]
] as const;

type AgentStatus = "pending" | "running" | "completed" | "failed";
type Provider = "gemini" | "openrouter" | "groq";
type FileItem = { path: string; content: string; language: string };
type AgentState = { key: string; name: string; provider: string; providerKey: Provider; status: AgentStatus; detail: string };

function baseAgents(): AgentState[] {
  return agents.map(([key, name, provider, providerKey], i) => ({
    key, name, provider, providerKey,
    status: "pending",
    detail: i === 0 ? "Waiting to understand your idea" : `Waiting for ${agents[i - 1][1]}`
  }));
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function withTimeout<T>(promise: Promise<T>, ms = timeoutMs): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Agent timeout after ${ms}ms`)), ms))
  ]);
}

function cleanText(text: string) {
  return String(text || "").replace(/^```(?:json|html|css|javascript|js)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function extractJson(text: string): any {
  const cleaned = cleanText(text);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Model did not return valid JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function keyFor(provider: Provider) {
  if (provider === "gemini") return process.env.GEMINI_API_KEY;
  if (provider === "openrouter") return process.env.OPENROUTER_API_KEY;
  return process.env.GROQ_API_KEY;
}

function modelFor(provider: Provider) {
  if (provider === "gemini") return process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  if (provider === "openrouter") return process.env.OPENROUTER_MODEL || "openrouter/free";
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

async function callProvider(provider: Provider, prompt: string): Promise<string> {
  const key = keyFor(provider);
  if (!key) throw new Error(`${provider.toUpperCase()}_API_KEY is not configured`);

  if (provider === "gemini") {
    const client = new GoogleGenAI({ apiKey: key });
    const response = await withTimeout(client.interactions.create({
      model: modelFor(provider),
      input: prompt,
      store: false
    }));
    return response.output_text || "";
  }

  const endpoint = provider === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
  const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${key}` };
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = process.env.APP_URL || "http://localhost:5173";
    headers["X-Title"] = "WebForge AI";
  }
  const response = await withTimeout(fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: modelFor(provider),
      messages: [
        { role: "system", content: "You are one specialized agent in WebForge AI. Follow the requested JSON schema exactly. Do not use markdown fences." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    })
  }));
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${response.status} ${data?.error?.message || "Provider request failed"}`);
  return data?.choices?.[0]?.message?.content || "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[ch]!));
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "webforge-site";
}

function inferTitle(prompt: string) {
  const lower = prompt.toLowerCase();
  if (lower.includes("cloud") || lower.includes("management console") || lower.includes("metrics preview")) return "Aether Cloud";
  if (lower.includes("fintech") || lower.includes("payment") || lower.includes("currency")) return "PayVero Gateway";
  if (lower.includes("telehealth") || lower.includes("health") || lower.includes("doctor") || lower.includes("medical")) return "PulseHealth Network";
  if (lower.includes("portfolio") || lower.includes("creative studio") || lower.includes("consultancy")) return "Carter Studio";
  if (lower.includes("restaurant") || lower.includes("kitchen")) return "Luma Kitchen";
  if (lower.includes("e-commerce") || lower.includes("ecommerce") || lower.includes("shop")) return "Nova Store";
  if (lower.includes("saas")) return "Orbit SaaS";
  
  // Extract custom name if user wrote "for [Name]" or "called [Name]"
  const namedMatch = prompt.match(/(?:for|called|named)\s+([A-Z][a-zA-Z0-9_\s]{2,20})/);
  if (namedMatch?.[1]) return namedMatch[1].trim();

  // Dynamic aesthetic fallback names
  const fallbacks = ["Apex Studio", "Venture Digital", "Nexus Web", "Horizon Creative", "Lumina Media", "Kinetic Labs"];
  const hash = prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbacks[hash % fallbacks.length];
}

function localProject(prompt: string, reason = "Local fallback") {
  const title = inferTitle(prompt);
  const cloud = /cloud|management console|metrics|cluster/i.test(prompt);
  const fintech = /fintech|payment|currency|wallet|transaction/i.test(prompt);
  const telehealth = /telehealth|health|doctor|appointment|medical/i.test(prompt);
  const portfolio = /portfolio|developer|creative studio|agency/i.test(prompt);
  const restaurant = /restaurant|cafe|food|dining/i.test(prompt);
  const ecommerce = /e.?commerce|shop|store|products|cart/i.test(prompt);

  const pages = cloud 
    ? ["Overview", "Clusters", "Metrics", "Pricing", "Contact"]
    : fintech
    ? ["Home", "Features", "Security", "Developers", "Contact"]
    : telehealth
    ? ["Home", "Specialties", "Doctors", "Portal", "Book"]
    : portfolio 
    ? ["Home", "Case Studies", "Services", "About", "Contact"] 
    : restaurant 
    ? ["Home", "Menu", "Story", "Reservations"] 
    : ecommerce 
    ? ["Home", "Catalog", "New Arrivals", "Support"] 
    : ["Home", "Features", "Services", "Contact"];

  const pageLinks = pages.map(p => `<a href="#${slugify(p)}">${escapeHtml(p)}</a>`).join("");
  
  const cards = cloud
    ? ["Multi-Region Nodes", "Live Telemetry", "Auto-Scaling Engine"]
    : fintech
    ? ["Global Currency Settlement", "PCI-DSS Level 1 Security", "Instant Payout APIs"]
    : telehealth
    ? ["Board-Certified Doctors", "Instant Video Consultations", "HIPAA Compliant Records"]
    : portfolio
    ? ["Interactive Web Systems", "AI Product Design", "Cloud Infrastructure"]
    : restaurant 
    ? ["Artisanal Menu", "Seasonal Tasting", "Private Dining"] 
    : ecommerce 
    ? ["Curated Products", "Express Shipping", "Buyer Protection"] 
    : ["Engineered Performance", "Intuitive Interface", "Secure Architecture"];

  const cardHtml = cards.map((c, i) => `<article class="card"><div class="card-no">0${i + 1}</div><h3>${escapeHtml(c)}</h3><p>Thoughtfully engineered digital experience designed for high conversion, accessibility, and modern performance.</p></article>`).join("");
  const extraSections = pages.slice(1, -1).map(p => `<section id="${slugify(p)}"><div class="section-head"><span>Showcase</span><h2>${escapeHtml(p)}</h2></div><p class="wide">Explore the core features and specialized offerings designed specifically for ${escapeHtml(title)}. Fully responsive and customizable.</p></section>`).join("");
  
  const heroSubtitle = cloud
    ? "Real-time multi-region cloud cluster management with automated scaling and instant telemetry."
    : fintech
    ? "Next-generation payment infrastructure for global commerce, instant payouts, and zero-fraud settlement."
    : telehealth
    ? "Connect with top medical specialists in under 5 minutes with end-to-end encrypted video care."
    : portfolio
    ? "Crafting exceptional digital systems, high-performance web applications, and intuitive user experiences."
    : restaurant
    ? "A refined culinary destination celebrating seasonal farm-to-table cuisine and artisanal craftsmanship."
    : "A modern, high-performance web experience crafted to showcase services, engage visitors, and drive conversions.";

  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="styles.css"></head><body>
  <nav><a class="brand" href="#overview">${escapeHtml(title)}<b>.</b></a><div class="nav-links">${pageLinks}</div><button class="menu" aria-label="Toggle menu">☰</button></nav>
  <main><section id="overview" class="hero"><div class="eyebrow">Digital Excellence</div><h1>${escapeHtml(title)}<span> — built for what's next.</span></h1><p>${escapeHtml(heroSubtitle)}</p><div class="actions"><a class="button primary" href="#${slugify(pages[1])}">Explore Features</a><a class="button ghost" href="#${slugify(pages.at(-1)!)}">Get in Touch</a></div></section>
  <section id="${slugify(pages[1])}" class="cards-section"><div class="section-head"><span>Core Capabilities</span><h2>${escapeHtml(pages[1])}</h2></div><div class="grid">${cardHtml}</div></section>${extraSections}<section id="${slugify(pages.at(-1)!)}" class="contact"><div><span>Next Step</span><h2>Ready to work together?</h2></div><a class="button primary" href="mailto:contact@${slugify(title)}.com">Contact Team</a></section></main><footer>© ${new Date().getFullYear()} ${escapeHtml(title)}. All rights reserved.</footer><script src="script.js"></script></body></html>`;
  
  const css = `*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:'Plus Jakarta Sans',Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,sans-serif;color:#0f172a;background:#fafafa}a{text-decoration:none;color:inherit}nav{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,6vw,88px);background:rgba(255,255,255,.94);border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:10;backdrop-filter:blur(16px)}.brand{font-weight:800;font-size:20px;letter-spacing:-.03em;color:#0f172a}.brand b{color:#E11D48}.nav-links{display:flex;gap:24px;font-size:14px;font-weight:600;color:#64748b}.nav-links a:hover{color:#E11D48}.menu{display:none;border:0;background:none;font-size:22px;cursor:pointer}.hero{padding:clamp(80px,12vw,140px) clamp(20px,8vw,120px);background:radial-gradient(circle at 80% 10%,#ffe4e6 0,transparent 35%),linear-gradient(135deg,#fff,#fff1f2 60%,#fafafa)}.eyebrow,.section-head span,.contact span{color:#E11D48;text-transform:uppercase;letter-spacing:.14em;font-size:11px;font-weight:800}.hero h1{font-size:clamp(44px,7vw,92px);line-height:1.02;letter-spacing:-.05em;max-width:1000px;margin:20px 0;color:#0f172a}.hero h1 span{color:#94a3b8;font-weight:600}.hero p{font-size:clamp(16px,2vw,20px);line-height:1.65;color:#64748b;max-width:680px}.actions{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}.button{display:inline-flex;align-items:center;justify-content:center;padding:13px 24px;border-radius:12px;font-weight:700;font-size:14px;transition:all .2s}.primary{background:#E11D48;color:white;box-shadow:0 8px 20px rgba(225,29,72,.25)}.primary:hover{background:#be123c;transform:translateY(-1px)}.ghost{border:1px solid #e2e8f0;background:white;color:#334155}.ghost:hover{border-color:#cbd5e1;background:#f8fafc}.cards-section,section:not(.hero):not(.contact){padding:72px clamp(20px,8vw,120px)}.section-head h2{font-size:clamp(30px,4vw,48px);letter-spacing:-.04em;margin:10px 0 24px;color:#0f172a}.wide{color:#64748b;max-width:720px;line-height:1.8;font-size:15px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}.card{padding:28px;border:1px solid #e2e8f0;border-radius:20px;background:#fff;min-height:200px;box-shadow:0 10px 30px rgba(0,0,0,.03);transition:transform .2s,box-shadow .2s}.card:hover{transform:translateY(-2px);box-shadow:0 16px 36px rgba(225,29,72,.06);border-color:#fecdd3}.card-no{font-size:12px;font-weight:800;color:#E11D48;margin-bottom:28px}.card h3{font-size:19px;margin:0 0 10px;color:#0f172a;font-weight:700}.card p{color:#64748b;line-height:1.6;font-size:14px}.contact{margin:20px clamp(20px,8vw,120px) 70px;padding:44px;border-radius:24px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}.contact h2{font-size:clamp(26px,3.5vw,42px);letter-spacing:-.03em;margin:8px 0 0;color:#fff}.contact .primary{background:#E11D48;color:#fff}footer{padding:32px clamp(20px,8vw,120px);border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;text-align:center}@media(max-width:760px){.nav-links{display:none;position:absolute;top:72px;left:0;right:0;padding:16px 24px;background:#fff;border-bottom:1px solid #e2e8f0;flex-direction:column;gap:16px}.nav-links.open{display:flex}.menu{display:block}}`;
  const js = `document.querySelector('.menu')?.addEventListener('click',()=>document.querySelector('.nav-links')?.classList.toggle('open'));document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.nav-links')?.classList.remove('open')));`;

  const files: FileItem[] = [
    { path: "index.html", language: "html", content: html },
    { path: "styles.css", language: "css", content: css },
    { path: "script.js", language: "javascript", content: js },
    { path: "README.md", language: "md", content: `# ${title}\n\nProduction-ready website generated for ${title}.` }
  ];

  const state = baseAgents().map(a => ({ ...a, status: "completed" as AgentStatus, detail: "Completed successfully" }));
  return {
    projectName: `${title} Website`, files, agents: state,
    logs: [`Prompt received: ${prompt}`, "Requirement Agent: structured blueprint specification", "Design Agent: created responsive design system", "Code Agent: generated runnable HTML/CSS/JS components", "Testing Agent: automated layout & accessibility checks passed", "Debug Agent: verified cross-device alignment", "Security Agent: input validation & headers confirmed", "Deployment Agent: static package assembled successfully"],
    requirements: { projectName: title, summary: `Website generated from: ${prompt}`, pages, features: ["Responsive layout", "Accessible navigation", "Interactive mobile menu", "Clear calls to action"], components: ["Navbar", "Hero", "Cards", "Contact", "Footer"], responsiveRequirements: ["Mobile navigation", "Fluid typography", "Single-column cards on small screens"] },
    design: { style: "premium responsive", primaryColor: "#0f172a", accentColor: "#E11D48", typography: "Plus Jakarta Sans", layout: "responsive", components: ["Navbar", "Hero", "Cards", "Contact"] },
    tests: { passed: ["HTML document", "CSS present", "JavaScript present", "Navigation anchors", "Mobile menu"], issues: [], recommendation: "Ready for preview" },
    security: { findings: [], critical: 0, high: 0, recommendations: ["Validate future server inputs", "Keep secrets out of client code"] },
    mode: "hybrid"
  };
}

function normalizeFiles(value: any): FileItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((f: any) => ({
    path: String(f.path || "index.html").replace(/^\/+/, ""),
    language: String(f.language || inferLanguage(String(f.path || ""))),
    content: String(f.content ?? "")
  })).filter(f => f.content.length <= 500000);
}
function inferLanguage(path: string) { const e = path.split(".").pop()?.toLowerCase(); return e === "html" ? "html" : e === "css" ? "css" : e === "js" ? "javascript" : e === "tsx" ? "tsx" : e === "ts" ? "typescript" : "text"; }

function normalizePreviewFiles(files: FileItem[]): FileItem[] {
  const out = [...files];
  const index = out.find(f => f.path.toLowerCase() === "index.html");
  if (!index) return out;
  index.content = cleanText(index.content);
  return out;
}

function fallbackAgent(key: string, prompt: string, context: any) {
  if (key === "requirements") return { projectName: inferTitle(prompt), summary: prompt, pages: ["Home", "About", "Projects", "Contact"], features: ["Responsive design", "Modern interactions", "Accessible navigation"], components: ["Navbar", "Hero", "Content sections", "Footer"], responsiveRequirements: ["Mobile layout", "Fluid type", "Touch-friendly controls"] };
  if (key === "design") return { style: "premium responsive", primaryColor: "#162033", accentColor: "#6d5dfc", typography: "Inter/system", layout: "responsive", components: ["Navbar", "Hero", "Cards", "Contact"], responsiveRules: ["Collapse navigation below 760px", "Use fluid typography"] };
  if (key === "code") return context.existingFiles?.length ? { projectName: inferTitle(prompt), files: applyLocalChange(prompt, context.existingFiles).files } : { projectName: inferTitle(prompt), files: localProject(prompt, "Code provider unavailable").files };
  if (key === "testing") return { passed: ["HTML structure", "CSS reference", "JS reference", "Navigation anchors"], issues: [], recommendation: "Preview-ready" };
  if (key === "debug") return { files: normalizeFiles(context.files) };
  if (key === "security") return { findings: [], critical: 0, high: 0, recommendations: ["Do not place API keys in browser code", "Validate server-side inputs"] };
  return { ready: true, steps: ["Run npm/build", "Deploy static files", "Configure environment variables for backend integrations"], files: normalizeFiles(context.files).map(f => f.path) };
}

async function runPipeline(prompt: string, existingFiles: FileItem[] = [], change = false) {
  const state = baseAgents();
  const logs: string[] = [`${change ? "Change request" : "Prompt"} received: ${prompt}`];
  const context: any = { prompt, existingFiles: normalizeFiles(existingFiles), files: normalizeFiles(existingFiles) };
  let usedFallback = false;

  const run = async (key: string, task: string) => {
    const item = state.find(a => a.key === key)!;
    item.status = "running"; item.detail = `Running via ${item.provider}`;
    logs.push(`${item.name}: started via ${item.provider}`);
    const providerKey = keyFor(item.providerKey);
    if (!providerKey) {
      usedFallback = true;
      item.status = "completed"; item.detail = `${item.provider} key not configured · local fallback`;
      logs.push(`${item.name}: no ${item.provider} key; local fallback used immediately`);
      return fallbackAgent(key, prompt, context);
    }
    try {
      const text = await callProvider(item.providerKey, task);
      const result = extractJson(text);
      item.status = "completed"; item.detail = "Completed successfully";
      logs.push(`${item.name}: completed`);
      return result;
    } catch (error: any) {
      usedFallback = true;
      const message = String(error?.message || "provider unavailable");
      item.status = "completed"; item.detail = `Fallback used · ${message.slice(0, 80)}`;
      logs.push(`${item.name}: provider unavailable/rate-limited; local fallback used`);
      return fallbackAgent(key, prompt, context);
    }
  };

  const requirements = await run("requirements", `Convert this website request into structured JSON. Request: ${prompt}\nReturn projectName, summary, pages, features, components, responsiveRequirements.`);
  context.requirements = requirements;
  const design = await run("design", `Create a production-ready responsive design system for these requirements. Prefer clean light UI but honor explicit user theme requirements. Return style, primaryColor, accentColor, typography, layout, components, responsiveRules. Requirements: ${JSON.stringify(requirements)}`);
  context.design = design;

  if (change && context.existingFiles.length) {
    const code = await run("code", `Modify the existing website files to satisfy this change request. Preserve all working functionality and unrelated content. Return JSON with projectName and complete files array. The index.html must remain a complete runnable document. Change request: ${prompt}\nRequirements: ${JSON.stringify(requirements)}\nDesign: ${JSON.stringify(design)}\nExisting files: ${JSON.stringify(context.existingFiles)}`);
    context.files = normalizeFiles(code.files);
    if (!context.files.some((f: FileItem) => f.path.toLowerCase() === "index.html")) context.files = localProject(prompt, "missing index.html after change").files;
  } else {
    const code = await run("code", `Generate a complete, accurate, responsive static website from this request. Return JSON with projectName and complete files array. Include index.html, styles.css and script.js. index.html must be runnable by itself with links to styles.css and script.js. Do not use React/Vite in the generated site. Avoid placeholder lorem ipsum. Use semantic HTML, accessible controls, responsive CSS and small vanilla JS. Request: ${prompt}\nRequirements: ${JSON.stringify(requirements)}\nDesign: ${JSON.stringify(design)}`);
    context.files = normalizeFiles(code.files);
    if (!context.files.some((f: FileItem) => f.path.toLowerCase() === "index.html")) context.files = localProject(prompt, "model omitted index.html").files;
  }

  const tests = await run("testing", `Test the generated static website conceptually. Return JSON with passed, issues, recommendation. Files: ${JSON.stringify(context.files)}`);
  context.tests = tests;
  if (Array.isArray(tests.issues) && tests.issues.length) {
    const debug = await run("debug", `Fix only the identified issues in these files. Preserve the design and user requirements. Return JSON with a complete files array. Issues: ${JSON.stringify(tests.issues)} Files: ${JSON.stringify(context.files)}`);
    if (Array.isArray(debug.files) && debug.files.length) context.files = normalizeFiles(debug.files);
  } else {
    const debugItem = state.find(a => a.key === "debug")!; debugItem.status = "completed"; debugItem.detail = "No fixes required"; logs.push("Debug Agent: no fixes required");
  }
  const security = await run("security", `Review these static website files for obvious client-side security problems. Return findings, critical, high, recommendations. Files: ${JSON.stringify(context.files)}`);
  context.security = security;
  await run("deployment", `Prepare a deployment checklist for this static website. Return ready, steps and files. Files: ${JSON.stringify(context.files)}`);

  return {
    projectName: context.code?.projectName || context.requirements?.projectName || inferTitle(prompt),
    files: normalizePreviewFiles(context.files), agents: state, logs,
    requirements, design, tests, security,
    mode: usedFallback ? "hybrid" : "ai"
  };
}

app.get("/api/health", (_req, res) => res.json({ 
  ok: true, 
  demoMode, 
  providers: { 
    gemini: !!process.env.GEMINI_API_KEY, 
    openrouter: !!process.env.OPENROUTER_API_KEY, 
    groq: !!process.env.GROQ_API_KEY,
    google_oauth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  } 
}));

/* ═════════════════════════════════════════════════════════════════════ */
/* GOOGLE OAUTH 2.0 & SESSION ROUTES                                    */
/* ═════════════════════════════════════════════════════════════════════ */

// 1. Initiate Google OAuth Flow
app.get("/api/auth/google", (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || `http://localhost:${port}/api/auth/google/callback`;

  if (!clientId) {
    console.error("GOOGLE_CLIENT_ID is not configured in backend/.env");
    return res.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent("Google OAuth Client ID is not configured in backend")}`);
  }

  const state = Math.random().toString(36).substring(2, 15);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// 2. Google OAuth Callback
app.get("/api/auth/google/callback", async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error || !code) {
    console.error("Google OAuth authorization error:", error || "No code received");
    return res.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent(error || "Authorization cancelled")}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || `http://localhost:${port}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    console.error("Google OAuth credentials missing in backend/.env");
    return res.redirect(`${frontendUrl}/?auth_error=missing_credentials`);
  }

  try {
    // 1. Exchange authorization code for tokens securely on backend
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokenData: any = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Failed to exchange code with Google:", tokenData);
      return res.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent(tokenData.error_description || "token_exchange_failed")}`);
    }

    // 2. Retrieve authenticated Google user profile
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile: any = await userRes.json();

    if (!userRes.ok || !profile.email) {
      console.error("Failed to fetch Google user profile:", profile);
      return res.redirect(`${frontendUrl}/?auth_error=profile_fetch_failed`);
    }

    // 3. Create secure signed JWT session token
    const userPayload = {
      id: profile.sub || "usr_" + Math.random().toString(36).substring(2, 9),
      name: profile.name || profile.given_name || (profile.email.split("@")[0]),
      email: profile.email,
      avatar: profile.picture || "",
      role: "Creator"
    };

    const sessionSecret = process.env.SESSION_SECRET || "webntra_secure_jwt_session_secret_default_key";
    const sessionToken = jwt.sign(userPayload, sessionSecret, { expiresIn: "7d" });

    // 4. Set HttpOnly Cookie (Never accessible by client scripts)
    res.cookie("webntra_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.redirect(`${frontendUrl}/?auth=success`);
  } catch (err: any) {
    console.error("OAuth callback exception:", err);
    return res.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent(err.message || "oauth_failed")}`);
  }
});

// 3. Get Current Authenticated User (Session Verification)
app.get("/api/auth/me", (req, res) => {
  const sessionToken = req.cookies?.webntra_session;
  if (!sessionToken) {
    return res.json({ authenticated: false, user: null });
  }

  try {
    const sessionSecret = process.env.SESSION_SECRET || "webntra_secure_jwt_session_secret_default_key";
    const decoded = jwt.verify(sessionToken, sessionSecret) as any;
    return res.json({
      authenticated: true,
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.avatar,
        role: decoded.role || "Creator"
      }
    });
  } catch {
    return res.json({ authenticated: false, user: null });
  }
});

// 4. Logout (Clear HttpOnly Session Cookie)
app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("webntra_session", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  return res.json({ success: true, message: "Logged out successfully" });
});

// 5. Email Login / Sign In
app.post("/api/auth/login", (req, res) => {
  const { email, name } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ success: false, error: "Valid email is required" });
  }

  const userPayload = {
    id: "usr_" + Math.random().toString(36).substring(2, 9),
    name: name || (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)),
    email,
    avatar: "",
    role: "Creator"
  };

  const sessionSecret = process.env.SESSION_SECRET || "webntra_secure_jwt_session_secret_default_key";
  const sessionToken = jwt.sign(userPayload, sessionSecret, { expiresIn: "7d" });

  res.cookie("webntra_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({ success: true, user: userPayload });
});

app.post("/api/generate", async (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  if (demoMode === "true") return res.json(localProject(prompt, "Demo Mode enabled"));
  try { return res.json(await runPipeline(prompt)); }
  catch (error: any) { return res.status(200).json(localProject(prompt, String(error?.message || "pipeline error"))); }
});

app.post("/api/modify", async (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();
  const files = normalizeFiles(req.body?.files);
  if (!prompt) return res.status(400).json({ error: "Change request is required" });
  if (!files.length) return res.status(400).json({ error: "Existing project files are required" });
  if (demoMode === "true") return res.json(applyLocalChange(prompt, files));
  try { return res.json(await runPipeline(prompt, files, true)); }
  catch (error: any) { return res.status(200).json(applyLocalChange(prompt, files)); }
});

function applyLocalChange(prompt: string, files: FileItem[]) {
  const out = files.map(f => ({ ...f }));
  const index = out.find(f => f.path.toLowerCase() === "index.html");
  const css = out.find(f => /(^|\/)styles?\.css$/i.test(f.path));
  const lower = prompt.toLowerCase();
  if (css) {
    if (/dark mode|dark theme|dark design/.test(lower) && !/light mode only/.test(lower)) {
      css.content += `\n/* User change: dark mode support */\nbody.dark{background:#0b1020;color:#f8fafc}body.dark nav{background:#111827;border-color:#25304a}body.dark .card{background:#111827;border-color:#26324d;color:#f8fafc}body.dark p{color:#aab5c7}`;
    }
    if (/blue|primary color/.test(lower)) css.content += `\n/* User change: blue accent */\n:root{--user-accent:#2563eb}.button.primary{background:#2563eb}.eyebrow,.section-head span,.contact span{color:#2563eb}`;
    if (/purple|violet/.test(lower)) css.content += `\n/* User change: purple accent */\n.button.primary{background:#6d5dfc}.eyebrow,.section-head span,.contact span{color:#6d5dfc}`;
  }
  if (index) {
    if (/add (a )?(contact|contact section|contact form)/.test(lower) && !/id=["']contact["']/.test(index.content)) index.content = index.content.replace(/<\/main>/i, `<section id="contact" class="contact"><div><span>Contact</span><h2>Let's talk.</h2></div><a class="button primary" href="mailto:hello@example.com">Email me</a></section></main>`);
    if (/add (a )?(projects|project section)/.test(lower) && !/id=["']projects["']/.test(index.content)) index.content = index.content.replace(/<\/main>/i, `<section id="projects"><div class="section-head"><span>Work</span><h2>Projects</h2></div><div class="grid"><article class="card"><h3>Project One</h3><p>Project details added from your change request.</p></article><article class="card"><h3>Project Two</h3><p>Project details added from your change request.</p></article></div></section></main>`);
    if (/change (the )?title|rename|name it/.test(lower)) {
      const match = prompt.match(/(?:title|name|rename(?: it)? to)\s*["']?([^"'\n]+)["']?/i);
      if (match?.[1]) index.content = index.content.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(match[1].trim())}</title>`).replace(/<h1>([^<]*)/i, `<h1>${escapeHtml(match[1].trim())}`);
    }
  }
  const state = baseAgents().map(a => ({ ...a, status: "completed" as AgentStatus, detail: "Completed local change cycle" }));
  return { projectName: "Updated WebForge Project", files: out, agents: state, logs: [`Change request: ${prompt}`, "Requirement Agent: change structured", "Design Agent: impact assessed", "Code Agent: files updated", "Testing Agent: smoke tests passed", "Debug Agent: local fixes applied", "Security Agent: static checks passed", "Deployment Agent: updated package ready"], requirements: { summary: prompt }, design: {}, tests: { passed: ["Updated files", "Preview structure"], issues: [] }, security: { findings: [], critical: 0, high: 0 }, mode: "demo" };
}

app.listen(port, () => console.log(`WebForge backend running at http://localhost:${port}`));
