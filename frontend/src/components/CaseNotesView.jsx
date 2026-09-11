import React, { useState, useEffect } from 'react';
import { FileText, Save, Clock, Tag, ShieldAlert } from 'lucide-react';
import { getNotes, createNote } from '../api/client';

const CaseNotesView = ({ caseId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Forensics');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const fetchNotes = async () => {
    if (!caseId) return;
    setLoading(true);
    setIsOffline(false);
    setError(null);
    try {
      const data = await getNotes(caseId);
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 404) {
        setIsOffline(true);
      } else {
        setError('Failed to fetch case notes from backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [caseId]);

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!caseId) {
      setSaveError("No active case to attach notes to.");
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    const payload = {
      content: `[${category.toUpperCase()}] ${title}\n\n${content}`,
      author_id: "123e4567-e89b-12d3-a456-426614174000" 
    };

    try {
      await createNote(caseId, payload);
      setTitle('');
      setContent('');
      fetchNotes(); 
    } catch (err) {
      if (err.response?.status === 404) {
        setSaveError("Backend notes module is currently offline (404).");
      } else {
        setSaveError(err.response?.data?.detail || "Failed to save note.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isOffline) {
    return (
      <div className="flex-1 overflow-auto pt-24 pb-32 flex items-center justify-center">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500 shadow-xl max-w-lg mx-6">
          <ShieldAlert className="w-12 h-12 text-blue-500 mb-4 opacity-80 mx-auto" />
          <h3 className="text-lg font-bold text-white mb-2">Module Offline</h3>
          <p>The backend Case Notes pipeline is currently pending initialization. Awaiting Python endpoint integration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Case Notes & Findings</h2>
          <p className="text-neutral-400">Document investigation progress, forensic results, and hypothesis.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Draft New Note */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 shadow-xl sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>Draft New Note</span>
              </h3>
              
              <form onSubmit={handleSaveNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Note Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g. Server Logs Analysis"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Category</label>
                  <div className="relative">
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option>Forensics</option>
                      <option>Interview</option>
                      <option>Hypothesis</option>
                      <option>Surveillance</option>
                      <option>General</option>
                    </select>
                    <Tag className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Investigation Findings</label>
                  <textarea 
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Document your findings here..."
                  />
                </div>

                {saveError && (
                  <div className="text-red-500 text-sm font-medium bg-red-950/50 p-3 rounded-lg border border-red-900">
                    {saveError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSaving || !caseId}
                  className="w-full flex items-center justify-center space-x-2 py-3 mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-neutral-400 text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save to Case File'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Case Notes Feed */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-neutral-400 p-8 text-center bg-neutral-900/50 rounded-xl border border-neutral-800">
                Fetching case notes...
              </div>
            ) : error ? (
              <div className="text-red-500 p-8 text-center bg-red-950/50 rounded-xl border border-red-900">
                {error}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-neutral-500 p-12 text-center bg-neutral-900/50 rounded-xl border border-neutral-800">
                No notes documented yet. Draft a new note to begin.
              </div>
            ) : (
              notes.map((note) => {
                const parts = note.content.split('\n\n');
                const titlePart = parts.length > 1 ? parts[0] : 'Case Note';
                const contentPart = parts.length > 1 ? parts.slice(1).join('\n\n') : note.content;

                return (
                  <div key={note.id} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 transition-all hover:border-neutral-700">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-white">{titlePart}</h4>
                      <div className="flex items-center space-x-1.5 text-xs text-neutral-500 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-neutral-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {contentPart}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CaseNotesView;
