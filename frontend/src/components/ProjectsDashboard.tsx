import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FolderGit2, Plus, Search, Filter, Sparkles, Download, Copy, Trash2, 
  ArrowRight, Clock, ShieldCheck, CheckCircle2, FileCode, Monitor, 
  Smartphone, Layers, Globe, ExternalLink, MoreVertical, LayoutGrid, List
} from "lucide-react";
import { Project, User } from "../types";
import { getProjects, deleteProject, duplicateProject, createNewProject } from "../services/projectStorage";
import JSZip from "jszip";

interface ProjectsDashboardProps {
  user: User | null;
  onOpenProject: (project: Project) => void;
  onNewProjectPrompt: (prompt: string) => void;
  onOpenSettings: () => void;
  onBackToLanding: () => void;
}

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  user,
  onOpenProject,
  onNewProjectPrompt,
  onOpenSettings,
  onBackToLanding
}) => {
  const [projects, setProjects] = useState<Project[]>(() => getProjects());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const categories = ["All", "Enterprise SaaS", "Financial Tech", "Healthcare", "Agency & Studio", "E-Commerce"];

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
      setProjects(getProjects());
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned = duplicateProject(id);
    if (cloned) {
      setProjects(getProjects());
    }
  };

  const handleDownloadZip = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project.files.length) return;
    const zip = new JSZip();
    project.files.forEach(f => zip.file(f.path, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;
    const p = createNewProject(newPrompt.trim());
    setNewProjectModalOpen(false);
    setNewPrompt("");
    onOpenProject(p);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-20 pb-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Projects
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-[#E11D48] border border-rose-200">
              {projects.length} {projects.length === 1 ? "Project" : "Projects"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage, customize, and deploy your AI-generated web applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNewProjectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#E11D48]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, prompt or tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-[#E11D48] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="hidden sm:flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-white text-[#E11D48] shadow-xs" : "text-slate-400 hover:text-slate-700"}`}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-white text-[#E11D48] shadow-xs" : "text-slate-400 hover:text-slate-700"}`}
            title="List View"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Projects Grid / List */}
      {filteredProjects.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => onOpenProject(project)}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#E11D48]/30 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                {/* Preview Thumbnail Header */}
                <div className="relative h-44 bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex flex-col justify-between overflow-hidden border-b border-slate-100">
                  {/* Subtle Grid Background in Card */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                  {/* Card Category & Timestamp */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white backdrop-blur-md border border-white/20">
                      {project.category || "Web App"}
                    </span>
                    <span className="text-[11px] text-slate-300 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Card Title in Thumbnail */}
                  <div className="relative z-10">
                    <h3 className="text-white font-extrabold text-lg tracking-tight group-hover:text-rose-200 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-1 mt-1 font-mono">
                      {project.prompt}
                    </p>
                  </div>

                  {/* 7-Agent Status Pill Strip */}
                  <div className="relative z-10 flex items-center gap-1">
                    {project.agents.map((ag, i) => (
                      <div
                        key={i}
                        title={`${ag.name}: ${ag.status}`}
                        className={`w-2 h-2 rounded-full ${
                          ag.status === "completed" ? "bg-emerald-400 shadow-xs shadow-emerald-400" : "bg-slate-500"
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-slate-300 ml-1 font-medium">7 Agents Verified</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {project.prompt}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <FileCode size={13} className="text-slate-500" />
                      <span>{project.files.length || 3} Files</span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDownloadZip(project, e)}
                        title="Download ZIP"
                        className="p-1.5 text-slate-400 hover:text-[#E11D48] hover:bg-rose-50 rounded-lg transition"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDuplicate(project.id, e)}
                        title="Duplicate Project"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        title="Delete Project"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => onOpenProject(project)}
                        className="ml-1 inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 group-hover:bg-[#E11D48] text-slate-700 group-hover:text-white rounded-xl text-xs font-bold transition duration-200"
                      >
                        <span>Open</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onOpenProject(project)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {project.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#E11D48] transition-colors">
                          {project.name}
                        </h3>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {project.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-xl">
                        {project.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <span className="text-xs text-slate-400">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDownloadZip(project, e)}
                        className="p-1.5 text-slate-400 hover:text-[#E11D48] rounded-lg transition"
                        title="Download ZIP"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        onClick={(e) => handleDuplicate(project.id, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
                        title="Duplicate"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                      <button
                        onClick={() => onOpenProject(project)}
                        className="ml-2 px-3.5 py-1.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
                      >
                        <span>Open Studio</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-sm">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-[#E11D48] mx-auto mb-4 border border-rose-100">
            <FolderGit2 size={28} />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">No projects found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {searchQuery ? "No projects match your search criteria." : "Create your first AI-generated website with our 7-agent pipeline."}
          </p>
          <button
            onClick={() => setNewProjectModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#E11D48]/20"
          >
            <Plus size={14} />
            <span>Create New Website</span>
          </button>
        </div>
      )}

      {/* Create New Project Modal */}
      {newProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-slate-900"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E11D48] flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Create New Project</h3>
                  <p className="text-xs text-slate-500">Describe the website you want to generate</p>
                </div>
              </div>
              <button
                onClick={() => setNewProjectModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Website Prompt
                </label>
                <textarea
                  rows={4}
                  required
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="e.g. Build an AI developer portfolio with dark/light mode toggle, interactive project cards, skills metrics, and contact form..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition resize-none leading-relaxed"
                />
              </div>

              {/* Sample Quick Prompt Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 block">Or try a blueprint:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Enterprise Cloud Management Console",
                    "FinTech Payment Platform with SDKs",
                    "Minimalist Creative Studio Portfolio",
                    "Telehealth Video Booking Portal"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewPrompt(preset)}
                      className="text-[10px] font-semibold px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-[#E11D48] rounded-lg transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition shadow-md shadow-[#E11D48]/20 flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Start 7-Agent SDLC</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
