import React from 'react';

const ContentPanel = ({ title, icon, headerRight, children }) => {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-cyan-500 text-sm">{icon}</span>}
          <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400">
            {title}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {headerRight}
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Module Active" />
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default ContentPanel;

