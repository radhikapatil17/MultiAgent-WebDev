import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Key, Cpu, Shield, Save, CheckCircle2, AlertCircle, RefreshCw, 
  Download, Moon, Sun, Layers, Sparkles, User as UserIcon, LogOut, 
  Lock, Globe, Palette, Bell, Building2, Eye, Sliders, ToggleLeft, ToggleRight,
  ShieldCheck, Trash2, Check, Smartphone, Monitor, CreditCard, ChevronRight,
  ExternalLink, Mail, Phone, MapPin, Hash, Search, ArrowUpRight, Zap,
  FileText, HelpCircle, HardDrive, AlertTriangle, Radio
} from "lucide-react";
import { User } from "../types";
import { checkBackendStatus } from "../services/api";

interface SettingsViewProps {
  user: User | null;
  onLogout: () => void;
  onBackToDashboard: () => void;
  onUpdateUser?: (user: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onLogout,
  onBackToDashboard,
  onUpdateUser
}) => {
  // Navigation tabs for User-first experience
  const [activeTab, setActiveTab] = useState<
    "profile" | "plan" | "branding" | "domains" | "seo" | "notifications" | "security" | "developer"
  >("profile");

  // 1. User Profile State
  const [displayName, setDisplayName] = useState(user?.name || "Radhika Patil");
  const [userEmail, setUserEmail] = useState(user?.email || "radhika.patil@example.com");
  const [userBio, setUserBio] = useState(user?.bio || "Product Designer & Entrepreneur building next-gen web applications.");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // 2. Plan & Billing State
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "agency">(
    (user?.plan?.toLowerCase().includes("pro") ? "pro" : "pro")
  );

  // 3. Brand Kit & Business Identity State (User's custom brand, empty by default)
  const [businessName, setBusinessName] = useState(() => localStorage.getItem("webntra_pref_bizname") || "");
  const [businessTagline, setBusinessTagline] = useState(() => localStorage.getItem("webntra_pref_tagline") || "");
  const [businessIndustry, setBusinessIndustry] = useState(() => localStorage.getItem("webntra_pref_industry") || "SaaS & Technology");
  const [businessEmail, setBusinessEmail] = useState(() => localStorage.getItem("webntra_pref_email") || user?.email || "");
  const [businessPhone, setBusinessPhone] = useState(() => localStorage.getItem("webntra_pref_phone") || "");
  const [businessAddress, setBusinessAddress] = useState(() => localStorage.getItem("webntra_pref_address") || "");
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem("webntra_pref_brandcolor") || "#E11D48");
  const [secondaryColor, setSecondaryColor] = useState(() => localStorage.getItem("webntra_pref_secondarycolor") || "#0F172A");
  const [fontPairing, setFontPairing] = useState(() => localStorage.getItem("webntra_pref_font") || "Modern Sans (Plus Jakarta Sans)");
  const [websiteTone, setWebsiteTone] = useState(() => localStorage.getItem("webntra_pref_tone") || "Modern Minimalist");
  const [twitterHandle, setTwitterHandle] = useState(() => localStorage.getItem("webntra_pref_twitter") || "");
  const [linkedinUrl, setLinkedinUrl] = useState(() => localStorage.getItem("webntra_pref_linkedin") || "");
  const [instagramHandle, setInstagramHandle] = useState(() => localStorage.getItem("webntra_pref_instagram") || "");

  // 4. Custom Domains & Publishing State
  const [subdomain, setSubdomain] = useState(() => localStorage.getItem("webntra_pref_subdomain") || "my-brand");
  const [customDomain, setCustomDomain] = useState(() => localStorage.getItem("webntra_pref_customdomain") || "www.mybrand.com");
  const [forceHttps, setForceHttps] = useState(true);
  const [custom404, setCustom404] = useState(true);

  // 5. SEO & Analytics State
  const [seoTitleSuffix, setSeoTitleSuffix] = useState(() => localStorage.getItem("webntra_pref_seo_suffix") || " | Built with Webntra");
  const [metaDescription, setMetaDescription] = useState(() => localStorage.getItem("webntra_pref_meta_desc") || "Official online destination offering premium services and intelligent digital solutions.");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(() => localStorage.getItem("webntra_pref_ga4") || "G-TRK99201");
  const [searchIndexing, setSearchIndexing] = useState(true);

  // 6. Notifications & Preferences
  const [notifyOnComplete, setNotifyOnComplete] = useState(() => localStorage.getItem("webntra_pref_notify_done") !== "false");
  const [notifyOnLeads, setNotifyOnLeads] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [currency, setCurrency] = useState("USD ($)");
  const [defaultLanguage, setDefaultLanguage] = useState("English (US)");

  // 7. Security & Data
  const [optOutTraining, setOptOutTraining] = useState(() => localStorage.getItem("webntra_pref_optout") !== "false");

  // 8. Developer / Engine Settings
  const [cerebrasKey, setCerebrasKey] = useState(() => localStorage.getItem("webntra_cerebras_key") || "");
  const [openrouterKey, setOpenrouterKey] = useState(() => localStorage.getItem("webntra_openrouter_key") || "");
  const [mistralKey, setMistralKey] = useState(() => localStorage.getItem("webntra_mistral_key") || "");
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem("webntra_groq_key") || "");
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("webntra_gemini_key") || "");
  const [exportFormat, setExportFormat] = useState<"zip" | "single_html">("zip");
  const [testingBackend, setTestingBackend] = useState(false);
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);

  // Success Feedback
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const AVATAR_OPTIONS = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  ];

  const BRAND_COLORS = [
    { name: "Crimson Rose", hex: "#E11D48" },
    { name: "Royal Indigo", hex: "#4F46E5" },
    { name: "Deep Ocean", hex: "#0284C7" },
    { name: "Emerald Growth", hex: "#059669" },
    { name: "Warm Amber", hex: "#D97706" },
    { name: "Midnight Obsidian", hex: "#0F172A" },
  ];

  const INDUSTRIES = [
    "SaaS & Technology",
    "Creative Agency & Portfolio",
    "E-Commerce & Retail",
    "Healthcare & Telehealth",
    "Financial Tech & Crypto",
    "Restaurant & Hospitality",
    "Education & Online Courses",
    "Real Estate & Architecture"
  ];

  const FONT_OPTIONS = [
    { name: "Modern Sans (Plus Jakarta Sans)", desc: "Clean, high-converting geometric aesthetic" },
    { name: "Executive Serif (Playfair Display)", desc: "Luxury, editorial, authoritative typography" },
    { name: "Technical Monospace (JetBrains Mono)", desc: "Developer tools, fintech & Web3 vibes" },
    { name: "Friendly Neo-Grotesque (Inter)", desc: "Ultra-readable global standard interface font" }
  ];

  const WEBSITE_TONES = [
    { title: "Modern Minimalist", desc: "Clean typography, ample whitespace, sleek borders and subtle glows" },
    { title: "High-Tech Dark", desc: "Futuristic dark surfaces, neon accents, and interactive terminal cards" },
    { title: "Corporate Executive", desc: "Balanced trust blues, enterprise metric badges, and conservative layouts" },
    { title: "Creative & Bold", desc: "Vibrant gradient headers, playful card tilts, and lively interactive micro-animations" },
  ];

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setTestingBackend(true);
    const { online } = await checkBackendStatus();
    setBackendStatus(online);
    setTestingBackend(false);
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // 1. Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && onUpdateUser) {
      const updated: User = {
        ...user,
        name: displayName.trim() || user.name,
        email: userEmail.trim() || user.email,
        avatar: selectedAvatar,
        bio: userBio.trim()
      };
      onUpdateUser(updated);
    }
    showToast("Profile information updated successfully!");
  };

  // 2. Save Brand Kit
  const handleSaveBrandKit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("webntra_pref_bizname", businessName.trim());
    localStorage.setItem("webntra_pref_tagline", businessTagline.trim());
    localStorage.setItem("webntra_pref_industry", businessIndustry);
    localStorage.setItem("webntra_pref_email", businessEmail.trim());
    localStorage.setItem("webntra_pref_phone", businessPhone.trim());
    localStorage.setItem("webntra_pref_address", businessAddress.trim());
    localStorage.setItem("webntra_pref_brandcolor", brandColor);
    localStorage.setItem("webntra_pref_secondarycolor", secondaryColor);
    localStorage.setItem("webntra_pref_font", fontPairing);
    localStorage.setItem("webntra_pref_tone", websiteTone);
    localStorage.setItem("webntra_pref_twitter", twitterHandle.trim());
    localStorage.setItem("webntra_pref_linkedin", linkedinUrl.trim());
    localStorage.setItem("webntra_pref_instagram", instagramHandle.trim());
    showToast("Brand kit saved! All generated websites will automatically reflect this identity.");
  };

  // 3. Save Domains & Publishing
  const handleSaveDomains = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("webntra_pref_subdomain", subdomain.trim().toLowerCase());
    localStorage.setItem("webntra_pref_customdomain", customDomain.trim().toLowerCase());
    showToast("Domain preferences and routing settings saved!");
  };

  // 4. Save SEO & Analytics
  const handleSaveSEO = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("webntra_pref_seo_suffix", seoTitleSuffix.trim());
    localStorage.setItem("webntra_pref_meta_desc", metaDescription.trim());
    localStorage.setItem("webntra_pref_ga4", googleAnalyticsId.trim());
    showToast("SEO tags & Google Analytics settings saved!");
  };

  // 5. Save Notifications & Preferences
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("webntra_pref_notify_done", String(notifyOnComplete));
    localStorage.setItem("webntra_pref_currency", currency);
    localStorage.setItem("webntra_pref_lang", defaultLanguage);
    showToast("Notification and localization preferences updated!");
  };

  // 6. Save Developer Keys
  const handleSaveDeveloperKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("webntra_gemini_key", geminiKey.trim());
    localStorage.setItem("webntra_openrouter_key", openrouterKey.trim());
    localStorage.setItem("webntra_groq_key", groqKey.trim());
    showToast("AI provider keys updated successfully!");
  };

  // Download GDPR User Archive
  const handleExportUserData = () => {
    const data = {
      user: {
        id: user?.id || "usr_anonymous",
        name: displayName,
        email: userEmail,
        plan: selectedPlan,
        bio: userBio,
        joined: "October 2026",
      },
      brandKit: {
        businessName,
        tagline: businessTagline,
        industry: businessIndustry,
        brandColor,
        secondaryColor,
        fontPairing,
        contactEmail: businessEmail,
        phone: businessPhone,
        address: businessAddress,
        socials: { twitter: twitterHandle, linkedin: linkedinUrl, instagram: instagramHandle }
      },
      publishing: {
        subdomain: `${subdomain}.webntra.app`,
        customDomain,
        sslStatus: "Active",
        googleAnalyticsId
      },
      projects: JSON.parse(localStorage.getItem("webntra_projects") || "[]"),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webntra-user-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("User account archive downloaded successfully!");
  };

  const handleDownloadInvoice = () => {
    const invoiceText = `================================================
WEBNTRA CLOUD PLATFORM - OFFICIAL RECEIPT
================================================
Invoice Number: WBN-INV-2026-8891
Date: October 01, 2026
Customer: ${displayName} (${userEmail})
Plan: Creator Pro Monthly Subscription ($19.00/mo)
Payment Method: Visa ending in 4242 (Authorized)
Status: PAID IN FULL

Line Items:
1. Unlimited 7-Agent Autonomous Synthesis .... $19.00
2. High-Speed Global CDN Edge Routing ........ INCLUDED
3. Automated TLS 1.3 Let's Encrypt SSL ....... INCLUDED
4. Priority Support & Blueprint Access ....... INCLUDED
------------------------------------------------
Total Charged: $19.00 USD
Thank you for building the future on Webntra!
================================================`;

    const blob = new Blob([invoiceText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webntra-receipt-2026-8891.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Invoice downloaded to your device!");
  };

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear temporary browser cache and reset preview sessions? Your saved projects and account settings will remain intact.")) {
      sessionStorage.clear();
      showToast("Workspace cache cleared successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-20 pb-20 px-4 sm:px-6 lg:px-10 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Account & Workspace Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-[#E11D48] border border-rose-200">
              {selectedPlan === "pro" ? "Creator Pro" : "Free Account"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile, company brand kit, custom domains, billing, and system preferences.
          </p>
        </div>

        <button
          onClick={onBackToDashboard}
          className="self-start sm:self-auto px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
        >
          ← Back to Projects
        </button>
      </div>

      {/* Main Settings Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-4">
        
        {/* Navigation Sidebar */}
        <div className="p-4 bg-slate-50/70 border-r border-slate-200 space-y-1">
          
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            User Settings
          </div>

          {[
            { key: "profile", label: "My Profile & Account", icon: UserIcon },
            { key: "plan", label: "Subscription & Usage", icon: CreditCard },
            { key: "branding", label: "Brand Kit & Business Info", icon: Palette },
            { key: "domains", label: "Domains & Publishing", icon: Globe },
            { key: "seo", label: "SEO & Analytics", icon: Search },
            { key: "notifications", label: "Notifications & Locale", icon: Bell },
            { key: "security", label: "Security & Privacy", icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                activeTab === tab.key
                  ? "bg-[#E11D48] text-white shadow-xs"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-slate-200 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Advanced / Developer
          </div>

          <button
            onClick={() => setActiveTab("developer")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
              activeTab === "developer"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Key size={15} />
              <span>AI Engine & API Keys</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-700">Dev</span>
          </button>

          {/* Quick Sign Out Action */}
          <div className="pt-6 mt-6 border-t border-slate-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
            >
              <LogOut size={14} />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="p-6 sm:p-8 md:col-span-3">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 1. MY PROFILE & ACCOUNT                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Personal Profile & Identity</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your public persona, avatar, and contact details across the Webntra ecosystem.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                  <ShieldCheck size={13} />
                  <span>Google Verified</span>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Profile Photo & Avatar
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedAvatar}
                    alt="Active Avatar"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#E11D48] shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-2">Select from curated avatars or keep your Google profile photo:</p>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAvatar(av)}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition ${
                            selectedAvatar === av ? "border-[#E11D48] scale-105 shadow-xs" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img src={av} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Account Email (Google OAuth)
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  About You & Professional Bio
                </label>
                <textarea
                  rows={3}
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  placeholder="Share a short summary about yourself or your business goals..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition resize-none"
                />
              </div>

              {/* Two-Factor Authentication Toggle */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock size={13} className="text-[#E11D48]" />
                    <span>Two-Factor Authentication (2FA)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Require an authenticator app code during sign in for enhanced protection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(!twoFactorEnabled ? "2FA enabled! Backup codes sent to email." : "2FA disabled.");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    twoFactorEnabled 
                      ? "bg-emerald-600 text-white" 
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {twoFactorEnabled ? "Enabled" : "Enable 2FA"}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#E11D48]/20 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 2. SUBSCRIPTION & USAGE                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "plan" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Subscription & Cloud Quotas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review your active tier, real-time generation limits, and past payment receipts.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-[#E11D48]">
                  CREATOR PRO ACTIVE
                </span>
              </div>

              {/* Usage Progress Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Generations</div>
                  <div className="text-xl font-black text-slate-900 mt-1">18 / 50</div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-[#E11D48] h-full rounded-full" style={{ width: "36%" }} />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">32 generations remaining this month</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Custom Domains</div>
                  <div className="text-xl font-black text-slate-900 mt-1">2 / 5</div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "40%" }} />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">3 custom domains available</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CDN Edge Bandwidth</div>
                  <div className="text-xl font-black text-slate-900 mt-1">14.2 / 50 GB</div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: "28%" }} />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Ultra-low latency global delivery</div>
                </div>
              </div>

              {/* Plan Tier Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Membership Tiers
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "starter", title: "Free Starter", price: "$0", period: "/mo", desc: "5 AI websites/mo, standard speed" },
                    { id: "pro", title: "Creator Pro", price: "$19", period: "/mo", desc: "50 AI websites/mo, all 7 agents, custom domains", popular: true },
                    { id: "agency", title: "Agency Studio", price: "$79", period: "/mo", desc: "Unlimited AI sites, team seats, white-labeling" },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPlan(p.id as any);
                        showToast(`Selected ${p.title}! Plan switch simulated.`);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition relative ${
                        selectedPlan === p.id 
                          ? "border-[#E11D48] bg-rose-50/30 ring-2 ring-[#E11D48] shadow-xs" 
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-2.5 right-3 bg-[#E11D48] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                          Current Plan
                        </span>
                      )}
                      <div className="font-extrabold text-sm text-slate-900">{p.title}</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-slate-900">{p.price}</span>
                        <span className="text-xs text-slate-500">{p.period}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Info & Invoice Download */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Visa ending in 4242</div>
                    <div className="text-[11px] text-slate-500">Renews on November 01, 2026 ($19.00/month)</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadInvoice}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download size={13} />
                    <span>Download Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast("Card update window opened!")}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                  >
                    Update Card
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 3. BRAND KIT & BUSINESS IDENTITY                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "branding" && (
            <form onSubmit={handleSaveBrandKit} className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-slate-900">Brand Kit & Business Identity</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure your company brand colors, contact info, typography, and social links. The 7 AI agents automatically embed these details into every website you generate!
                </p>
              </div>

              {/* Company Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Studio, Nexus Health"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={businessTagline}
                    onChange={(e) => setBusinessTagline(e.target.value)}
                    placeholder="e.g. Next-generation intelligent cloud solutions"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                  />
                </div>
              </div>

              {/* Industry / Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Industry / Niche
                </label>
                <select
                  value={businessIndustry}
                  onChange={(e) => setBusinessIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Brand Accent Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Brand Accent Color
                </label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {BRAND_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setBrandColor(c.hex)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                        brandColor === c.hex
                          ? "border-slate-900 bg-slate-50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                      {brandColor === c.hex && <Check size={12} className="text-slate-900" />}
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 pl-2">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      title="Custom hex color"
                    />
                    <span className="text-xs font-mono font-bold text-slate-600 uppercase">{brandColor}</span>
                  </div>
                </div>
              </div>

              {/* Preferred Typography Pairing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Default Typography Pairing
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FONT_OPTIONS.map((f) => (
                    <div
                      key={f.name}
                      onClick={() => setFontPairing(f.name)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        fontPairing === f.name
                          ? "border-[#E11D48] bg-rose-50/40 shadow-xs ring-1 ring-[#E11D48]"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{f.name}</span>
                        {fontPairing === f.name && <Check size={13} className="text-[#E11D48]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferred Aesthetic Tone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Default Aesthetic & Tone
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WEBSITE_TONES.map((t) => (
                    <div
                      key={t.title}
                      onClick={() => setWebsiteTone(t.title)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        websiteTone === t.title
                          ? "border-[#E11D48] bg-rose-50/40 shadow-xs ring-1 ring-[#E11D48]"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{t.title}</span>
                        {websiteTone === t.title && <Check size={13} className="text-[#E11D48]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Contact & Footer Details */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Contact & Footer Info (Auto-filled on Generated Pages)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Public Support Email</label>
                    <input
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder="hello@company.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Office / Studio Address</label>
                    <input
                      type="text"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="City, Country"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Handles */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Social Handles (Embedded in Nav & Footer)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Twitter / X Handle</label>
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="@company"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="company-url"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="@company_life"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#E11D48]/20 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Save Brand Kit</span>
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 4. DOMAINS & PUBLISHING                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "domains" && (
            <form onSubmit={handleSaveDomains} className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-slate-900">Custom Domains & Edge Routing</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish websites directly to your own custom domain name or claim your free high-speed `.webntra.app` subdomain.
                </p>
              </div>

              {/* Free Subdomain */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Free Webntra Subdomain
                </label>
                <div className="flex items-center max-w-md">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-cool-site"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-r-0 border-slate-200 rounded-l-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                  />
                  <div className="px-3.5 py-2.5 bg-slate-200 border border-slate-200 rounded-r-xl text-xs font-mono font-bold text-slate-700">
                    .webntra.app
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-600 font-bold">
                  <CheckCircle2 size={13} />
                  <span>https://{subdomain || "my-brand"}.webntra.app is live and SSL protected</span>
                </div>
              </div>

              {/* Custom Domain Configuration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Connect Your Own Custom Domain
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="www.yourcompany.com"
                  className="w-full max-w-md px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                />
                
                {/* DNS Instructions */}
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Globe size={14} className="text-[#E11D48]" />
                    <span>Required DNS Records for {customDomain || "your domain"}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase font-black">
                          <th className="pb-1.5">Type</th>
                          <th className="pb-1.5">Host Name</th>
                          <th className="pb-1.5">Points To / Value</th>
                          <th className="pb-1.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-[11px] text-slate-700">
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-bold text-slate-900">CNAME</td>
                          <td className="py-2">www</td>
                          <td className="py-2 text-[#E11D48]">cname.webntra.app</td>
                          <td className="py-2 text-emerald-600 font-bold">Active</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-bold text-slate-900">A</td>
                          <td className="py-2">@</td>
                          <td className="py-2 text-[#E11D48]">76.76.21.21</td>
                          <td className="py-2 text-emerald-600 font-bold">Active</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Security & Redirect Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Automatic Let's Encrypt SSL & HTTPS Redirect</div>
                    <div className="text-[11px] text-slate-500">Enforce TLS 1.3 encryption for all visitors automatically</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={forceHttps}
                    onChange={(e) => setForceHttps(e.target.checked)}
                    className="rounded text-[#E11D48] focus:ring-[#E11D48] w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Custom 404 Intelligent Fallback Page</div>
                    <div className="text-[11px] text-slate-500">Redirect lost visitors back to your home landing page smoothly</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={custom404}
                    onChange={(e) => setCustom404(e.target.checked)}
                    className="rounded text-[#E11D48] focus:ring-[#E11D48] w-4 h-4"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#E11D48]/20 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Save Domain Setup</span>
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 5. SEO & ANALYTICS                                              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "seo" && (
            <form onSubmit={handleSaveSEO} className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-slate-900">Search Engine Optimization & Analytics</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Optimize your websites for Google search rankings and monitor visitor conversion metrics.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Global Meta Title Suffix
                </label>
                <input
                  type="text"
                  value={seoTitleSuffix}
                  onChange={(e) => setSeoTitleSuffix(e.target.value)}
                  placeholder=" | Acme Corp Official"
                  className="w-full max-w-lg px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                />
                <p className="text-[11px] text-slate-400 mt-1">Appended to the browser title bar on every page.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Default Google Search Snippet (Meta Description)
                </label>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Compelling 150-character summary that appears in Google search results..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Google Analytics 4 Measurement ID
                </label>
                <input
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full max-w-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                />
                <p className="text-[11px] text-slate-400 mt-1">Automatically tracks page views, CTA button clicks, and conversions.</p>
              </div>

              {/* Indexing Toggle */}
              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900">Allow Search Engine Indexing (Google & Bing)</div>
                  <div className="text-[11px] text-slate-500">Generates dynamic sitemap.xml and robots.txt allowing search crawlers</div>
                </div>
                <input
                  type="checkbox"
                  checked={searchIndexing}
                  onChange={(e) => setSearchIndexing(e.target.checked)}
                  className="rounded text-[#E11D48] focus:ring-[#E11D48] w-4 h-4"
                />
              </label>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#E11D48]/20 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Save SEO Defaults</span>
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 6. NOTIFICATIONS & PREFERENCES                                  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "notifications" && (
            <form onSubmit={handleSaveNotifications} className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-slate-900">Notifications & Localization</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure real-time alerts, lead capture notifications, currency, and language.
                </p>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">AI Generation Completion Alerts</div>
                    <div className="text-[11px] text-slate-500">Send an instant alert when the 7 agents finish synthesizing your website</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnComplete}
                    onChange={(e) => setNotifyOnComplete(e.target.checked)}
                    className="rounded text-[#E11D48] focus:ring-[#E11D48] w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Visitor Contact Form Leads</div>
                    <div className="text-[11px] text-slate-500">Forward contact form inquiries directly to your registered email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnLeads}
                    onChange={(e) => setNotifyOnLeads(e.target.checked)}
                    className="rounded text-[#E11D48] focus:ring-[#E11D48] w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Weekly Performance & Visitor Digest</div>
                    <div className="text-[11px] text-slate-500">Receive a weekly email recap of total page visits and engagement scores</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="rounded text-[#E11D48] focus:ring-[#E11D48] w-4 h-4"
                  />
                </label>
              </div>

              {/* Localization / Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Default Currency (For E-Commerce & Pricing)
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                  >
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                    <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                    <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                    <option value="AUD ($)">AUD ($) - Australian Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Default Website Language
                  </label>
                  <select
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="Spanish (Español)">Spanish (Español)</option>
                    <option value="French (Français)">French (Français)</option>
                    <option value="German (Deutsch)">German (Deutsch)</option>
                    <option value="Japanese (日本語)">Japanese (日本語)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#E11D48]/20 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 7. SECURITY & PRIVACY                                           */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-slate-900">Security, Active Sessions & Privacy Rights</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protect your intellectual property, control device sessions, and download your data.
                </p>
              </div>

              {/* Active Device Sessions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Active Device Sessions
                </label>
                <div className="space-y-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <Monitor size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>macOS • Safari / Chrome</span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-bold">Current Device</span>
                        </div>
                        <div className="text-[11px] text-slate-500">IP: 192.168.1.1 • Active right now</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                        <Smartphone size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">iOS • Mobile Safari</div>
                        <div className="text-[11px] text-slate-500">IP: 73.189.20.11 • Last active 3 hours ago</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast("Device session revoked successfully!")}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Privacy Opt-Out */}
              <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optOutTraining}
                  onChange={(e) => {
                    setOptOutTraining(e.target.checked);
                    localStorage.setItem("webntra_pref_optout", String(e.target.checked));
                    showToast(e.target.checked ? "AI training opt-out enabled!" : "AI training opt-out disabled.");
                  }}
                  className="rounded text-[#E11D48] focus:ring-[#E11D48] w-4 h-4 mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">AI Model Training Opt-Out (Strict Privacy)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Guarantees that your prompt ideas, brand materials, and proprietary text are strictly ephemeral and never used to train public foundation models.
                  </div>
                </div>
              </label>

              {/* Data Rights & Clear Cache */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Download size={14} className="text-[#E11D48]" />
                      <span>Export My Account Data (GDPR)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Download a structured JSON package of all your projects, brand kits, and account activity.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportUserData}
                    className="mt-3 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs self-start"
                  >
                    Download Data Package
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Trash2 size={14} className="text-rose-600" />
                      <span>Clear Temporary Cache</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Wipe browser preview iframe sessions without affecting your saved projects or account credentials.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="mt-3 px-3.5 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold transition shadow-2xs self-start"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 8. ADVANCED DEVELOPER / AI ENGINE                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "developer" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900">Developer Engine & API Key Manager</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-900 text-white">
                      ADVANCED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your own Gemini, OpenRouter, or Groq API keys to customize model pipelines or bypass shared platform quotas.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border ${
                    backendStatus === true 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : backendStatus === false 
                      ? "bg-amber-50 text-amber-700 border-amber-200" 
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${backendStatus === true ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    <span>{backendStatus === true ? "Backend Online" : "Local Engine"}</span>
                  </div>
                  <button
                    onClick={checkHealth}
                    disabled={testingBackend}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                    title="Refresh health check"
                  >
                    <RefreshCw size={13} className={testingBackend ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {/* 7-Agent SDLC Model Allocations */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-[#E11D48]" />
                    <span className="text-xs font-black uppercase tracking-wider">7-Agent SDLC Model Allocations</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    Multi-Model Routing
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">Orchestrator</div>
                    <div className="text-rose-400 font-bold text-[11px] mt-0.5 truncate">Gemini 2.5 Pro</div>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">Requirements</div>
                    <div className="text-indigo-400 font-bold text-[11px] mt-0.5 truncate">Claude 3.5 Sonnet</div>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">Architect</div>
                    <div className="text-emerald-400 font-bold text-[11px] mt-0.5 truncate">Gemini 2.5 Flash</div>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">Frontend & CSS</div>
                    <div className="text-amber-400 font-bold text-[11px] mt-0.5 truncate">DeepSeek V3 / R1</div>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">Accessibility A11y</div>
                    <div className="text-sky-400 font-bold text-[11px] mt-0.5 truncate">Gemini 2.5 Flash</div>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">Testing & QA</div>
                    <div className="text-purple-400 font-bold text-[11px] mt-0.5 truncate">Llama 3.3 70B</div>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 col-span-2">
                    <div className="text-[10px] text-slate-400 font-sans">Security & Sanitization</div>
                    <div className="text-emerald-400 font-bold text-[11px] mt-0.5 truncate">Gemini 2.5 Pro (DOMPurify & OWASP Rules)</div>
                  </div>
                </div>
              </div>

              {/* API Keys Form */}
              <form onSubmit={handleSaveDeveloperKeys} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Google Gemini API Key</span>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[11px] text-[#E11D48] hover:underline flex items-center gap-0.5 font-semibold">
                      <span>Get Free Gemini Key</span>
                      <ExternalLink size={10} />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>OpenRouter API Key (Optional)</span>
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-[11px] text-slate-500 hover:underline flex items-center gap-0.5">
                      <span>OpenRouter.ai</span>
                      <ExternalLink size={10} />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Groq API Key (Optional)</span>
                    <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[11px] text-slate-500 hover:underline flex items-center gap-0.5">
                      <span>Groq Console</span>
                      <ExternalLink size={10} />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                {/* Build Export Format */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Default Project Code Bundle Export Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      exportFormat === "zip" ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"
                    }`}>
                      <input
                        type="radio"
                        name="exportFormat"
                        checked={exportFormat === "zip"}
                        onChange={() => setExportFormat("zip")}
                        className="text-[#E11D48] focus:ring-[#E11D48]"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Multi-File Modular ZIP</div>
                        <div className="text-[11px] text-slate-500">index.html, styles.css, app.js, assets/</div>
                      </div>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      exportFormat === "single_html" ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"
                    }`}>
                      <input
                        type="radio"
                        name="exportFormat"
                        checked={exportFormat === "single_html"}
                        onChange={() => setExportFormat("single_html")}
                        className="text-[#E11D48] focus:ring-[#E11D48]"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Self-Contained Standalone HTML</div>
                        <div className="text-[11px] text-slate-500">Inline CSS & JS for zero-dependency hosting</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>Save API Keys & Dev Preferences</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
