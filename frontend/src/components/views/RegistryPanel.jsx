import React, { useState, useEffect } from 'react';
import { X, User, Building, Phone, MapPin, Hash } from 'lucide-react';
import { apiClient } from '../../api.js';

const TYPE_ICONS = { person: User, organization: Building, phone: Phone, location: MapPin };

const RegistryPanel = ({ caseId }) => {
  const [registry, setRegistry] = useState([]);
  const [inspectedEntity, setInspectedEntity] = useState(null);

  useEffect(() => {
    if (!caseId) return;
    const fetchRegistry = async () => {
      try {
        const data = await apiClient.getRegistry(caseId);
        setRegistry(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch registry:", err);
      }
    };
    fetchRegistry();
  }, [caseId]);

  return (
    <div className="relative">
      <div className="p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800/50">
              <th className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-zinc-600">ID</th>
              <th className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-zinc-600">Name</th>
              <th className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-zinc-600">Type</th>
              <th className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-zinc-600">Risk</th>
            </tr>
          </thead>
          <tbody>
            {registry?.map(entity => {
              const Icon = TYPE_ICONS[entity.type] || Hash;
              return (
                <tr
                  key={entity.id}
                  onClick={() => setInspectedEntity(entity)}
                  className="border-b border-zinc-800/30 hover:bg-zinc-900/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-mono text-zinc-500">{entity.id}</td>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-zinc-600" />
                      {entity.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-zinc-500 uppercase">{entity.type}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      entity.risk === 'high' ? 'bg-red-950/40 text-red-400' :
                      entity.risk === 'medium' ? 'bg-amber-950/40 text-amber-400' :
                      'bg-emerald-950/40 text-emerald-400'
                    }`}>{entity.risk}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Slide-out Inspector Panel */}
      {inspectedEntity && (
        <div className="absolute inset-y-0 right-0 w-80 bg-zinc-950 border-l border-zinc-800 shadow-2xl shadow-black/50 z-20 overflow-y-auto">
          <div className="p-5">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Entity Inspector</h4>
              <button onClick={() => setInspectedEntity(null)} className="text-zinc-600 hover:text-zinc-400"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Name</p>
                <p className="text-sm text-zinc-200 font-medium">{inspectedEntity.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Type</p>
                <p className="text-sm text-zinc-400 capitalize">{inspectedEntity.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Risk Level</p>
                <p className={`text-sm font-bold uppercase ${inspectedEntity.risk === 'high' ? 'text-red-400' : inspectedEntity.risk === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{inspectedEntity.risk}</p>
              </div>
              {inspectedEntity.notes && (
                <div>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Intel Notes</p>
                  <p className="text-sm text-zinc-400">{inspectedEntity.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistryPanel;
