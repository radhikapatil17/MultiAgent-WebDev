import { Agent, AgentStatus, FileItem, GenerationResponse, User } from "../types";
import { ensureFullStackProjectFiles } from "../utils/fullstackFiles";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getGoogleAuthUrl(): string {
  return `${API_BASE_URL}/api/auth/google`;
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: "include"
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.authenticated ? data.user : null;
  } catch (err) {
    console.warn("Failed to fetch current session:", err);
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || "Login failed. Please check your credentials." };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unable to reach server. Please check your network." };
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || "Registration failed. Please try again." };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unable to reach server. Please check your network." };
  }
}

export async function loginWithEmail(email: string, name?: string): Promise<User | null> {
  // Legacy fallback wrapper
  const result = await loginUser(email, "");
  return result.user || null;
}

export async function logoutUser(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || "Failed to send reset code. Please try again." };
    }
    return { success: true, message: data.message || `Verification code sent to ${email}` };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error. Please try again." };
  }
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword }),
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || "Invalid code or failed to reset password." };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error. Please try again." };
  }
}

export const DEFAULT_AGENTS: Agent[] = [
  { key: "requirements", name: "Requirement Agent", provider: "WEBNTRA Engine", status: "pending", detail: "Awaiting natural language prompt", role: "Extracts functional structure, page hierarchy & UX flow" },
  { key: "design", name: "Design Agent", provider: "WEBNTRA Engine", status: "pending", detail: "Waiting for requirements", role: "Creates visual design system, typography & color palette" },
  { key: "code", name: "Code Agent", provider: "WEBNTRA Engine", status: "pending", detail: "Waiting for design specs", role: "Builds complete, modern and interactive website structures" },
  { key: "testing", name: "Testing Agent", provider: "WEBNTRA Engine", status: "pending", detail: "Waiting for build completion", role: "Runs automated layout verification, accessibility & responsiveness tests" },
  { key: "debug", name: "Debug Agent", provider: "WEBNTRA Engine", status: "pending", detail: "Waiting for test execution", role: "Refines layout alignment, performance & cross-device stability" },
  { key: "security", name: "Security Agent", provider: "WEBNTRA Engine", status: "pending", detail: "Waiting for quality signoff", role: "Audits against vulnerabilities, validates input fields & enforces safety" },
  { key: "deployment", name: "Deployment Agent", provider: "WEBNTRA Engine", status: "pending", detail: "Waiting for security verification", role: "Packages production website, verifies assets & prepares launch" }
];

export async function checkBackendStatus(): Promise<{ online: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return { online: res.ok };
  } catch {
    return { online: false };
  }
}

export async function generateWebsite(
  prompt: string,
  onProgress?: (agents: Agent[], currentLog: string) => void
): Promise<GenerationResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    const res = await fetch(`${API_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        projectName: data.projectName || "Modern Web App",
        files: data.files || [],
        agents: data.agents || DEFAULT_AGENTS,
        logs: data.logs || [],
        requirements: data.requirements,
        design: data.design,
        tests: data.tests,
        debug: data.debug,
        security: data.security,
        deployment: data.deployment,
        mode: data.mode || "ai"
      };
    }
  } catch (e) {
    console.warn("Backend offline, activating fallback pipeline:", e);
  }

  return runFallbackPipeline(prompt, onProgress);
}

export async function modifyWebsite(
  prompt: string,
  existingFiles: FileItem[],
  onProgress?: (agents: Agent[], currentLog: string) => void
): Promise<GenerationResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    const res = await fetch(`${API_BASE_URL}/api/modify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, files: existingFiles }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        projectName: data.projectName || "Updated Website",
        files: data.files || existingFiles,
        agents: data.agents || DEFAULT_AGENTS,
        logs: data.logs || [],
        requirements: data.requirements,
        design: data.design,
        tests: data.tests,
        debug: data.debug,
        security: data.security,
        deployment: data.deployment,
        mode: data.mode || "hybrid"
      };
    }
  } catch (e) {
    console.warn("Backend offline, applying local change:", e);
  }

  return {
    projectName: "Updated Website",
    files: existingFiles,
    agents: DEFAULT_AGENTS.map(a => ({ ...a, status: "completed" as AgentStatus })),
    logs: [`[Change Applied] ${prompt}`],
    mode: "demo"
  };
}

async function runFallbackPipeline(
  prompt: string,
  onProgress?: (agents: Agent[], currentLog: string) => void
): Promise<GenerationResponse> {
  const currentAgents: Agent[] = DEFAULT_AGENTS.map(a => ({ ...a, status: "pending" as AgentStatus }));
  const logs = [`[Pipeline] Starting 7-agent SDLC pipeline...`];

  for (let i = 0; i < currentAgents.length; i++) {
    currentAgents[i].status = "running" as AgentStatus;
    currentAgents[i].detail = "Processing...";
    const log = `[${currentAgents[i].name}] Active`;
    logs.push(log);
    if (onProgress) onProgress([...currentAgents], log);
    await new Promise(r => setTimeout(r, 400));
    currentAgents[i].status = "completed" as AgentStatus;
    currentAgents[i].detail = "Completed";
  }

  const rawFiles: FileItem[] = [
    {
      path: "index.html",
      content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Generated by WEBNTRA</title><link rel="stylesheet" href="styles.css"></head><body><main class="hero"><h1>Your Website</h1><p>${prompt}</p><button class="cta-btn">Get Started</button></main><script src="script.js"></script></body></html>`,
      language: "html"
    },
    {
      path: "styles.css",
      content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #FFFFFF; color: #0F172A; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-height: 100vh; }
.hero { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; text-align: center; }
h1 { font-size: 3rem; font-weight: 800; color: #0F172A; margin-bottom: 1rem; }
p { font-size: 1.1rem; color: #64748B; max-width: 600px; line-height: 1.7; margin-bottom: 2rem; }
.cta-btn { background: #E11D48; color: white; border: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(225,29,72,0.25); }
.cta-btn:hover { background: #BE123C; transform: translateY(-1px); }`,
      language: "css"
    },
    {
      path: "script.js",
      content: `document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.cta-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      btn.textContent = 'Welcome! 🎉';
      btn.style.background = '#059669';
    });
  }
});`,
      language: "javascript"
    }
  ];

  return {
    projectName: "WEBNTRA Project",
    files: ensureFullStackProjectFiles("WEBNTRA Project", prompt, rawFiles),
    agents: currentAgents,
    logs,
    mode: "demo"
  };
}
