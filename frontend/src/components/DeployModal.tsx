import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check, ExternalLink, Globe, Sparkles, Server, ShieldCheck, FileCode } from "lucide-react";
import { FileItem } from "../types";
import JSZip from "jszip";

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  files: FileItem[];
}

export const DeployModal: React.FC<DeployModalProps> = ({
  isOpen,
  onClose,
  projectName,
  files
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"download" | "host" | "code">("download");

  if (!isOpen) return null;

  const downloadZip = async () => {
    if (!files.length) return;
    const zip = new JSZip();
    files.forEach(f => zip.file(f.path, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-production.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCombinedHtml = () => {
    const index = files.find(f => f.path.toLowerCase() === "index.html");
    if (!index) return "";
    let html = index.content;
    const css = files.filter(f => f.path.endsWith(".css")).map(f => f.content).join("\n");
    const js = files.filter(f => f.path.endsWith(".js")).map(f => f.content).join("\n");
    if (css) html = html.replace("</head>", `<style>\n${css}\n</style></head>`);
    if (js) html = html.replace("</body>", `<script>\n${js}\n</script></body>`);
    return html;
  };

  const handleCopyHtml = () => {
    const html = getCombinedHtml();
    navigator.clipboard.writeText(html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 text-slate-900 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E11D48] flex items-center justify-center font-bold">
                <Globe size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Export & Deploy Website</h3>
                <p className="text-xs text-slate-500">{projectName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 my-4 p-1 bg-slate-100 rounded-xl">
            {[
              { key: "download", label: "Package Download" },
              { key: "host", label: "Publish & Hosting" },
              { key: "code", label: "Single-File HTML" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as typeof activeTab)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === t.key ? "bg-white text-[#E11D48] shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Download ZIP */}
          {activeTab === "download" && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Package Files:</span>
                  <span className="font-mono text-[11px] text-emerald-600">Zero Dependencies</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
                  {files.map(f => (
                    <div key={f.path} className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200">
                      <FileCode size={13} className="text-[#E11D48]" />
                      <span>{f.path}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={downloadZip}
                className="w-full py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#E11D48]/20 flex items-center justify-center gap-2"
              >
                <Download size={15} />
                <span>Download Production ZIP Package</span>
              </button>
            </div>
          )}

          {/* Tab 2: Hosting Guides */}
          {activeTab === "host" && (
            <div className="space-y-3 py-2">
              {[
                { name: "Netlify", desc: "Drag & drop the unzipped folder to Netlify Drop for free instant HTTPS deployment." },
                { name: "Vercel", desc: "Import to GitHub or run 'vercel deploy' directly on the project files." },
                { name: "GitHub Pages", desc: "Push to a repository and enable GitHub Pages in repository settings." },
                { name: "Cloudflare Pages", desc: "Connect repository for global edge CDN distribution with zero latency." }
              ].map(h => (
                <div key={h.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{h.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{h.desc}</div>
                  </div>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 shrink-0">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Copy HTML */}
          {activeTab === "code" && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-slate-500">
                Inlined HTML file with all CSS and JavaScript bundled into a single file for embedding into CMS or direct sharing.
              </p>
              <div className="p-3 bg-slate-900 text-slate-300 font-mono text-[11px] rounded-xl max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{getCombinedHtml().slice(0, 500)}...</pre>
              </div>
              <button
                onClick={handleCopyHtml}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {copiedHtml ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedHtml ? "HTML Copied to Clipboard!" : "Copy Full Bundled HTML"}</span>
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>100% Client-Side Runnable Static Code</span>
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
