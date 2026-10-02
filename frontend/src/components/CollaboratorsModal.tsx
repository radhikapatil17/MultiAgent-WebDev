import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Users, Mail, UserPlus, Shield, Eye, Trash2,
  Clock, CheckCircle2, Copy, Check, ChevronDown, Link2,
  AlertTriangle, Loader2
} from "lucide-react";
import { Collaborator, CollaboratorRole } from "../types";
import {
  getCollaborators,
  addCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
} from "../services/projectStorage";

interface CollaboratorsModalProps {
  projectId: string;
  projectName: string;
  ownerName: string;
  ownerEmail: string;
  onClose: () => void;
}

const ROLE_META: Record<CollaboratorRole, { label: string; desc: string; icon: React.FC<any>; color: string }> = {
  Editor: {
    label: "Editor",
    desc: "Can view and modify the project",
    icon: Shield,
    color: "text-violet-600 bg-violet-50 border-violet-200",
  },
  Viewer: {
    label: "Viewer",
    desc: "Can only view the project",
    icon: Eye,
    color: "text-sky-600 bg-sky-50 border-sky-200",
  },
};

function AvatarBadge({ name, color, size = "md" }: { name: string; color: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const cls = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function RoleDropdown({
  value,
  onChange,
}: {
  value: CollaboratorRole;
  onChange: (role: CollaboratorRole) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = ROLE_META[value];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition ${meta.color}`}
      >
        <meta.icon size={11} />
        {meta.label}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {(["Editor", "Viewer"] as CollaboratorRole[]).map(role => {
              const m = ROLE_META[role];
              return (
                <button
                  key={role}
                  onClick={() => { onChange(role); setOpen(false); }}
                  className={`w-full px-3 py-2.5 flex items-start gap-2.5 hover:bg-slate-50 transition text-left ${value === role ? "bg-slate-50" : ""}`}
                >
                  <m.icon size={13} className="mt-0.5 shrink-0 text-slate-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{m.label}</div>
                    <div className="text-[10px] text-slate-500">{m.desc}</div>
                  </div>
                  {value === role && <Check size={12} className="ml-auto mt-0.5 text-[#E11D48] shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  projectId,
  projectName,
  ownerName,
  ownerEmail,
  onClose,
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() =>
    getCollaborators(projectId)
  );
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<CollaboratorRole>("Editor");
  const [inviteError, setInviteError] = useState("");
  const [justInvited, setJustInvited] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "no-smtp" | "failed">("idle");

  const refresh = () => setCollaborators(getCollaborators(projectId));

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    setInviteError("");

    if (!isValidEmail(email)) {
      setInviteError("Please enter a valid email address.");
      return;
    }
    if (email === ownerEmail.toLowerCase()) {
      setInviteError("That's your own email — you're already the owner.");
      return;
    }
    const result = addCollaborator(projectId, email, selectedRole);
    if (!result) {
      setInviteError("This person has already been invited.");
      return;
    }

    // Collaborator added locally — now try sending the email
    refresh();
    setJustInvited(result.id);
    setEmailInput("");
    setTimeout(() => setJustInvited(null), 2500);

    // Fire-and-forget email via backend
    setEmailStatus("sending");
    try {
      const res = await fetch("http://localhost:5000/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: selectedRole,
          projectName,
          projectId,
          inviterName: ownerName,
          inviterEmail: ownerEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus("sent");
      } else if (res.status === 503) {
        setEmailStatus("no-smtp");
      } else {
        setEmailStatus("failed");
      }
    } catch {
      setEmailStatus("failed");
    }
    setTimeout(() => setEmailStatus("idle"), 5000);
  };

  const handleRoleChange = (id: string, role: CollaboratorRole) => {
    updateCollaboratorRole(projectId, id, role);
    refresh();
  };

  const handleRemove = (id: string) => {
    if (confirmRemove !== id) { setConfirmRemove(id); return; }
    removeCollaborator(projectId, id);
    refresh();
    setConfirmRemove(null);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?project=${projectId}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  useEffect(() => {
    const handler = () => setConfirmRemove(null);
    if (confirmRemove) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [confirmRemove]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center">
              <Users size={17} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">Collaborators</h2>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Invite Form */}
          <div className="px-6 pt-5 pb-4">
            <p className="text-xs font-bold text-slate-700 mb-3">Invite by email</p>
            <form onSubmit={handleInvite} className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); setInviteError(""); }}
                  placeholder="colleague@company.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] transition placeholder:text-slate-400"
                />
              </div>

              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as CollaboratorRole)}
                className="px-2.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] text-slate-700 cursor-pointer"
              >
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-sm shadow-[#E11D48]/20 shrink-0"
              >
                <UserPlus size={13} />
                <span className="hidden sm:inline">Invite</span>
              </button>
            </form>

            {inviteError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-[11px] text-rose-600 flex items-center gap-1.5"
              >
                <AlertTriangle size={11} /> {inviteError}
              </motion.p>
            )}

            {/* Email send status banner */}
            <AnimatePresence>
              {emailStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={`mt-3 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border ${
                    emailStatus === "sending"  ? "bg-slate-50 border-slate-200 text-slate-600" :
                    emailStatus === "sent"     ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                    emailStatus === "no-smtp"  ? "bg-amber-50 border-amber-200 text-amber-700" :
                                                 "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  {emailStatus === "sending" && (
                    <><Loader2 size={13} className="animate-spin mt-0.5 shrink-0" />
                    Sending invite email…</>
                  )}
                  {emailStatus === "sent" && (
                    <><Check size={13} className="mt-0.5 shrink-0" />
                    Invite email sent successfully!</>
                  )}
                  {emailStatus === "no-smtp" && (
                    <><AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    <span>Collaborator added locally. To send emails, add <code className="font-mono bg-amber-100 px-1 rounded">SMTP_*</code> vars to <code className="font-mono bg-amber-100 px-1 rounded">backend/.env</code> and restart the server.</span></>
                  )}
                  {emailStatus === "failed" && (
                    <><AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    Email delivery failed. Collaborator was added locally — check server logs.</>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6">
            <div className="border-t border-slate-100" />
          </div>

          {/* People List */}
          <div className="px-6 pt-4 pb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              {1 + collaborators.length} {1 + collaborators.length === 1 ? "Person" : "People"} with access
            </p>

            <div className="space-y-0.5">
              {/* Owner row */}
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <AvatarBadge name={ownerName} color="#E11D48" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {ownerName} <span className="text-slate-400 font-normal">(you)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{ownerEmail}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-[#E11D48] border border-rose-200 shrink-0 ml-2">
                  Owner
                </span>
              </div>

              {/* Collaborator rows */}
              <AnimatePresence initial={false}>
                {collaborators.map(c => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition ${
                        justInvited === c.id
                          ? "bg-emerald-50 border border-emerald-200"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <AvatarBadge name={c.name} color={c.avatarColor} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">{c.name}</span>
                            {c.status === "pending" && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock size={8} /> Pending
                              </span>
                            )}
                            {justInvited === c.id && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={8} /> Invited!
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{c.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <RoleDropdown
                          value={c.role}
                          onChange={role => handleRoleChange(c.id, role)}
                        />
                        <button
                          onClick={e => { e.stopPropagation(); handleRemove(c.id); }}
                          className={`p-1.5 rounded-lg transition ${
                            confirmRemove === c.id
                              ? "bg-rose-500 text-white"
                              : "text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                          }`}
                          title={confirmRemove === c.id ? "Click again to confirm removal" : "Revoke access"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {collaborators.length === 0 && (
                <div className="py-8 text-center text-slate-400">
                  <Users size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">No collaborators yet. Invite someone above.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition"
          >
            {linkCopied
              ? <><Check size={13} className="text-emerald-600" /> Link Copied!</>
              : <><Link2 size={13} /> Copy project link</>
            }
          </button>
          <p className="text-[10px] text-slate-400 text-right">
            Invites are stored locally on this device.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
