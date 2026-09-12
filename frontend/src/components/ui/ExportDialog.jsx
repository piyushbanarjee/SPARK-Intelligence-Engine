import { useState } from 'react';
import { X, FileJson, FileText } from 'lucide-react';

const triggerFileDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  try {
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
  } finally {
    URL.revokeObjectURL(url);
    if (a.parentNode) document.body.removeChild(a);
  }
};

const ExportDialog = ({ isOpen, onClose, data, filenameBase = 'spark_export' }) => {
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const handleExport = (format) => {
    try {
      let blob, ext;
      if (format === 'json') {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        ext = '.json';
      } else {
        const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        blob = new Blob([text], { type: 'text/plain' });
        ext = '.txt';
      }
      triggerFileDownload(blob, `${filenameBase}${ext}`);
      setStatus('Export complete');
      setTimeout(() => { setStatus(null); onClose(); }, 1200);
    } catch {
      setStatus('Export failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Export Data</h3>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleExport('json')} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-blue-800 hover:bg-blue-950/20 transition-all group">
            <FileJson size={24} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
            <span className="text-xs font-mono text-zinc-500 group-hover:text-blue-400">.JSON</span>
          </button>
          <button onClick={() => handleExport('txt')} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-emerald-800 hover:bg-emerald-950/20 transition-all group">
            <FileText size={24} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            <span className="text-xs font-mono text-zinc-500 group-hover:text-emerald-400">.TXT</span>
          </button>
        </div>
        {status && <p className="text-xs text-center mt-4 font-mono text-zinc-500">{status}</p>}
      </div>
    </div>
  );
};

export default ExportDialog;
