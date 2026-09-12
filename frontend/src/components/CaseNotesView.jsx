import React, { useState, useEffect } from 'react';
import { apiClient } from '../api.js';

const CaseNotesView = ({ caseId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (!caseId) return;

    const fetchNotes = async () => {
      try {
        const data = await apiClient.getNotes(caseId);
        setNotes(data);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      }
    };

    fetchNotes();
  }, [caseId]);

  const handleSave = async () => {
    if (!newNote.trim() || !caseId) return;

    try {
      const response = await apiClient.createNote(caseId, newNote);
      setNotes(prev => [response, ...(prev || [])]);
      setNewNote("");
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg shadow-xl border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-cyan-400">Tactical Notes</h3>
      
      <div className="mb-6 flex flex-col items-end">
        <textarea
          className="w-full bg-gray-800 text-gray-200 border border-gray-600 rounded p-3 mb-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
          rows="3"
          placeholder="Enter intelligence log or tactical note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button
          onClick={handleSave}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-6 rounded transition-colors"
        >
          Log Note
        </button>
      </div>

      <div className="space-y-4">
        {notes?.map(note => (
          <div key={note.id} className="bg-gray-800 p-4 rounded border border-gray-700 shadow">
            <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
            <div className="text-xs text-gray-500 mt-3 text-right">
              {new Date(note.created_at).toLocaleString()}
            </div>
          </div>
        ))}
        
        {(!notes || notes.length === 0) && (
          <p className="text-gray-500 italic text-center py-4">No tactical notes recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default CaseNotesView;

