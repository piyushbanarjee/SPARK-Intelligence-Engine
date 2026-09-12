import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, UploadCloud, Database, Network, History, Search,
  CheckCircle2, AlertTriangle, Loader2, FileText, 
  FolderOpen, X, Bot, Download, Shield, Share2, StickyNote
} from "lucide-react";
import { apiClient } from './api.js';

import EvidencePipelinePanel from './components/views/EvidencePipelinePanel';
import RegistryPanel from './components/views/RegistryPanel';
import LinkGraphPanel from './components/views/LinkGraphPanel';
import TimelinePanel from './components/views/TimelinePanel';
import InvestigationNotesPanel from './components/views/InvestigationNotesPanel';
import AssistantPanel from './components/views/AssistantPanel';
import OverviewPanel from './components/views/OverviewPanel';

// --- UI CONFIGURATION (No Mock Data) ---
const NAVIGATION_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "evidence", label: "Evidence Pipeline", icon: UploadCloud },
  { id: "registry", label: "Registry", icon: Database },
  { id: "graph", label: "Link Analysis", icon: Network },
  { id: "timeline", label: "Timeline", icon: History },
  { id: "notes", label: "Case Notes", icon: StickyNote },
  { id: "assistant", label: "AI Assistant", icon: Bot, badge: "AI" },
];

const VIEW_METADATA = {
  overview: { title: "Case Overview", sub: "Live Session Dashboard" },
  evidence: { title: "Evidence Pipeline", sub: "Digital extractions and forensic uploads" },
  registry: { title: "Entity Registry", sub: "Extracted subjects, locations, and items" },
  graph: { title: "Link Analysis Graph", sub: "Interactive entity relationship mapping" },
  timeline: { title: "Chronological Reconstruction", sub: "Sequential event timeline" },
  notes: { title: "Investigation Notes", sub: "Centralized note lodging" },
  assistant: { title: "Neural Assistant", sub: "AI copilot for case synthesis" },
};

// --- REUSABLE MICRO-COMPONENTS ---
function ContentPanel({ title, children, rightBadge, className = "", icon: Icon }) {
  return (
    <div className={`bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col ${className}`}>
      <div className="bg-zinc-900/40 px-4 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-zinc-400" />}
          <span className="text-sm font-semibold text-zinc-200">{title}</span>
        </div>
        {rightBadge && (
          <span className="text-[11px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded">{rightBadge}</span>
        )}
      </div>
      <div className="p-4 flex-1 overflow-auto custom-scrollbar">{children}</div>
    </div>
  );
}

function TopHeader({ onOpenQuickLookup, onOpenExport, user }) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-black border-b border-zinc-800 shrink-0 sticky top-0 z-40 backdrop-blur-md bg-black/90">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
          <Database size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-wide text-zinc-100">SPARK</span>
            <span className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-700 rounded px-1.5 py-0.5 font-medium uppercase tracking-wider">Enterprise</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-medium tracking-wide">Central District Intelligence</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onOpenQuickLookup} className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-blue-500/50 px-3 py-1.5 rounded-lg text-sm transition-all shadow-sm">
          <Search size={15} className="text-zinc-500" />
          <span className="hidden sm:inline">Search Index</span>
          <kbd className="hidden md:inline-block bg-black px-1.5 py-0.5 text-[10px] text-zinc-500 border border-zinc-800 rounded font-mono">⌘K</kbd>
        </button>

        <button onClick={onOpenExport} className="flex items-center gap-1.5 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-lg text-sm transition-all shadow-sm">
          <Download size={15} className="text-zinc-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <div className="h-6 w-px bg-zinc-800 mx-1"></div>

        <div className="flex items-center gap-3 px-2 py-1">
          <div className="leading-tight hidden md:block text-right">
            <div className="text-sm font-semibold text-zinc-200">{user.name}</div>
            <div className="text-[11px] text-zinc-500">{user.role}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold shadow-sm">
            {user.initials}
          </div>
        </div>
      </div>
    </header>
  );
}

function GlobalSearchModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950">
          <Search size={20} className="text-zinc-500 shrink-0" />
          <input autoFocus placeholder="Search API wiring pending..." className="w-full bg-transparent text-base text-zinc-200 placeholder-zinc-500 outline-none" disabled />
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1.5 bg-zinc-900 rounded-lg"><X size={16} /></button>
        </div>
        <div className="max-h-[60vh] p-8 text-center text-zinc-500 text-sm">
          Global Search is awaiting API integration.
        </div>
      </div>
    </div>
  );
}

function ExportDialog({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6 text-center space-y-4">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center justify-center gap-2">
          <Download size={18} className="text-blue-500" /> Export Module
        </h2>
        <p className="text-sm text-zinc-400">Export functionality is awaiting dynamic API wiring.</p>
        <button onClick={onClose} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-700">Close</button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [lookupOpen, setLookupOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [caseId, setCaseId] = useState(null);
  const [initError, setInitError] = useState(null);

  // Replaced mock name with generic system operator
  const user = { name: "System Operator", role: "Intelligence Analyst", initials: "OP" };

  const initializeSession = async () => {
    setInitError(null);
    try {
      const newCase = await apiClient.createCase("Live Session", "Active Investigation");
      setCaseId(newCase.id);
    } catch (error) {
      console.error("Failed to initialize SPARK session:", error);
      setInitError(error.message || "Failed to connect to backend");
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setLookupOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderActiveView = () => {
    if (!caseId) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          {initError ? (
            <div className="text-center bg-zinc-900 border border-red-900 p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-red-500 text-xl font-black uppercase tracking-wider mb-2">Connection Failure</h2>
              <p className="text-red-400 mb-6 font-mono text-sm">{initError}</p>
              <button onClick={initializeSession} className="bg-red-900 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors uppercase text-sm tracking-wider w-full">Retry Connection</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={32} className="text-blue-500 animate-spin" />
              <p className="text-blue-400 text-lg font-bold animate-pulse tracking-widest uppercase">Initializing S.P.A.R.K. Core...</p>
            </div>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case "overview": return <ContentPanel title="Case Overview" icon={LayoutDashboard}><OverviewPanel caseId={caseId} /></ContentPanel>;
      case "evidence": return <ContentPanel title="Evidence Pipeline" icon={FolderOpen}><EvidencePipelinePanel caseId={caseId} /></ContentPanel>;
      case "registry": return <ContentPanel title="Entity Registry" icon={Database}><RegistryPanel caseId={caseId} /></ContentPanel>;
      case "graph": return <ContentPanel title="Link Analysis" icon={Share2} className="h-[600px]"><LinkGraphPanel caseId={caseId} /></ContentPanel>;
      case "timeline": return <ContentPanel title="Investigation Timeline" icon={History}><TimelinePanel caseId={caseId} /></ContentPanel>;
      case "notes": return <ContentPanel title="Investigation Notes" icon={StickyNote}><InvestigationNotesPanel caseId={caseId} /></ContentPanel>;
      case "assistant": return <ContentPanel title="AI Assistant" icon={Bot}><AssistantPanel caseId={caseId} /></ContentPanel>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex flex-col selection:bg-blue-500/30 selection:text-white relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="bg-zinc-950 text-zinc-500 text-center text-[10px] tracking-widest uppercase py-1.5 font-medium border-b border-zinc-800 shrink-0 flex items-center justify-center gap-3 z-10 relative">
        <Shield size={12} className="text-zinc-600" />
        SPARK Intelligence System • Active Session
        <Shield size={12} className="text-zinc-600" />
      </div>

      <TopHeader onOpenQuickLookup={() => setLookupOpen(true)} onOpenExport={() => setExportOpen(true)} user={user} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 relative z-10">
        <div className="mb-6 border-b border-zinc-800 pb-4">
          <h1 className="text-2xl font-semibold text-zinc-100">{VIEW_METADATA[activeTab]?.title}</h1>
          <p className="text-sm text-zinc-400 mt-1">{VIEW_METADATA[activeTab]?.sub}</p>
        </div>
        {renderActiveView()}
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-full px-4">
        <div className="flex items-center gap-1.5 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-1.5 backdrop-blur-lg">
          {NAVIGATION_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === item.id ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`}>
              <item.icon size={16} className={activeTab === item.id ? "text-white" : "text-zinc-400"} />
              <span className="hidden md:inline">{item.label}</span>
              {item.badge && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ml-1 ${activeTab === item.id ? "bg-white/20 text-white" : "bg-purple-900/50 text-purple-400 border border-purple-800/50"}`}>{item.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <GlobalSearchModal isOpen={lookupOpen} onClose={() => setLookupOpen(false)} />
      <ExportDialog isOpen={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}