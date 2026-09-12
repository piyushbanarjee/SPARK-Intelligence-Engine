import React from 'react';

const NavigationMenu = ({ tabs, activeTab, onTabChange }) => {
  const iconMap = {
    evidence: '📁',
    notes: '📝',
    chat: '🤖',
    graph: '🔗',
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center space-x-1 px-3 py-2 rounded-2xl border border-gray-700/50 bg-gray-900/70 backdrop-blur-xl shadow-2xl shadow-black/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-500/15 text-cyan-400 shadow-inner shadow-cyan-500/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            <span>{iconMap[tab.id] || '◆'}</span>
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <button
          className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all font-mono"
          title="Lookup (Cmd+K)"
        >
          <span>⌘K</span>
        </button>
      </div>
    </nav>
  );
};

export default NavigationMenu;

