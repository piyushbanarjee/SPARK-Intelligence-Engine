import React from 'react';

const ContentPanel = ({ title, icon: Icon, headerRight, children, className = '' }) => {
  return (
    <div className={`bg-zinc-950/50 border border-zinc-800/50 rounded-lg overflow-hidden ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon size={16} className="text-zinc-500" />}
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
              {title}
            </h3>
          </div>
          {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
        </div>
      )}
      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {children}
      </div>
    </div>
  );
};

export default ContentPanel;
