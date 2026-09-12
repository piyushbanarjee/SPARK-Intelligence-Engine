import React, { useState, useEffect } from 'react';
import { Pin, PinOff, Tag, Trash2 } from 'lucide-react';

import { apiClient } from '../../api.js';

const QUICK_TAGS = ['[E-01 Phone]', '[E-02 CCTV]', '[E-03 Document]', '[P-01 Suspect]', '[L-01 Location]'];

const InvestigationNotesPanel = ({ caseId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (!caseId) return;
    const fetchNotes = async () => {
      try {
        const data = await apiClient.getNotes(caseId);
        // Map backend to component model
        const formatted = Array.isArray(data) ? data.map(n => ({
          id: n.id,
          content: n.content,
          pinned: false,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        })) : [];
        setNotes(formatted);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      }
    };
    fetchNotes();
  }, [caseId]);

  const handleSave = async () => {
    if (!newNote.trim() || !caseId) return;
    try {
      const created = await apiClient.createNote(caseId, newNote.trim());
      const note = {
        id: created.id,
        content: created.content,
        pinned: false,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setNotes(prev => [note, ...prev]);
      setNewNote('');
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const togglePin = (id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const deleteNote = (id) => {
    // Note: Assuming there is no deleteNote in api.js currently, just remove locally or if there is, add it.
    // apiClient.deleteNote(id) ...
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const appendTag = (tag) => {
    setNewNote(prev => (prev ? `${prev} ${tag}` : tag));
  };

  // Sort: pinned first, then by most recent
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.id - a.id;
  });

  return (
    <div className="p-6 space-y-5">
      {/* Quick Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tag size={12} className="text-zinc-600" />
        {QUICK_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => appendTag(tag)}
            className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-blue-400 hover:border-blue-900/50 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Enter investigation note..."
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 resize-none font-mono"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
          >
            Log Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-2">
        {sortedNotes?.map(note => (
          <div key={note.id} className={`group relative px-4 py-3 rounded-lg border transition-colors ${
            note.pinned
              ? 'bg-blue-950/10 border-blue-900/30'
              : 'bg-zinc-950/50 border-zinc-800/50 hover:border-zinc-700'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-zinc-300 whitespace-pre-wrap flex-1 font-mono">{note.content}</p>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => togglePin(note.id)} className="p-1 text-zinc-600 hover:text-blue-400 transition-colors">
                  {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </button>
                <button onClick={() => deleteNote(note.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono mt-2">{note.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestigationNotesPanel;
