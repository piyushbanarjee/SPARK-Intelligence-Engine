import React from 'react';

const StatusBadge = ({ status }) => {
  const isOnline = status?.toLowerCase() === 'online' || status?.toLowerCase() === 'active' || status?.toLowerCase() === 'success';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border ${
      isOnline
        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
        : 'bg-red-950/40 text-red-400 border-red-800/50'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
