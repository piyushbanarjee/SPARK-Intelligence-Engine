import React from 'react';
import { Activity } from 'lucide-react';

const PlaceholderView = ({ title }) => {
  return (
    <div className="flex-1 overflow-auto pt-24 pb-32 flex items-center justify-center">
      <div className="max-w-xl w-full mx-6 p-12 bg-neutral-900/50 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm">
        <Activity className="w-12 h-12 text-blue-500/50 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white mb-2">Module: {title}</h2>
        <p className="text-neutral-500">This module is currently offline or initializing. Please check back later.</p>
      </div>
    </div>
  );
};

export const RegistryView = () => <PlaceholderView title="Registry" />;
export const LinkAnalysisView = () => <PlaceholderView title="Link Analysis" />;
export const TimelineView = () => <PlaceholderView title="Timeline" />;
export const AIAssistantView = () => <PlaceholderView title="AI Assistant" />;
