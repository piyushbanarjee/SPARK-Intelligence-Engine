import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileText, Image, File, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../api.js';

const EvidencePipelinePanel = ({ caseId }) => {
  const [documents, setDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchEvidence = useCallback(async () => {
    if (!caseId) return;
    try {
      const data = await apiClient.getEvidence(caseId);
      // Map backend evidence format to component format
      const formattedDocs = data.map(ev => ({
        name: ev.file_name,
        type: ev.file_name.split('.').pop().toUpperCase(),
        size: 'Unknown',
        status: 'processed'
      }));
      setDocuments(formattedDocs);
    } catch (err) {
      console.error("Failed to fetch evidence:", err);
    }
  }, [caseId]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleDrag = (e, entering) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(entering);
  };

  const handleUpload = async (file) => {
    if (!caseId) return;
    // Optimistic UI update
    const newDoc = {
      name: file.name,
      type: file.name.split('.').pop().toUpperCase(),
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'processing'
    };
    setDocuments(prev => [newDoc, ...prev]);

    try {
      await apiClient.uploadEvidence(caseId, file);
      fetchEvidence(); // Refresh list to get accurate status/data
    } catch (err) {
      console.error("Upload failed:", err);
      // Mark as error
      setDocuments(prev => prev.map(doc => 
        doc.name === file.name ? { ...doc, status: 'error' } : doc
      ));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleUpload(files[0]);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const getFileIcon = (name) => {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg'].includes(ext)) return Image;
    if (['pdf', 'txt', 'docx'].includes(ext)) return FileText;
    return File;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Drop Zone */}
      <div
        onDragEnter={e => handleDrag(e, true)}
        onDragLeave={e => handleDrag(e, false)}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-950/20'
            : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/30'
        }`}
      >
        <Upload size={32} className={`mx-auto mb-3 ${isDragging ? 'text-blue-400' : 'text-zinc-600'}`} />
        <p className="text-sm text-zinc-400 font-medium">Drop evidence files here or click to browse</p>
        <p className="text-[10px] text-zinc-600 font-mono mt-2 uppercase tracking-wider">
          Supported: PDF · DOCX · TXT · PNG · JPG
        </p>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" />
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 px-1">Ingested Documents</p>
          {documents.map((doc, i) => {
            const Icon = getFileIcon(doc.name);
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg hover:border-zinc-700 transition-colors">
                <Icon size={16} className="text-zinc-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 font-medium truncate">{doc.name}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">{doc.type} · {doc.size}</p>
                </div>
                <div className="shrink-0">
                  {doc.status === 'processed' ? (
                    <CheckCircle size={16} className="text-emerald-500" />
                  ) : doc.status === 'error' ? (
                    <AlertTriangle size={16} className="text-red-500" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-zinc-700 border-t-blue-400 rounded-full animate-spin" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EvidencePipelinePanel;