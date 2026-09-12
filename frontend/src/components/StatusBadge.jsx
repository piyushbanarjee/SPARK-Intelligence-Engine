import React from 'react';

const StatusBadge = ({ status = "inactive" }) => {
  const config = {
    active: { color: 'bg-green-500', text: 'text-green-400', label: 'ACTIVE' },
    processing: { color: 'bg-yellow-500', text: 'text-yellow-400', label: 'PROCESSING' },
    error: { color: 'bg-red-500', text: 'text-red-400', label: 'ERROR' },
    inactive: { color: 'bg-gray-600', text: 'text-gray-400', label: 'INACTIVE' },
    synced: { color: 'bg-cyan-500', text: 'text-cyan-400', label: 'SYNCED' },
  };

  const { color, text, label } = config[status] || config.inactive;

  return (
    <span className={`inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold uppercase tracking-wider ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color} ${status === 'processing' ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;

