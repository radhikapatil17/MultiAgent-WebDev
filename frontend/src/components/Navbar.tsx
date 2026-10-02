import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronDown, Sparkles, LogOut, ArrowRight, Menu, X, 
  FolderGit2, Code2, Settings, User as UserIcon, Check, 
  Download, HardDrive, Shield, Edit3
} from "lucide-react";
import { User, Project } from "../types";
import { getProjects } from "../services/projectStorage";
import { ProfileModal } from "./ProfileModal";
import logoImg from "../assets/logo.jpg";

interface NavbarProps {
  user: User | null;
  onOpenAuth: (reason?: string) => void;
  onLogout: () => void;
  onLaunchStudio?: () => void;
  onUpdateUser?: (updatedUser: User) => void;
  activeView?: "landing" | "projects" | "studio" | "settings";
  onSwitchView?: (view: "landing" | "projects" | "studio" | "settings") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onOpenAuth, 
  onLogout,
  onLaunchStudio,
  onUpdateUser,
  activeView = "landing",
  onSwitchView
}) => {
  const [imgError, setImgError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const projects = getProjects();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicking outside the profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  const scrollToSection = (id: string) => {
    if (activeView !== "landing" && onSwitchView) {
      onSwitchView("landing");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "How It Works", id: "how-it-works" },
    { label: "Pipeline", id: "pipeline" },
    { label: "Templates", id: "blueprints" },
    { label: "Pricing", id: "pricing" },
  ];

  const handleNavigate = (view: "landing" | "projects" | "studio" | "settings") => {
    if (onSwitchView) onSwitchView(view);
    setProfileDropdownOpen(false);
  };

  const handleQuickExportBackup = () => {
    setProfileDropdownOpen(false);
    const backupData = {
      exportDate: new Date().toISOString(),
      user: user,
      projectsCount: projects.length,
      projects: projects
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webntra-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-3"
      }`}>
        {/* Backdrop Blur Background */}
        <div className={`absolute inset-0 transition-all duration-300 ${
          scrolled 
            ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm" 
            : "bg-white/70 backdrop-blur-md"
        }`} />

        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          
          {/* Left: Logo + Brand */}
          <div 
            onClick={() => {
              if (user && onSwitchView) {
                onSwitchView("projects");
              } else if (onSwitchView) {
                onSwitchView("landing");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm shadow-[#E11D48]/15 border border-rose-200/90 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-[#E11D48]/25 transition-all bg-white p-0.5 flex items-center justify-center shrink-0">
              {!imgError ? (
                <img 
                  src={logoImg} 
                  alt="WEBNTRA" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="w-full h-full bg-[#E11D48] text-white flex items-center justify-center font-black text-xs rounded-lg">W</span>
              )}
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-[#E11D48] transition-colors">
              WEBNTRA
            </span>
          </div>

          {/* Center: Nav Links (Landing View Only) */}
          {activeView === "landing" && (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="hover:text-[#E11D48] transition-colors py-1 relative group"
                >
                  <span>{link.label}</span>
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#E11D48] transition-all duration-300 group-hover:w-full rounded-full" />
                </button>
              ))}
            </div>
          )}

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Quick Launch Studio (when on landing or projects) */}
                {activeView !== "studio" && onLaunchStudio && (
                  <button
                    onClick={onLaunchStudio}
                    className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold shadow-md shadow-[#E11D48]/20 hover:bg-[#BE123C] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles size={13} />
                    <span>Open Studio</span>
                  </button>
                )}

                {/* Profile Avatar & Interactive Dropdown Menu */}
                <div ref={profileDropdownRef} className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition select-none group"
                    title="Open profile & workspace menu"
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-slate-200 shrink-0 group-hover:border-[#E11D48]/40 transition" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E11D48] to-rose-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                      {user.name.split(" ")[0]}
                    </span>

                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180 text-slate-700" : ""}`} />
                  </button>

                  {/* Profile Dropdown Popup */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      
                      {/* User Profile Header (Clickable to manage profile) */}
                      <div 
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="p-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-rose-50/30 rounded-xl mb-2 cursor-pointer hover:bg-rose-50/60 transition group"
                        title="Click to edit profile"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#E11D48] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <div className="text-xs font-extrabold text-slate-900 truncate group-hover:text-[#E11D48] transition-colors flex items-center gap-1">
                                <span>{user.name}</span>
                                <Edit3 size={11} className="text-slate-400 group-hover:text-[#E11D48]" />
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
                            </div>
                          </div>
                        </div>

                        {/* Plan & Quota Meter */}
                        <div className="pt-2 border-t border-slate-200/60 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-[#E11D48]">Creator Pro</span>
                            <span className="text-slate-500 font-mono">{projects.length}/50 Projects</span>
                          </div>
                          <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#E11D48] h-full rounded-full" 
                              style={{ width: `${Math.min((projects.length / 50) * 100, 100)}%` }} 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links inside Dropdown */}
                      <div className="space-y-0.5">
                        <button
                          onClick={() => handleNavigate("projects")}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                            activeView === "projects"
                              ? "bg-rose-50 text-[#E11D48]"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <FolderGit2 size={15} className={activeView === "projects" ? "text-[#E11D48]" : "text-slate-500"} />
                            <span>My Projects</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 text-slate-600">
                            {projects.length}
                          </span>
                        </button>

                        <button
                          onClick={() => handleNavigate("studio")}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                            activeView === "studio"
                              ? "bg-rose-50 text-[#E11D48]"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Code2 size={15} className={activeView === "studio" ? "text-[#E11D48]" : "text-slate-500"} />
                            <span>AI Studio Builder</span>
                          </div>
                          {activeView === "studio" && <Check size={13} className="text-[#E11D48]" />}
                        </button>

                        <button
                          onClick={() => handleNavigate("settings")}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                            activeView === "settings"
                              ? "bg-rose-50 text-[#E11D48]"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Settings size={15} className={activeView === "settings" ? "text-[#E11D48]" : "text-slate-500"} />
                            <span>Workspace Settings</span>
                          </div>
                          {activeView === "settings" && <Check size={13} className="text-[#E11D48]" />}
                        </button>

                        {/* Direct Working Action: Export Data Backup */}
                        <button
                          onClick={handleQuickExportBackup}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <HardDrive size={15} className="text-slate-500" />
                            <span>Backup All Projects (.json)</span>
                          </div>
                          <Download size={13} className="text-slate-400" />
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="my-1.5 border-t border-slate-100" />

                      {/* Sign Out Button */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut size={15} className="text-rose-500" />
                        <span>Sign Out</span>
                      </button>

                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth()}
                  className="text-sm font-semibold text-slate-700 hover:text-[#E11D48] px-3 py-1.5 transition hidden sm:inline-block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth("Create your free account to start building.")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold shadow-md shadow-[#E11D48]/20 hover:bg-[#BE123C] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {activeView === "landing" && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Dropdown Menu (Landing Page) */}
        {mobileMenuOpen && activeView === "landing" && (
          <div className="md:hidden relative bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-[#E11D48] hover:bg-rose-50 rounded-xl transition"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Account & Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => {
          if (onUpdateUser) onUpdateUser(updated);
        }}
        onOpenSettings={() => {
          if (onSwitchView) onSwitchView("settings");
        }}
        onOpenProjects={() => {
          if (onSwitchView) onSwitchView("projects");
        }}
        onLogout={onLogout}
      />
    </>
  );
};
