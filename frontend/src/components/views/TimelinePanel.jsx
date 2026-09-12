import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { apiClient } from '../../api.js';

const TimelinePanel = ({ caseId }) => {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (!caseId) return;
    const fetchTimeline = async () => {
      try {
        const data = await apiClient.getTimeline(caseId);
        setTimeline(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch timeline:", err);
      }
    };
    fetchTimeline();
  }, [caseId]);

  return (
    <div className="p-6 space-y-1">
      {timeline?.map((log, i) => {
        const isAnomaly = log.type === 'conflict' || log.type === 'anomaly';
        return (
          <div
            key={i}
            className={`flex items-start gap-4 px-4 py-3 rounded-lg transition-colors ${
              isAnomaly
                ? 'bg-red-950/10 border border-red-900/30'
                : 'hover:bg-zinc-900/30 border border-transparent'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isAnomaly ? (
                <AlertTriangle size={14} className="text-red-500" />
              ) : log.type === 'success' ? (
                <CheckCircle size={14} className="text-emerald-500" />
              ) : (
                <Info size={14} className="text-zinc-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${isAnomaly ? 'text-red-300' : 'text-zinc-300'}`}>{log.message}</p>
              {log.detail && <p className="text-xs text-zinc-600 mt-0.5">{log.detail}</p>}
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
              <Clock size={10} />
              {log.timestamp}
            </div>
          </div>
        );
      })}
      {timeline?.length === 0 && (
        <p className="text-zinc-600 text-sm text-center py-10 font-mono">No timeline events recorded.</p>
      )}
    </div>
  );
};

export default TimelinePanel;
