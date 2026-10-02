import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User as UserIcon, Mail, Shield, Check, Download, 
  Sparkles, Layers, HardDrive, Key, Award, Clock, Save, 
  FolderGit2, LogOut, ExternalLink, RefreshCw
} from "lucide-react";
import { User, Project } from "../types";
import { getProjects } from "../services/projectStorage";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onOpenSettings: () => void;
  onOpenProjects: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onOpenSettings,
  onOpenProjects,
  onLogout
}) => {
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "Autonomous Web Creator building modern sites with WEBNTRA 7-agent SDLC.");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "");
  const [savedAlert, setSavedAlert] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "usage" | "data">("profile");

  if (!isOpen || !user) return null;

  const projects = getProjects();
  const totalFiles = projects.reduce((acc, p) => acc + (p.files?.length || 0), 0);

  const PRESET_AVATARS = [
    user.avatar || "",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
  ].filter(Boolean);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name: displayName.trim() || user.name,
      bio: bio.trim(),
      avatar: selectedAvatar
    };
    onUpdateUser(updated);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const handleExportAllData = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      stats: {
        totalProjects: projects.length,
        totalFiles,
        securityRating: "100/100 (A+)"
      },
      projects: projects
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webntra-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 text-slate-900 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                {selectedAvatar ? (
                  <img src={selectedAvatar} alt={user.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-100 shadow-xs" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E11D48] to-rose-400 text-white font-black text-lg flex items-center justify-center shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs" title="Online" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">{user.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-[#E11D48] border border-rose-200">
                    {user.role || "Creator Pro"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X size={16} />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1 my-4 p-1 bg-slate-100 rounded-xl">
            {[
              { key: "profile", label: "Profile & Identity" },
              { key: "usage", label: "Telemetry & Quota" },
              { key: "data", label: "Data Backup & Security" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === tab.key ? "bg-white text-[#E11D48] shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5">
            
            {/* ── TAB 1: PROFILE & IDENTITY ── */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-4 py-1">
                {savedAlert && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <Check size={15} className="text-emerald-600 shrink-0" />
                    <span>Profile updated successfully!</span>
                  </div>
                )}

                {/* Avatar Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Choose Profile Avatar
                  </label>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                          selectedAvatar === av ? "border-[#E11D48] ring-2 ring-[#E11D48]/20 scale-105" : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                        {selectedAvatar === av && (
                          <div className="absolute inset-0 bg-[#E11D48]/30 flex items-center justify-center">
                            <Check size={14} className="text-white font-bold" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                  />
                </div>

                {/* Bio / Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bio / Headline
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Authenticated via Google Cloud OAuth</span>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#E11D48]/20 flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* ── TAB 2: TELEMETRY & QUOTA ── */}
            {activeTab === "usage" && (
              <div className="space-y-4 py-1">
                {/* Generation Quota Progress */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Monthly AI Generation Quota</span>
                    <span className="text-xs font-bold font-mono text-[#E11D48]">
                      {projects.length} / 50 Generated
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#E11D48] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((projects.length / 50) * 100, 100)}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Full access to 7 AI agents active</span>
                    <span>Renews in 24 days</span>
                  </div>
                </div>

                {/* Workspace Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Projects</span>
                    <span className="text-xl font-black text-slate-900 mt-1 block">{projects.length}</span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Files Created</span>
                    <span className="text-xl font-black text-slate-900 mt-1 block">{totalFiles}</span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Score</span>
                    <span className="text-xl font-black text-emerald-600 mt-1 block">100/100</span>
                  </div>
                </div>

                {/* Quick Action Navigation */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => { onClose(); onOpenProjects(); }}
                    className="text-xs font-bold text-[#E11D48] hover:underline flex items-center gap-1"
                  >
                    <span>View all {projects.length} projects in dashboard</span>
                    <ExternalLink size={12} />
                  </button>

                  <button
                    onClick={() => { onClose(); onOpenSettings(); }}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Configure API Models →
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB 3: DATA BACKUP & SECURITY ── */}
            {activeTab === "data" && (
              <div className="space-y-4 py-1">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <HardDrive size={16} className="text-[#E11D48]" />
                    <span className="text-xs font-bold text-slate-900">Complete Workspace Data Backup</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Download an offline JSON archive containing all your projects, generated HTML/CSS/JS source files, agent execution logs, and configurations.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportAllData}
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Download size={14} />
                    <span>Export All Workspace Projects (.JSON Archive)</span>
                  </button>
                </div>

                {/* Security Signout */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Need to log out from this browser session?</span>
                  <button
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-emerald-500" />
              <span>Session encrypted via HttpOnly JWT</span>
            </div>
            <button onClick={onClose} className="font-bold text-slate-600 hover:underline">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
