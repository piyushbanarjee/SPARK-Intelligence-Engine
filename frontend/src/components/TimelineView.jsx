import React from 'react';
import { Clock } from 'lucide-react';

const TimelineView = ({ caseId }) => {
  return (
    <div className="flex-1 overflow-auto pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Chronological Timeline</h2>
          <p className="text-neutral-400">Events sequenced by temporal occurrence.</p>
        </div>
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500 shadow-xl">
           <Clock className="w-8 h-8 mx-auto mb-4 opacity-50 text-blue-500" />
           <p>Timeline visualization module is pending temporal entity extraction.</p>
           <p className="text-xs mt-2 opacity-50">Please ingest evidence with timestamps to populate this view.</p>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
