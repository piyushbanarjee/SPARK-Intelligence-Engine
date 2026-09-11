import React, { useState } from 'react';
import { User, Search, Download, LogOut, AlertTriangle, X } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <>
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md fixed w-full top-0 z-40">
        <div className="flex items-center">
          <h1 className="text-xl font-bold tracking-widest text-white">SPARK ENTERPRISE</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsSystemModalOpen(true)} className="flex items-center px-4 py-2 space-x-2 text-sm font-medium transition-colors border rounded-md text-neutral-300 border-neutral-700 hover:bg-neutral-800 hover:text-white">
            <Search className="w-4 h-4" />
            <span>Search Index</span>
          </button>
          <button onClick={() => setIsSystemModalOpen(true)} className="flex items-center px-4 py-2 space-x-2 text-sm font-medium transition-colors border rounded-md text-neutral-300 border-neutral-700 hover:bg-neutral-800 hover:text-white">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 hover:border-blue-500 transition-colors"
          >
            <User className="w-5 h-5 text-neutral-400" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50 py-2">
              <div className="px-4 py-3 border-b border-neutral-800">
                <p className="text-sm text-white font-medium">Active Operative</p>
                <p className="text-xs text-neutral-400 truncate">Clearance: Level 4</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-neutral-800 hover:text-red-400 transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <nav className="flex items-center space-x-1 p-1 rounded-full backdrop-blur-md bg-neutral-900/90 border border-neutral-700 shadow-2xl">
          <NavTab label="Overview" id="overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavTab label="Evidence Pipeline" id="evidence" active={activeTab === 'evidence'} onClick={() => setActiveTab('evidence')} />
          <NavTab label="Registry" id="registry" active={activeTab === 'registry'} onClick={() => setActiveTab('registry')} />
          <NavTab label="Link Analysis" id="link_analysis" active={activeTab === 'link_analysis'} onClick={() => setActiveTab('link_analysis')} />
          <NavTab label="Timeline" id="timeline" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
          <NavTab label="Case Notes" id="case_notes" active={activeTab === 'case_notes'} onClick={() => setActiveTab('case_notes')} />
          <NavTab label="AI Assistant" id="ai_assistant" active={activeTab === 'ai_assistant'} onClick={() => setActiveTab('ai_assistant')} />
        </nav>
      </div>

      {/* System Modal Overlay */}
      {isSystemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-blue-900 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(30,58,138,0.3)] relative">
            <button 
              onClick={() => setIsSystemModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-12 h-12 rounded-full bg-blue-950/50 border border-blue-900 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">System Module Offline</h3>
              <p className="text-sm text-neutral-400">
                Waiting for Elasticsearch integration to enable this functionality.
              </p>
              <button 
                onClick={() => setIsSystemModalOpen(false)}
                className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors w-full"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const NavTab = ({ label, active = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
        active
          ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
      }`}
    >
      {label}
    </button>
  );
};

export default Navigation;
