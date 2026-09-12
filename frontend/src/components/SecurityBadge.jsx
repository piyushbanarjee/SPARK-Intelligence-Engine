import React from 'react';

const SecurityBadge = ({ label = "CLASSIFIED", level = "default" }) => {
  const colorMap = {
    critical: 'bg-red-900/60 text-red-400 border-red-800',
    warning: 'bg-yellow-900/60 text-yellow-400 border-yellow-800',
    success: 'bg-green-900/60 text-green-400 border-green-800',
    info: 'bg-cyan-900/60 text-cyan-400 border-cyan-800',
    default: 'bg-gray-800/60 text-gray-400 border-gray-700',
  };

  const classes = colorMap[level] || colorMap.default;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.15em] border ${classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {label}
    </span>
  );
};

export default SecurityBadge;

