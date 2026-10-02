export type AgentStatus = "pending" | "running" | "completed" | "failed";

export interface Agent {
  key: string;
  name: string;
  provider: string;
  status: AgentStatus;
  detail: string;
  role: string;
}

export interface FileItem {
  path: string;
  content: string;
  language: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  plan?: string;
  generationsUsed?: number;
  generationsLimit?: number;
  bio?: string;
}

export interface GenerationResponse {
  projectName: string;
  files: FileItem[];
  agents: Agent[];
  logs: string[];
  requirements?: {
    projectName?: string;
    summary?: string;
    pages?: string[];
    features?: string[];
    components?: string[];
    responsiveRequirements?: string[];
  };
  design?: {
    style?: string;
    primaryColor?: string;
    accentColor?: string;
    typography?: string;
    layout?: string;
    components?: string[];
    responsiveRules?: string[];
  };
  tests?: {
    passed?: string[];
    issues?: string[];
    recommendation?: string;
  };
  security?: {
    findings?: string[];
    critical?: number;
    high?: number;
    recommendations?: string[];
  };
  mode?: "ai" | "hybrid" | "demo" | "fallback";
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  files: FileItem[];
  agents: Agent[];
  logs: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
  requirements?: GenerationResponse["requirements"];
  design?: GenerationResponse["design"];
  tests?: GenerationResponse["tests"];
  security?: GenerationResponse["security"];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  attachments?: { name: string; type: string }[];
  appliedChanges?: string[];
}

export interface AppSettings {
  geminiKey: string;
  openrouterKey: string;
  groqKey: string;
  defaultModel: string;
  autoSave: boolean;
  exportFormat: "zip" | "single_html";
}
