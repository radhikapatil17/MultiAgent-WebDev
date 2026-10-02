import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { Studio } from "./components/Studio";
import { ProjectsDashboard } from "./components/ProjectsDashboard";
import { SettingsView } from "./components/SettingsView";
import { AuthModal } from "./components/AuthModal";
import { User, Project } from "./types";
import { fetchCurrentUser, logoutUser } from "./services/api";

export default function App() {
  const [activeView, setActiveView] = useState<"landing" | "projects" | "studio" | "settings">("landing");
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("webntra_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string>("");
  const [studioPrompt, setStudioPrompt] = useState("");
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Check and sync session from backend (HttpOnly Cookie verification) & handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get("auth") === "success";
    const authError = params.get("auth_error");
    const resetCode = params.get("reset_code");

    if (resetCode) {
      setIsAuthOpen(true);
    }

    if (authSuccess || authError) {
      // Clean query string from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (authError) {
      alert(`Google Authentication Error: ${decodeURIComponent(authError)}`);
    }

    // Verify session with backend HttpOnly cookie
    fetchCurrentUser().then((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("webntra_user", JSON.stringify(currentUser));
        if (authSuccess) {
          setActiveView("projects");
        }
      } else {
        // If backend session does not exist, clear user
        setUser(null);
        localStorage.removeItem("webntra_user");
      }
    });
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("webntra_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("webntra_user");
    }
  }, [user]);

  const handleStartWithPrompt = (promptText: string) => {
    setStudioPrompt(promptText);
    setActiveProject(null);
    if (!user) {
      setAuthReason("Please sign in to build this website with WEBNTRA's 7 AI agents.");
      setIsAuthOpen(true);
      return;
    }
    setActiveView("studio");
  };

  const handleLaunchStudio = () => {
    if (!user) {
      setAuthReason("Sign in required to enter WEBNTRA Studio.");
      setIsAuthOpen(true);
      return;
    }
    setActiveProject(null);
    setActiveView("studio");
  };

  const handleOpenAuth = (reason?: string) => {
    setAuthReason(reason || "");
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (newUser: User) => {
    setUser(newUser);
    setIsAuthOpen(false);
    if (studioPrompt) {
      setActiveView("studio");
    } else {
      setActiveView("projects");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Logout error:", err);
    }
    setUser(null);
    localStorage.removeItem("webntra_user");
    setActiveView("landing");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("webntra_user", JSON.stringify(updatedUser));
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setStudioPrompt(project.prompt);
    setActiveView("studio");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#E11D48]/15 selection:text-[#E11D48]">
      {/* Floating Capsule Navbar (Shown on landing, projects, and settings) */}
      {activeView !== "studio" && (
        <Navbar
          user={user}
          onOpenAuth={() => handleOpenAuth()}
          onLaunchStudio={handleLaunchStudio}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          activeView={activeView}
          onSwitchView={(view) => setActiveView(view)}
        />
      )}

      {/* Main View Switching */}
      {activeView === "landing" && (
        <LandingPage
          user={user}
          onStartWithPrompt={handleStartWithPrompt}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {activeView === "projects" && (
        <ProjectsDashboard
          user={user}
          onOpenProject={handleOpenProject}
          onNewProjectPrompt={(prompt) => {
            setStudioPrompt(prompt);
            setActiveProject(null);
            setActiveView("studio");
          }}
          onOpenSettings={() => setActiveView("settings")}
          onBackToLanding={() => setActiveView("landing")}
        />
      )}

      {activeView === "studio" && (
        <Studio
          initialPrompt={studioPrompt}
          project={activeProject}
          onBackToLanding={() => setActiveView("landing")}
          onBackToDashboard={() => setActiveView("projects")}
          user={user}
          onLogout={handleLogout}
          onOpenSettings={() => setActiveView("settings")}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {activeView === "settings" && (
        <SettingsView
          user={user}
          onLogout={handleLogout}
          onBackToDashboard={() => setActiveView("projects")}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        requiredReason={authReason}
      />
    </div>
  );
}
