export type AgentStatus = "pending" | "running" | "completed" | "failed";

export type CollaboratorRole = "Editor" | "Viewer";
export type CollaboratorStatus = "active" | "pending";

export interface Collaborator {
  id: string;
  email: string;
  name: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  invitedAt: string;
  avatarColor: string;
}

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
    targetAudience?: string;
    pages?: string[];
    features?: string[];
    techStack?: string[];
    components?: string[];
    responsiveRequirements?: string[];
  };
  design?: {
    style?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    typography?: string;
    layout?: string;
    components?: string[];
    responsiveRules?: string[];
  };
  tests?: {
    passed?: (string | { test: string; result: string; detail: string })[];
    totalPassed?: number;
    issues?: string[];
    recommendation?: string;
  };
  debug?: {
    layoutOptimizations?: string[];
    crossBrowserFixes?: string[];
    resolvedIssues?: string[];
  };
  security?: {
    score?: number;
    rating?: string;
    passedChecks?: string[];
    findings?: string[];
    critical?: number;
    high?: number;
    recommendations?: string[];
  };
  deployment?: {
    totalFiles?: number;
    totalLines?: number;
    bundleSize?: string;
    runtime?: string;
    targets?: string[];
    entryPoints?: {
      frontend?: string;
      backend?: string;
    };
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
  debug?: GenerationResponse["debug"];
  security?: GenerationResponse["security"];
  deployment?: GenerationResponse["deployment"];
  collaborators?: Collaborator[];
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
