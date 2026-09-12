import React from 'react';
import { Shield } from 'lucide-react';

const SecurityBadge = ({ label = 'CLASSIFIED', level = 'default' }) => {
  const colorMap = {
    critical: 'bg-red-950/30 text-red-500 border-red-900/40',
    warning: 'bg-amber-950/30 text-amber-500 border-amber-900/40',
    info: 'bg-blue-950/30 text-blue-400 border-blue-900/40',
    success: 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40',
    default: 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50',
  };
  const classes = colorMap[level] || colorMap.default;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded border font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${classes}`}>
      <Shield size={12} />
      {label}
    </div>
  );
};

export default SecurityBadge;
