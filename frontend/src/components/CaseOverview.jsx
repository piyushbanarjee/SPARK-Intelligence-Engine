import React from 'react';
import { Network, FileText, AlertCircle, CheckCircle2, UserX, User, FolderSearch } from 'lucide-react';

const CaseOverview = ({ cases }) => {
  if (!cases || cases.length === 0) {
    return (
      <div className="flex-1 overflow-auto pt-24 pb-32 flex items-center justify-center">
        <div className="text-neutral-400 text-lg font-medium">No Active Cases</div>
      </div>
    );
  }

  const activeCase = cases[0];

  return (
    <div className="flex-1 overflow-auto pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* 4-Column Top Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
            title="Case Disposition" 
            value={activeCase.status}
            valueClass="text-green-500 capitalize"
          />
          <StatCard 
            icon={<User className="w-5 h-5 text-blue-500" />}
            title="Primary Victim" 
            value="Classified" 
          />
          <StatCard 
            icon={<UserX className="w-5 h-5 text-red-500" />}
            title="Principal Suspect" 
            value="Unknown Entity" 
            valueClass="text-red-500"
          />
          <StatCard 
            icon={<FolderSearch className="w-5 h-5 text-purple-500" />}
            title="Key Evidence" 
            value="14 Artifacts" 
          />
        </div>

        {/* Central Case ID / Title Banner */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold tracking-tight">
                {activeCase.id}
              </h2>
            </div>
            <p className="text-neutral-400 max-w-2xl">
              {activeCase.title}: {activeCase.description}
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center space-x-4">
            <button className="flex items-center px-6 py-3 space-x-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <Network className="w-4 h-4" />
              <span>Link Graph</span>
            </button>
            <button className="flex items-center px-6 py-3 space-x-2 text-sm font-semibold border border-neutral-700 hover:bg-neutral-800 text-neutral-300 rounded-lg transition-colors">
              <FileText className="w-4 h-4" />
              <span>Case Notes</span>
            </button>
          </div>
        </div>

        {/* 2-Column Bottom Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Audit & Investigation Log */}
          <div className="lg:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-white">Audit & Investigation Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-400 bg-neutral-950/50 uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Timestamp</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                    <th className="px-6 py-3 font-medium">Operator</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  <tr className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 text-neutral-400">{new Date(activeCase.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-white">Case Initialized</td>
                    <td className="px-6 py-4 text-neutral-300">SYS_ADMIN</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs text-green-400 bg-green-400/10 rounded-full border border-green-400/20">Success</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Case Metadata */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Case Metadata</h3>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 uppercase font-medium">Jurisdiction</span>
                <span className="text-sm text-neutral-300 mt-1">Global/Cyber</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 uppercase font-medium">Clearance Level</span>
                <span className="text-sm text-purple-400 mt-1 font-semibold">Top Secret / SCI</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 uppercase font-medium">Lead Investigator</span>
                <span className="text-sm text-neutral-300 mt-1">Agent K. Vance</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, valueClass = "text-white" }) => {
  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800">
          {icon}
        </div>
        <span className="text-sm text-neutral-400 font-medium">{title}</span>
      </div>
      <div className={`text-xl font-bold ${valueClass}`}>
        {value}
      </div>
    </div>
  );
};

export default CaseOverview;
