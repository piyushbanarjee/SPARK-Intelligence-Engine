import React from 'react';
import { Activity } from 'lucide-react';

const OverviewPanel = ({ caseId }) => {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl flex items-center gap-5 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
          <Activity size={24} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-zinc-100">Session ID: {caseId}</span>
            <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">Active</span>
          </div>
          <div className="text-sm text-zinc-400 mt-1">
            Data aggregation and extraction engine online.
          </div>
        </div>
      </div>
      <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
        Overview metrics awaiting API aggregation endpoints.
      </div>
    </div>
  );
};

export default OverviewPanel;