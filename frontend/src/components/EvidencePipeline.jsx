import React, { useState, useEffect } from 'react';
import { apiClient } from '../api.js';

const EvidencePipeline = ({ caseId }) => {
  const [evidence, setEvidence] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    const fetchEvidence = async () => {
      try {
        const data = await apiClient.getEvidence(caseId);
        setEvidence(data);
      } catch (error) {
        console.error("Failed to fetch evidence:", error);
      }
    };
    fetchEvidence();
  }, [caseId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !caseId) return;
    setUploading(true);
    try {
      const newEvidence = await apiClient.uploadEvidence(caseId, file);
      setEvidence(prev => [newEvidence, ...(prev || [])]);
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg shadow-xl border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-cyan-400">Intelligence Ingestion</h3>
      <form onSubmit={handleUpload} className="mb-8 flex items-center gap-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="bg-gray-800 text-gray-300 border border-gray-600 rounded p-2 flex-1"
        />
        <button
          type="submit"
          disabled={uploading || !file}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded transition-colors"
        >
          {uploading ? 'Processing OCR...' : 'Upload File'}
        </button>
      </form>
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Ingested Archives</h4>
        {evidence?.map(item => (
          <div key={item.id} className="bg-gray-800 p-4 rounded border border-gray-700 shadow flex justify-between items-center">
            <div>
              <p className="font-semibold text-cyan-300">{item.file_name}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(item.uploaded_at).toLocaleString()}</p>
            </div>
            <div className="text-xs bg-gray-900 px-3 py-1 rounded text-gray-400 border border-gray-700">
              {item.extracted_text ? 'OCR Extracted' : 'Pending'}
            </div>
          </div>
        ))}
        {(!evidence || evidence.length === 0) && (
          <p className="text-gray-500 italic py-4">No evidence files uploaded to this session.</p>
        )}
      </div>
    </div>
  );
};

export default EvidencePipeline;