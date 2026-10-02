import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { User } from "../types";
import { getGoogleAuthUrl, loginUser, registerUser, requestPasswordReset, resetPassword } from "../services/api";
import logoImg from "../assets/logo.jpg";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  requiredReason?: string;
  initialMode?: "signin" | "signup" | "forgot" | "reset";
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  requiredReason,
  initialMode = "signin"
}) => {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode if initialMode changes or if URL contains reset_code
  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get("reset_code");
      const urlEmail = params.get("email");

      if (urlCode) {
        setMode("reset");
        setResetCode(urlCode);
        if (urlEmail) setEmail(decodeURIComponent(urlEmail));
        setStatusMessage("Reset code applied from your email link. Enter your new password below.");
      } else if (initialMode) {
        setMode(initialMode);
      }
    }
  }, [isOpen, initialMode]);

  // Password validation rules for sign up
  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordChecks.length) score++;
    if (passwordChecks.lowercase) score++;
    if (passwordChecks.uppercase) score++;
    if (passwordChecks.number) score++;
    if (passwordChecks.special) score++;
    return score;
  }, [passwordChecks]);

  const isPasswordValid = mode === "signin" 
    ? password.length > 0 
    : mode === "reset"
    ? password.length >= 6
    : Object.values(passwordChecks).every(Boolean);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setResetCode("");
    setShowPassword(false);
    setErrorMsg("");
    setStatusMessage("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 1. Forgot Password Submission (sends verification email via SMTP)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setStatusMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      if (res.success) {
        setStatusMessage(`Verification code sent to ${email.trim()}. Please check your inbox or spam.`);
        setMode("reset");
      } else {
        setErrorMsg(res.error || "Failed to send reset code. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to contact reset service.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Reset Password Submission (verifies code and sets new password)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setStatusMessage("");

    if (!email.trim()) {
      setErrorMsg("Please enter your account email.");
      return;
    }

    if (!resetCode.trim() || resetCode.trim().length < 6) {
      setErrorMsg("Please enter the 6-digit verification code from your email.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(email.trim(), resetCode.trim(), password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        handleClose();
      } else {
        setErrorMsg(res.error || "Invalid verification code or code has expired.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Resend Code Action
  const handleResendCode = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter your email to resend code.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      if (res.success) {
        setStatusMessage(`A new 6-digit code has been sent to ${email.trim()}`);
      } else {
        setErrorMsg(res.error || "Failed to resend code.");
      }
    } catch {
      setErrorMsg("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Standard Sign In / Sign Up Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!email || !password) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (mode === "signup" && !isPasswordValid) {
      setErrorMsg("Please ensure your password meets all security requirements.");
      return;
    }

    setIsLoading(true);

    if (mode === "signin") {
      try {
        const res = await loginUser(email, password);
        if (!res.success || !res.user) {
          setErrorMsg(res.error || "Incorrect email or password. Please try again.");
          return;
        }
        onLoginSuccess(res.user);
        handleClose();
      } catch (err: any) {
        setErrorMsg(err?.message || "Failed to sign in. Please verify your credentials.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // mode === "signup"
      try {
        const res = await registerUser(email, password, name);
        if (!res.success || !res.user) {
          setErrorMsg(res.error || "Failed to create account. Please try again.");
          return;
        }
        onLoginSuccess(res.user);
        handleClose();
      } catch (err: any) {
        setErrorMsg(err?.message || "Failed to register account.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 text-slate-900"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>

          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-[#E11D48]/20 border border-slate-200 shrink-0 bg-white p-0.5">
              <img src={logoImg} alt="WEBNTRA" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">
                WEBNTRA
              </span>
              <span className="text-[11px] text-slate-400 block font-medium">
                AI Website Builder Platform
              </span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
              {mode === "reset" && "Enter verification code"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "signin" && "Sign in to access your workspace."}
              {mode === "signup" && "Get started for free. Build production websites in minutes."}
              {mode === "forgot" && "Enter your email to receive a 6-digit verification code via email."}
              {mode === "reset" && "Enter the 6-digit code sent to your email and pick a new password."}
            </p>
          </div>

          {/* Reason Notice */}
          {requiredReason && mode !== "forgot" && mode !== "reset" && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
              <AlertCircle size={16} className="text-[#E11D48] shrink-0 mt-0.5" />
              <span className="font-medium">{requiredReason}</span>
            </div>
          )}

          {/* Success Status Message */}
          {statusMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 font-medium">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ===================== VIEW 1: FORGOT PASSWORD (EMAIL INPUT) ===================== */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  We'll send a 6-digit confirmation code powered by our secure SMTP mailer.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-sm transition-all shadow-lg shadow-[#E11D48]/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-3 text-xs">
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setErrorMsg(""); setStatusMessage(""); }}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-semibold"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("reset"); setErrorMsg(""); }}
                  className="text-[#E11D48] hover:underline font-semibold"
                >
                  I already have a code →
                </button>
              </div>
            </form>
          )}

          {/* ===================== VIEW 2: VERIFY CODE & SET NEW PASSWORD ===================== */}
          {mode === "reset" && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">6-Digit Code</label>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-xs font-semibold text-[#E11D48] hover:underline"
                  >
                    Resend code
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono tracking-widest text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-sm transition-all shadow-lg shadow-[#E11D48]/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Reset Password & Sign In</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setErrorMsg(""); setStatusMessage(""); }}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-semibold"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* ===================== VIEW 3: SIGN IN & SIGN UP ===================== */}
          {(mode === "signin" || mode === "signup") && (
            <>
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition shadow-sm disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  or with email
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    {mode === "signin" && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setMode("forgot");
                          setErrorMsg("");
                          setStatusMessage("");
                        }}
                        className="text-xs font-semibold text-[#E11D48] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator (Sign Up Only) */}
                  {mode === "signup" && password.length > 0 && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>Password Strength</span>
                        <span className={passwordScore >= 4 ? "text-emerald-600" : passwordScore >= 2 ? "text-amber-600" : "text-rose-600"}>
                          {passwordScore === 5 ? "Strong" : passwordScore >= 3 ? "Medium" : "Weak"}
                        </span>
                      </div>
                      
                      {/* Strength Bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordScore >= 4 ? "bg-emerald-500" : passwordScore >= 2 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${(passwordScore / 5) * 100}%` }}
                        />
                      </div>

                      {/* Requirement Checklist */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-500 mt-1">
                        <span className={`flex items-center gap-1 ${passwordChecks.length ? "text-emerald-600 font-semibold" : ""}`}>
                          {passwordChecks.length ? "✓" : "○"} Min 8 characters
                        </span>
                        <span className={`flex items-center gap-1 ${passwordChecks.lowercase ? "text-emerald-600 font-semibold" : ""}`}>
                          {passwordChecks.lowercase ? "✓" : "○"} Lowercase letter
                        </span>
                        <span className={`flex items-center gap-1 ${passwordChecks.uppercase ? "text-emerald-600 font-semibold" : ""}`}>
                          {passwordChecks.uppercase ? "✓" : "○"} Uppercase letter
                        </span>
                        <span className={`flex items-center gap-1 ${passwordChecks.number ? "text-emerald-600 font-semibold" : ""}`}>
                          {passwordChecks.number ? "✓" : "○"} At least 1 number
                        </span>
                        <span className={`flex items-center gap-1 col-span-2 ${passwordChecks.special ? "text-emerald-600 font-semibold" : ""}`}>
                          {passwordChecks.special ? "✓" : "○"} Special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remember Me (Sign In only) */}
                {mode === "signin" && (
                  <div className="flex items-center text-sm text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-[#E11D48] focus:ring-[#E11D48] w-4 h-4"
                      />
                      <span>Remember this device</span>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || (mode === "signup" && !isPasswordValid)}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-sm transition-all shadow-lg shadow-[#E11D48]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle between Sign In and Sign Up */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center text-sm text-slate-500">
                {mode === "signin" ? (
                  <span>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("signup"); setErrorMsg(""); setStatusMessage(""); }}
                      className="font-bold text-[#E11D48] hover:underline cursor-pointer"
                    >
                      Create one
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("signin"); setErrorMsg(""); setStatusMessage(""); }}
                      className="font-bold text-[#E11D48] hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </span>
                )}
              </div>
            </>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
