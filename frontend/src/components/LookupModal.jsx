import React, { useState, useEffect, useRef } from 'react';

const MOCK_RESULTS = [
  { category: 'Cases', items: ['Live Session — ADYPU Demo', 'Operation Nightfall'] },
  { category: 'Evidence', items: ['forensic_report.pdf', 'surveillance_capture.png'] },
  { category: 'Notes', items: ['Suspect identified near sector 7', 'Chain of custody updated'] },
];

const LookupModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = MOCK_RESULTS.map(group => ({
    category: group.category,
    items: group.items.filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter(group => group.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-800">
          <span className="text-gray-500 mr-3 text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search cases, evidence, notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 text-sm outline-none font-mono"
          />
          <kbd className="text-[10px] text-gray-600 border border-gray-700 rounded px-1.5 py-0.5 font-mono ml-2">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6 font-mono">
              No intelligence matches found.
            </p>
          ) : (
            filtered.map(group => (
              <div key={group.category} className="mb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-3 py-1.5">
                  {group.category}
                </p>
                {group.items.map((item, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-cyan-400 transition-colors font-mono truncate"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LookupModal;

