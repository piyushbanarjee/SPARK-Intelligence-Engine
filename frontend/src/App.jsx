import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, UploadCloud, Users, Network, History, Search,
  User, CheckCircle2, Clock, AlertTriangle, Loader2, FileText, 
  FolderOpen, X, Sparkles, Send, Bot, Download, Plus, Trash2, 
  Pin, Microscope, Target, Activity, Database, Shield, FilePlus, Tv,
  ZoomIn, ZoomOut, Edit3, Lock, ArrowRight
} from "lucide-react";
import * as api from "./api";

// Reusable Components
function SecurityBadge({ code }) {
  return (
    <span className="inline-flex text-[10px] font-mono font-medium tracking-wide rounded px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-700 shadow-sm uppercase">
      {code}
    </span>
  );
}

function StatusBadge({ status, type = "success" }) {
  const isSuccess = type === "success" || status?.toLowerCase() === "processed" || status?.toLowerCase() === "verified" || status?.toLowerCase() === "solved";
  const colors = isSuccess 
    ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/50" 
    : "bg-red-950/30 text-red-400 border-red-800/50";
  
  const Icon = isSuccess ? CheckCircle2 : AlertTriangle;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-medium ${colors}`}>
      <Icon size={12} className={isSuccess ? "text-emerald-500" : "text-red-500"} />
      {status}
    </span>
  );
}

function ContentPanel({ title, children, rightBadge, className = "", icon: Icon }) {
  return (
    <div className={`bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col ${className}`}>
      <div className="bg-zinc-900/40 px-4 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-zinc-400" />}
          <span className="text-sm font-semibold text-zinc-200">{title}</span>
        </div>
        {rightBadge && (
          <span className="text-[11px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded">
            {rightBadge}
          </span>
        )}
      </div>
      <div className="p-4 flex-1 overflow-auto custom-scrollbar">{children}</div>
    </div>
  );
}

function triggerFileDownload(filename, content, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const VIEW_METADATA = {
  overview: { title: "Case Overview", sub: "Central District Investigation Unit • Lead: Inspector Arjun Mehta" },
  pipeline: { title: "Evidence Pipeline", sub: "Digital extractions, CCTV logs, autopsy briefs, & forensic uploads" },
  registry: { title: "Entity Registry", sub: "Victims, suspects, witnesses, physical evidence, & locations" },
  graph: { title: "Link Analysis Graph", sub: "Interactive entity relationship mapping for Case CF-2026-017" },
  timeline: { title: "Chronological Reconstruction", sub: "Sequential timeline from initial event to case disposition" },
  notes: { title: "Investigation Notes", sub: "Centralized note lodging for evidence cross-referencing" },
  assistant: { title: "Neural Assistant", sub: "AI copilot for case file synthesis and query resolution" },
};

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10 p-8">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <Shield size={32} />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-wide text-zinc-100">SPARK</h1>
            <span className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-700 rounded px-1.5 py-0.5 font-medium uppercase tracking-wider">Enterprise</span>
          </div>
          <p className="text-sm text-zinc-500 font-medium tracking-wide">Central District Intelligence</p>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Secure Gateway ID</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ID Number or Email"
                  className="w-full bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Access Credential</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600"
                  onKeyDown={e => e.key === 'Enter' && onLogin()}
                />
              </div>
            </div>
            <button 
              onClick={onLogin}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              Authenticate & Initialize <ArrowRight size={16} />
            </button>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-zinc-600 mt-8 font-mono">
          UNAUTHORIZED ACCESS IS PROHIBITED. <br/>ALL ACTIVITIES ARE LOGGED AND MONITORED.
        </p>
      </div>
    </div>
  );
}

const NAVIGATION_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pipeline", label: "Evidence Pipeline", icon: UploadCloud },
  { id: "registry", label: "Registry", icon: Users },
  { id: "graph", label: "Link Analysis", icon: Network },
  { id: "timeline", label: "Timeline", icon: History },
  { id: "notes", label: "Case Notes", icon: FileText, badge: "NEW" },
  { id: "assistant", label: "AI Assistant", icon: Bot, badge: "AI" },
];

function PageHeader({ tab, caseCode }) {
  const meta = VIEW_METADATA[tab] || VIEW_METADATA.overview;
  return (
    <div className="mb-6 border-b border-zinc-800 pb-4">
      <h1 className="text-2xl font-semibold text-zinc-100">{meta.title}</h1>
      <p className="text-sm text-zinc-400 mt-1">
        {tab === "overview" && caseCode ? `${meta.sub}` : meta.sub}
      </p>
    </div>
  );
}

function NavigationMenu({ active, setActive }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-full px-4">
      <div className="flex items-center gap-1.5 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-1.5 backdrop-blur-lg">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-zinc-400"} />
              <span className="hidden md:inline">{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ml-1 ${
                  isActive ? "bg-white/20 text-white" : "bg-purple-900/50 text-purple-400 border border-purple-800/50"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UserConfigurationModal({ isOpen, onClose, user, setUser }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-zinc-100">User Configuration</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 bg-zinc-900 p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Investigator Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-zinc-800 p-2.5 rounded-lg text-sm text-zinc-200 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Official Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 p-2.5 rounded-lg text-sm text-zinc-200 outline-none focus:border-blue-500" />
          </div>
          <button 
            onClick={() => { setUser({...user, name, email, initials: name.substring(0,2).toUpperCase()}); onClose(); }} 
            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-medium p-2.5 rounded-lg text-sm transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportDialog({ isOpen, onClose, caseInfo }) {
  if (!isOpen) return null;
  const handleExportJSON = () => { triggerFileDownload("Case_Archive.json", JSON.stringify(caseInfo, null, 2), "application/json"); onClose(); };
  const handleExportReport = () => { triggerFileDownload("Investigation_Brief.txt", "SPARK ENTERPRISE - INVESTIGATION BRIEF", "text/plain"); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Download size={18} className="text-blue-500" /> Export Case Data
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 bg-zinc-900 p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Select a format to export the complete case archive, custody logs, analysis graphs, and evidence registries.</p>
        <div className="space-y-3">
          <button onClick={handleExportJSON} className="w-full p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left flex items-center justify-between transition-all group">
            <div>
              <div className="text-sm font-semibold text-zinc-200 group-hover:text-white">Export Raw JSON Archive</div>
              <div className="text-xs text-zinc-500 mt-1">Complete datasets & evidence metadata</div>
            </div>
            <FileText size={20} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
          </button>
          <button onClick={handleExportReport} className="w-full p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left flex items-center justify-between transition-all group">
            <div>
              <div className="text-sm font-semibold text-zinc-200 group-hover:text-white">Export Text Brief (.txt)</div>
              <div className="text-xs text-zinc-500 mt-1">Formatted executive summary report</div>
            </div>
            <FileText size={20} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}

function GlobalSearchModal({ isOpen, onClose, onNavigate, registry }) {
  const [query, setQuery] = useState("");
  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const matchingEntities = q === "" ? [] : registry?.filter(e => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950">
          <Search size={20} className="text-zinc-500 shrink-0" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search across subjects, evidence, documents..." className="w-full bg-transparent text-base text-zinc-200 placeholder-zinc-500 outline-none" />
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1.5 bg-zinc-900 rounded-lg"><X size={16} /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 bg-black">
          {q === "" && <div className="text-center py-10 text-zinc-500 text-sm">Start typing to search the case index.</div>}
          {matchingEntities.length > 0 && (
            <div>
              <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2 px-1">Registry Matches</div>
              <div className="space-y-1.5">
                {matchingEntities.map(e => (
                  <button key={e.id} onClick={() => { onNavigate("registry"); onClose(); }} className="w-full text-left p-3 bg-zinc-950 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg flex items-center justify-between text-sm transition-all">
                    <div>
                      <span className="font-medium text-zinc-200">{e.name}</span>
                      <span className="text-zinc-500 ml-2 text-xs">({e.type})</span>
                    </div>
                    <span className="text-xs text-blue-400 font-mono bg-blue-950/20 px-2 py-0.5 rounded">{e.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricsDashboard({ caseInfo }) {
  const isSolved = caseInfo?.status?.toLowerCase().includes("sol");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl shadow-sm flex items-center justify-between hover:border-zinc-700 transition-colors group">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Case Disposition</div>
          <div className={`text-xl font-bold mt-1.5 ${isSolved ? 'text-emerald-400' : 'text-blue-400'}`}>{isSolved ? "SOLVED" : "ACTIVE"}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Arrest Made • Judicial Pending</div>
        </div>
        <div className={`w-12 h-12 rounded-xl ${isSolved ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-blue-950/30 border-blue-500/30 text-blue-400'} border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}><CheckCircle2 size={20} /></div>
      </div>
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl shadow-sm flex items-center justify-between hover:border-zinc-700 transition-colors group">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Primary Victim</div>
          <div className="text-xl font-bold mt-1.5 text-blue-400">{caseInfo?.victim?.split(' ')[0] || "N/A"}</div>
          <div className="text-[11px] text-zinc-500 mt-1">34 Y.O. • Apt 4B</div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-950/30 border border-blue-500/30 border flex items-center justify-center text-blue-400 shadow-sm group-hover:scale-105 transition-transform"><User size={20} /></div>
      </div>
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl shadow-sm flex items-center justify-between hover:border-zinc-700 transition-colors group">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Principal Suspect</div>
          <div className="text-xl font-bold mt-1.5 text-red-400">{caseInfo?.suspect?.split(' ')[0] || "N/A"}</div>
          <div className="text-[11px] text-zinc-500 mt-1">In Custody • Arrested</div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-950/30 border border-red-500/30 border flex items-center justify-center text-red-400 shadow-sm group-hover:scale-105 transition-transform"><Target size={20} /></div>
      </div>
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl shadow-sm flex items-center justify-between hover:border-zinc-700 transition-colors group">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Key Evidence</div>
          <div className="text-xl font-bold mt-1.5 text-indigo-400">6 Items</div>
          <div className="text-[11px] text-zinc-500 mt-1">CCTV / Footwear / Blood</div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-950/30 border border-indigo-500/30 border flex items-center justify-center text-indigo-400 shadow-sm group-hover:scale-105 transition-transform"><Microscope size={20} /></div>
      </div>
    </div>
  );
}

// Main Panels
function OverviewPanel({ caseInfo, timelineLogs, onNavigate }) {
  return (
    <div className="space-y-6">
      <MetricsDashboard caseInfo={caseInfo} />

      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-zinc-100">{caseInfo?.code} / {caseInfo?.name}</span>
              <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                {caseInfo?.status}
              </span>
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              Primary Victim: <span className="text-zinc-200 font-medium">{caseInfo?.victim}</span> • Scene: <span className="text-zinc-200">{caseInfo?.scene}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => onNavigate("graph")} className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm">
            <Network size={16} /> Link Graph
          </button>
          <button onClick={() => onNavigate("notes")} className="flex-1 md:flex-none px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2">
            <FileText size={16} className="text-zinc-400" /> Case Notes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ContentPanel title="Recent Investigation Log" icon={History} rightBadge="Realtime" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-zinc-500 border-b border-zinc-800/60 font-medium">
                  <th className="px-3 py-3">Date / Time</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Event Detail</th>
                  <th className="px-3 py-3">Source</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {timelineLogs?.slice(0, 6).map((r, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-3 py-3.5 text-zinc-400 text-xs font-mono">{r.date} {r.time}</td>
                    <td className="px-3 py-3.5 text-zinc-300 text-xs">
                      <span className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">{r.category}</span>
                    </td>
                    <td className="px-3 py-3.5 text-zinc-200 font-medium">{r.title}</td>
                    <td className="px-3 py-3.5 text-blue-400 text-xs truncate max-w-[160px]">{r.source}</td>
                    <td className="px-3 py-3.5"><StatusBadge status={r.conflict ? "Flagged" : "Verified"} type={r.conflict ? "error" : "success"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentPanel>

        <ContentPanel title="Case Metadata" icon={Database} rightBadge={`File: ${caseInfo?.code}`}>
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Investigating Unit</div>
              <div className="text-base font-semibold text-zinc-100 mt-1">{caseInfo?.unit}</div>
              <div className="text-sm text-blue-400 mt-1">Lead: {caseInfo?.lead}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-black border border-zinc-800/60 rounded-lg">
                <span className="text-zinc-400 text-xs">Date Opened:</span>
                <span className="text-zinc-200 text-xs font-medium">{caseInfo?.dateOpened ? caseInfo.dateOpened.split('T')[0] : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black border border-zinc-800/60 rounded-lg">
                <span className="text-zinc-400 text-xs">Principal Suspect:</span>
                <span className="text-red-400 text-xs font-medium">{caseInfo?.suspect}</span>
              </div>
            </div>
          </div>
        </ContentPanel>
      </div>
    </div>
  );
}

function EvidencePipelinePanel({ documents, onRefreshDocs }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadDocument(file);
      await onRefreshDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 p-8 rounded-xl text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mb-4">
          <UploadCloud size={28} className={uploading ? "animate-bounce text-blue-500" : ""} />
        </div>
        <p className="text-base font-semibold text-zinc-200">Evidence Ingestion Dropzone</p>
        <p className="text-sm text-zinc-500 mt-2 max-w-md">Securely upload forensic PDFs, CCTV, or logs.</p>
        
        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <FilePlus size={16} />}
          {uploading ? "Processing..." : "Select File"}
        </button>
      </div>

      <ContentPanel title="Ingested Documents Archive" icon={FolderOpen} rightBadge={`${documents?.length || 0} Files`}>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-[11px] text-zinc-500 border-b border-zinc-800 font-semibold uppercase tracking-wider bg-black/40">
              <th className="px-5 py-3">File Name</th>
              <th className="px-4 py-3">Format</th>
              <th className="px-4 py-3">Logged Date</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 bg-black/20">
            {documents?.map((d) => (
              <tr key={d.id} className="hover:bg-zinc-900/40">
                <td className="px-5 py-3.5 font-medium text-zinc-200 flex items-center gap-3">
                  <FileText size={16} className="text-blue-500 shrink-0" />
                  {d.name}
                </td>
                <td className="px-4 py-3.5 text-zinc-400 text-xs"><span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">{d.type}</span></td>
                <td className="px-4 py-3.5 text-zinc-400 text-xs font-mono">{d.date}</td>
                <td className="px-4 py-3.5"><SecurityBadge code={d.classification} /></td>
                <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </ContentPanel>
    </div>
  );
}

function RegistryPanel({ registry }) {
  const [query, setQuery] = useState("");
  
  const filtered = registry?.filter(e => 
    e.name.toLowerCase().includes(query.toLowerCase()) || 
    e.type.toLowerCase().includes(query.toLowerCase())
  ) || [];

  return (
    <div className="space-y-5">
      <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5">
        <Search size={16} className="text-zinc-500 mr-2 mt-0.5" />
        <input 
          value={query} onChange={e => setQuery(e.target.value)} 
          placeholder="Search subjects, evidence codes..." 
          className="bg-transparent outline-none w-full text-sm text-zinc-200"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(e => (
          <div key={e.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-zinc-100">{e.name}</h3>
                <span className="text-xs text-zinc-400">{e.code} • {e.type}</span>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold ${e.risk > 50 ? 'bg-red-950 text-red-400' : 'bg-zinc-900 text-zinc-400'}`}>
                Risk: {e.risk}
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-3">{e.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphPanel({ graphData, registry }) {
  const [zoom, setZoom] = useState(100);
  const [selectedElement, setSelectedElement] = useState(null);

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) setSelectedElement(null);
  };

  return (
    <div className="flex h-[70vh] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative">
      <div className="flex flex-col flex-1 relative overflow-hidden">
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 flex items-center gap-4 z-10">
          <div className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Search size={14} className="text-zinc-500" />
            <input placeholder="Highlight specific nodes or vectors..." className="bg-transparent w-full text-sm outline-none text-white" />
          </div>
          <div className="flex items-center gap-3 text-zinc-400 bg-black border border-zinc-800 rounded-lg px-2 py-1">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="hover:text-white p-1"><ZoomOut size={16}/></button>
            <span className="text-sm font-mono w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="hover:text-white p-1"><ZoomIn size={16}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto relative bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:40px_40px] custom-scrollbar" onClick={handleCanvasClick}>
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "0 0", width: "100%", height: "100%", minHeight: "800px", minWidth: "1200px", position: "relative" }} onClick={handleCanvasClick}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {graphData?.map(edge => {
                const fromNode = registry?.find(n => n.id === edge.from_node);
                const toNode = registry?.find(n => n.id === edge.to_node);
                if (!fromNode || !toNode) return null;
                
                const x1 = fromNode.x + 120;
                const y1 = fromNode.y + 45;
                const x2 = toNode.x + 120;
                const y2 = toNode.y + 45;
                
                const isSelected = selectedElement?.type === 'edge' && selectedElement?.data?.id === edge.id;
                
                return (
                  <g key={edge.id} className="cursor-pointer pointer-events-auto group" onClick={(e) => { e.stopPropagation(); setSelectedElement({type: 'edge', data: edge, from: fromNode, to: toNode}); }}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isSelected ? "#3b82f6" : "#3f3f46"} strokeWidth={isSelected ? "4" : "2"} strokeDasharray={edge.style === 'conflict' ? '5,5' : 'none'} className={isSelected ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all" : "group-hover:stroke-zinc-500 transition-all"} />
                    <rect x={(x1+x2)/2 - 50} y={(y1+y2)/2 - 12} width="100" height="24" fill={isSelected ? "#1e3a8a" : "#09090b"} rx="12" stroke={isSelected ? "#3b82f6" : "#27272a"} className="transition-all" />
                    <text x={(x1+x2)/2} y={(y1+y2)/2 + 4} fill={isSelected ? "#ffffff" : "#a1a1aa"} fontSize="10" textAnchor="middle" className="transition-all font-medium">{edge.label}</text>
                  </g>
                );
              })}
            </svg>
            {registry?.map(node => {
              const isSelected = selectedElement?.type === 'node' && selectedElement?.data?.id === node.id;
              return (
                <div key={node.id} onClick={(e) => { e.stopPropagation(); setSelectedElement({type: 'node', data: node}); }} style={{ left: node.x, top: node.y }} className={`absolute w-[240px] bg-black border ${isSelected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-zinc-700'} rounded-xl shadow-xl flex flex-col hover:border-blue-500/50 cursor-pointer transition-all`}>
                  <div className={`p-3 border-b ${isSelected ? 'border-blue-900/50' : 'border-zinc-800'} flex items-center justify-between transition-colors`}>
                    <span className={`text-[10px] ${isSelected ? 'text-blue-400' : 'text-zinc-500'} font-mono`}>{node.code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${node.classification === 'Crime Scene' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : node.classification === 'Victim' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-800' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                      {node.classification || node.type}
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-zinc-100">{node.name}</h4>
                    <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">CLASS: {node.classification === 'Crime Scene' ? 'RESTRICTED' : 'CONFIDENTIAL'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {selectedElement && (
        <div className="w-80 lg:w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col shrink-0 z-20">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
            <h3 className="font-semibold text-zinc-100">Selection Details</h3>
            <button onClick={() => setSelectedElement(null)} className="text-zinc-500 hover:text-white p-1 bg-zinc-900 rounded"><X size={16}/></button>
          </div>
          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-6">
            {selectedElement.type === 'node' && (
              <>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">{selectedElement.data.name}</h2>
                  <span className="text-xs font-mono text-blue-400 bg-blue-950/30 border border-blue-900/50 px-2.5 py-1 rounded">
                    {selectedElement.data.code} • {selectedElement.data.classification || selectedElement.data.type}
                  </span>
                </div>
                
                <div className="p-4 bg-black border border-zinc-800 rounded-xl">
                  <p className="text-sm text-zinc-300 leading-relaxed">{selectedElement.data.summary || "No detailed summary available for this entity in the current index."}</p>
                </div>
                
                {selectedElement.data.aliases && selectedElement.data.aliases.length > 0 && (
                  <div className="p-4 bg-black border border-zinc-800 rounded-xl">
                    <h4 className="text-[10px] text-zinc-500 font-semibold mb-2 uppercase tracking-wider">Known Aliases:</h4>
                    <p className="text-sm text-zinc-400">{selectedElement.data.aliases.join(", ")}</p>
                  </div>
                )}
                
                {selectedElement.data.sourceRefs && selectedElement.data.sourceRefs.length > 0 && (
                  <div>
                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3">Evidence Log References</h4>
                    <div className="p-4 bg-black border border-zinc-800 rounded-xl">
                      <a href="#" className="text-sm text-blue-400 font-mono hover:underline block break-all">{selectedElement.data.sourceRefs[0]}</a>
                      <p className="text-xs text-zinc-500 italic mt-3 border-l-2 border-zinc-800 pl-3">"Details cross-referenced from index log."</p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {selectedElement.type === 'edge' && (
              <>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">{selectedElement.data.label}</h2>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-950/30 border border-blue-900/50 px-2 py-1 rounded uppercase tracking-wider">
                    Relationship Vector
                  </span>
                </div>
                
                <div className="p-4 bg-black border border-zinc-800 rounded-xl">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Link established between <span className="font-semibold text-white">{selectedElement.from?.name}</span> and <span className="font-semibold text-white">{selectedElement.to?.name}</span>.
                  </p>
                </div>
                
                <div className="p-4 bg-black border border-zinc-800 rounded-xl flex items-center gap-3 text-zinc-400">
                  <Clock size={16} />
                  <span className="text-sm">Date Recorded: <span className="font-mono text-zinc-300">{new Date().toISOString().split('T')[0]}</span></span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelinePanel({ timeline }) {
  const [filter, setFilter] = useState("ALL");
  const filters = ["ALL", "Communications", "Surveillance", "Witness", "Forensics", "Interview"];

  return (
    <ContentPanel title="Chronological Reconstruction" icon={History} className="h-[75vh]">
      <div className="mb-6 p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-zinc-300 font-medium">
            <History size={20} className="text-blue-500"/>
            Event Reconstruction
          </div>
          <div className="flex items-center gap-1 bg-black border border-zinc-800 rounded-lg p-1">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === f || (filter === "ALL" && f === "ALL") ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors">
          <AlertTriangle size={14} /> Conflicts Only
        </button>
      </div>
      
      <div className="space-y-4">
        {timeline?.filter(t => filter === "ALL" || t.category === filter).map((t, idx) => (
          <div key={idx} className="flex flex-col p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl gap-2">
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-mono text-xs font-bold">{t.date} {t.time}</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded border bg-zinc-800/50 text-zinc-400 border-zinc-700">{t.category}</span>
            </div>
            <h4 className="font-bold text-zinc-200 text-lg mt-1">{t.title}</h4>
            <div className="flex items-center gap-2 mt-2">
              <FileText size={14} className="text-zinc-500"/>
              <span className="text-xs text-zinc-500">Source:</span>
              <span className="text-xs text-zinc-400 font-mono bg-black px-2 py-1 rounded border border-zinc-800">{t.source}</span>
            </div>
            {t.conflict && (
              <div className="mt-3 p-2 bg-red-950/30 border border-red-900/50 rounded flex gap-2 text-xs text-red-400">
                <AlertTriangle size={14} /> {t.conflictNote}
              </div>
            )}
          </div>
        ))}
      </div>
    </ContentPanel>
  );
}

function NotesPanel({ notes, onRefreshNotes }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Forensics");
  const [priority, setPriority] = useState("Medium");

  const handleCreate = async () => {
    if(!title || !content) return;
    await api.createNote({ title, content, category, priority, author: "Current User", refs: [] });
    setTitle(""); setContent("");
    await onRefreshNotes();
  };

  const handleTogglePin = async (id) => {
    await api.togglePinNote(id);
    await onRefreshNotes();
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-zinc-200 flex items-center gap-2 mb-4">
          <Edit3 size={18} className="text-blue-500"/> Draft New Note
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Note Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., DNA Corroboration on Glass E-03..." className="w-full bg-black border border-zinc-800 p-2.5 rounded-lg text-sm text-zinc-200 outline-none focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black border border-zinc-800 p-2.5 rounded-lg text-sm text-zinc-200 outline-none focus:border-blue-500">
                <option>Forensics</option><option>Interview</option><option>Surveillance</option><option>General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-black border border-zinc-800 p-2.5 rounded-lg text-sm text-zinc-200 outline-none focus:border-blue-500">
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Investigation Findings</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Record witness statements, evidence cross-references..." className="w-full bg-black border border-zinc-800 p-2.5 rounded-lg text-sm text-zinc-200 outline-none focus:border-blue-500 h-24 custom-scrollbar" />
          </div>
          <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mt-2">
            <div className="text-xs text-zinc-500 flex items-center gap-2">
              <span>Quick Tags:</span>
              <span className="px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800 hover:bg-zinc-800 cursor-pointer">#DNA</span>
              <span className="px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800 hover:bg-zinc-800 cursor-pointer">#Alibi</span>
            </div>
            <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
              Save Note to Case File
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes?.map(n => (
          <div key={n.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col">
            <div className="flex justify-between items-start mb-3 border-b border-zinc-800/50 pb-2">
              <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                {n.title}
                {n.pinned && <Pin size={12} className="text-blue-500" />}
              </h3>
              <button onClick={() => handleTogglePin(n.id)} className="text-zinc-500 hover:text-white">
                <Pin size={16} />
              </button>
            </div>
            <p className="text-sm text-zinc-300 flex-1">{n.content}</p>
            <div className="text-xs text-zinc-600 mt-4 flex justify-between">
              <span>{n.author}</span>
              <span>{new Date(n.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssistantPanel() {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userMsg = { role: "user", text: query };
    setChat(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await api.chatWithCopilot(userMsg.text);
      setChat(prev => [...prev, { role: "ai", text: res.response }]);
    } catch (err) {
      setChat(prev => [...prev, { role: "ai", text: "[ERROR] Connection failed." }]);
    } finally {
      setLoading(false);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 flex items-center gap-2">
        <Bot className="text-blue-500" size={20}/>
        <h3 className="font-bold text-zinc-200">SPARK Neural Copilot</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {chat.length === 0 && (
          <div className="text-center text-zinc-500 mt-10 text-sm">
            How can I assist with this investigation?
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-200'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 p-3 rounded-xl text-zinc-400">
              <Loader2 size={16} className="animate-spin" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
        <div className="flex gap-2">
          <input 
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Copilot about suspects, timelines, or evidence..." 
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
          <button onClick={handleSend} disabled={loading} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// App Entry
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCrtOverlayEnabled, setIsCrtOverlayEnabled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  const [user, setUser] = useState({ name: "Inspector Arjun Mehta", email: "mehta.a@police.gov", initials: "AM", role: "Lead Investigator" });

  const [caseInfo, setCaseInfo] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [registry, setRegistry] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [ci, tl, reg, docs, nts, grf] = await Promise.all([
        api.fetchCaseInfo(), api.fetchTimeline(), api.fetchRegistry(), 
        api.fetchDocuments(), api.fetchNotes(), api.fetchGraph()
      ]);
      setCaseInfo(ci); setTimeline(tl); setRegistry(reg); 
      setDocuments(docs); setNotes(nts); setGraphData(grf);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return <div className="h-screen bg-black flex flex-col items-center justify-center text-blue-500 gap-4"><Loader2 className="animate-spin" size={32}/> Loading SPARK Intelligence System...</div>;
  }

  return (
    <div className={`min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 relative ${isCrtOverlayEnabled ? "before:pointer-events-none before:absolute before:inset-0 before:z-50 before:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] before:bg-[length:100%_4px]" : ""}`}>
      <header className="flex items-center justify-between px-6 py-3.5 bg-black border-b border-zinc-800 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
            <Shield size={20} />
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
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-blue-500/50 px-3 py-1.5 rounded-lg text-sm transition-all shadow-sm group"
            title="Quick Search (Ctrl+K)"
          >
            <Search size={15} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
            <span className="hidden sm:inline">Search Index</span>
            <kbd className="hidden md:inline-block bg-black px-1.5 py-0.5 text-[10px] text-zinc-500 border border-zinc-800 rounded font-mono">⌘K</kbd>
          </button>

          <button
            onClick={() => setIsCrtOverlayEnabled(!isCrtOverlayEnabled)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-sm transition-all shadow-sm ${
              isCrtOverlayEnabled ? "bg-blue-900/20 text-blue-400 border-blue-500/50" : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
            title="Toggle CRT Overlay"
          >
            <Tv size={15} />
            <span>CRT Mode</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-lg text-sm transition-all shadow-sm"
          >
            <Download size={15} className="text-zinc-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <div className="h-6 w-px bg-zinc-800 mx-1"></div>

          <SecurityBadge code="LES" />

          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-3 hover:bg-zinc-900/80 rounded-lg px-2 py-1 transition-all text-left ml-1"
          >
            <div className="leading-tight hidden md:block text-right">
              <div className="text-sm font-semibold text-zinc-200">{user.name}</div>
              <div className="text-[11px] text-zinc-500">{user.role}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold shadow-sm">
              {user.initials}
            </div>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
        <PageHeader tab={activeTab} caseCode={caseInfo?.code} />

        {activeTab === "overview" && <OverviewPanel caseInfo={caseInfo} timelineLogs={timeline} onNavigate={setActiveTab} />}
        {activeTab === "pipeline" && <EvidencePipelinePanel documents={documents} onRefreshDocs={loadData} />}
        {activeTab === "registry" && <RegistryPanel registry={registry} />}
        {activeTab === "graph" && <GraphPanel graphData={graphData} registry={registry} />}
        {activeTab === "timeline" && <TimelinePanel timeline={timeline} />}
        {activeTab === "notes" && <NotesPanel notes={notes} onRefreshNotes={loadData} />}
        {activeTab === "assistant" && <AssistantPanel />}
      </main>

      <NavigationMenu active={activeTab} setActive={setActiveTab} />
      
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={setActiveTab} registry={registry} />
      <ExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} caseInfo={caseInfo} />
      <UserConfigurationModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} user={user} setUser={setUser} />
    </div>
  );
}