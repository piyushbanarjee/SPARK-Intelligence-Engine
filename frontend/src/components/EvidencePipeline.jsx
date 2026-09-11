import React, { useRef, useState } from 'react';
import { UploadCloud, File, CheckCircle, Clock } from 'lucide-react';
import { uploadEvidence } from '../api/client';

const EvidencePipeline = ({ caseId }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadError, setUploadError] = useState(null);
  const [archive, setArchive] = useState([]);

  const handleSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      if (!caseId) {
        alert("No active case to upload evidence to.");
        return;
      }

      setUploadStatus('uploading');
      setUploadError(null);
      
      try {
        await uploadEvidence(caseId, file);
        setUploadStatus('success');
        
        // Add to the local archive table for visual feedback
        setArchive(prev => [
          {
            id: Date.now(),
            name: file.name,
            status: 'Processed',
            date: new Date().toLocaleString()
          },
          ...prev
        ]);
        
        // Reset input so the same file can be selected again if needed
        e.target.value = null;
        
        // Auto-clear success state after a few seconds
        setTimeout(() => {
          setUploadStatus('idle');
          setSelectedFile(null);
        }, 3000);
      } catch (error) {
        console.error(error);
        const errorDetail = error.response?.data?.detail || error.message || "Failed to upload evidence. Check connection.";
        // FastAPI sometimes returns detail as an array of validation errors
        const errorMsg = Array.isArray(errorDetail) ? JSON.stringify(errorDetail) : errorDetail;
        setUploadError(errorMsg);
        setUploadStatus('error');
      }
    }
  };

  return (
    <div className="flex-1 overflow-auto pt-24 pb-32">
      <div className="max-w-5xl mx-auto px-6 space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Evidence Pipeline</h2>
          <p className="text-neutral-400">Ingest unstructured text and image artifacts into the intelligence engine.</p>
        </div>

        {/* Dropzone */}
        <div className="bg-neutral-900/80 border-2 border-dashed border-neutral-700 hover:border-blue-500/50 transition-colors rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <UploadCloud className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Evidence Ingestion Dropzone</h3>
          <p className="text-sm text-neutral-400 max-w-sm mb-6">
            Supported formats: .txt (Raw Text) and .png, .jpg, .jpeg (Optical Character Recognition)
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".txt,.png,.jpg,.jpeg" 
            className="hidden" 
          />
          
          <button 
            onClick={handleSelectClick}
            disabled={uploadStatus === 'uploading' || !caseId}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-neutral-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            {uploadStatus === 'uploading' ? 'Uploading & Processing...' : 'Select File to Upload'}
          </button>

          {uploadStatus === 'success' && (
            <div className="mt-4 text-green-500 text-sm font-medium flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>File successfully ingested into the intelligence graph.</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mt-6 text-red-500 text-sm font-medium flex items-start space-x-2 bg-red-950/50 p-4 rounded-xl border border-red-900 w-full max-w-md text-left">
              <span className="break-words w-full">{uploadError}</span>
            </div>
          )}
        </div>

        {/* Ingested Documents Archive */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Ingested Documents Archive</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-400 bg-neutral-950/50 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">File Name</th>
                  <th className="px-6 py-3 font-medium">Ingestion Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {archive.map((doc) => (
                  <tr key={doc.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 text-white font-medium flex items-center space-x-3">
                      <File className="w-4 h-4 text-neutral-400" />
                      <span>{doc.name}</span>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">{doc.date}</td>
                    <td className="px-6 py-4">
                      {doc.status === 'Processed' ? (
                        <span className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-green-400 bg-green-400/10 rounded-full border border-green-400/20 w-max">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Processed</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-blue-400 bg-blue-400/10 rounded-full border border-blue-400/20 w-max">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Processing</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {archive.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-neutral-500">
                      No documents ingested yet. Upload above to populate archive.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EvidencePipeline;
