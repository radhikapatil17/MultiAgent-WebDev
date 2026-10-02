import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Search, Copy, Check, Sparkles, Plus } from "lucide-react";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (url: string) => void;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertImage
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Technology");

  if (!isOpen) return null;

  const categories = ["Technology", "Modern SaaS", "Workspace", "Portraits", "Abstract Gradients", "Fintech"];

  const STOCK_MEDIA: Record<string, { title: string; url: string }[]> = {
    Technology: [
      { title: "Server Nodes Cluster", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" },
      { title: "Futuristic Code Interface", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80" },
      { title: "AI Neural Network", url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80" },
      { title: "Cybersecurity Shield", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80" },
    ],
    "Modern SaaS": [
      { title: "SaaS Dashboard Preview", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" },
      { title: "Analytics Data Chart", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" },
      { title: "Product Collaboration", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80" },
      { title: "Minimalist Interface", url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80" },
    ],
    Workspace: [
      { title: "Minimalist Desk Setup", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" },
      { title: "Modern Studio Office", url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80" },
      { title: "Creative Laptop Work", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" },
    ],
    Portraits: [
      { title: "Founder / Executive", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" },
      { title: "Software Engineer", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80" },
      { title: "Product Designer", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80" },
    ],
    "Abstract Gradients": [
      { title: "Rose Fluid Mesh", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" },
      { title: "Neon Glow Sphere", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80" },
      { title: "Dark Architectural Depth", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
    ],
    Fintech: [
      { title: "Digital Payment Card", url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80" },
      { title: "Financial Stocks Screen", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80" },
      { title: "Global Banking Network", url: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=800&q=80" },
    ]
  };

  const images = STOCK_MEDIA[selectedCategory] || STOCK_MEDIA.Technology;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 text-slate-900 overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E11D48] flex items-center justify-center font-bold">
                <ImageIcon size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Media & Asset Library</h3>
                <p className="text-xs text-slate-500">Insert high-resolution imagery into your website prompt or HTML</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X size={16} />
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-none border-b border-slate-100">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === c
                    ? "bg-[#E11D48] text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="flex-1 overflow-y-auto py-4 grid grid-cols-2 sm:grid-cols-2 gap-4">
            {images.map((item, idx) => (
              <div key={idx} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <span className="text-[11px] font-bold text-white line-clamp-1">{item.title}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(item.url)}
                      className="flex-1 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                    >
                      {copiedUrl === item.url ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      <span>{copiedUrl === item.url ? "Copied" : "Copy URL"}</span>
                    </button>
                    <button
                      onClick={() => { onInsertImage(item.url); onClose(); }}
                      className="py-1.5 px-3 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                    >
                      <Plus size={11} />
                      <span>Use</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-right">
            <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
