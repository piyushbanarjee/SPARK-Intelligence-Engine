import React, { useState, useEffect } from 'react';
import { Database, User, MapPin, Building, Activity, ShieldAlert } from 'lucide-react';
import { getEntities } from '../api/client';

const RegistryView = ({ caseId }) => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchEntities = async () => {
      if (!caseId) return;
      setLoading(true);
      setError(null);
      setIsOffline(false);
      try {
        const data = await getEntities(caseId);
        setEntities(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.response?.status === 404) {
          setIsOffline(true);
        } else {
          setError("Failed to fetch entity registry. Check network connection.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEntities();
  }, [caseId]);

  const getEntityIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'person': return <User className="w-4 h-4 text-blue-400" />;
      case 'location': return <MapPin className="w-4 h-4 text-green-400" />;
      case 'organization': return <Building className="w-4 h-4 text-purple-400" />;
      default: return <Database className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-auto pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Entity Registry</h2>
          <p className="text-neutral-400">Master index of all extracted entities, personas, and organizations.</p>
        </div>

        {isOffline ? (
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500 shadow-xl flex flex-col items-center">
            <ShieldAlert className="w-12 h-12 text-blue-500 mb-4 opacity-80" />
            <h3 className="text-lg font-bold text-white mb-2">Module Offline</h3>
            <p className="max-w-md mx-auto">The backend Entity Extraction pipeline is currently pending initialization. Awaiting Python endpoint integration.</p>
          </div>
        ) : (
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-400 bg-neutral-950/50 uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Entity ID</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Designation</th>
                    <th className="px-6 py-3 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-neutral-500">
                        <Activity className="w-6 h-6 animate-pulse mx-auto mb-2 text-blue-500/50" />
                        Synchronizing registry...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-red-500 bg-red-950/20">
                        {error}
                      </td>
                    </tr>
                  ) : entities.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-neutral-500">
                        Registry empty. Ingest evidence to extract entities.
                      </td>
                    </tr>
                  ) : (
                    entities.map((entity, i) => (
                      <tr key={i} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4 text-neutral-400 font-mono text-xs">{entity.id || `ENT-${i+1000}`}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getEntityIcon(entity.type)}
                            <span className="text-neutral-300 capitalize">{entity.type || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white font-medium">{entity.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs text-green-400 bg-green-400/10 rounded-full border border-green-400/20">
                            High
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistryView;
