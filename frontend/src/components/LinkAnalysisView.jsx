import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, Activity, ShieldAlert } from 'lucide-react';
import { getGraphData } from '../api/client';

const LinkAnalysisView = ({ caseId }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: window.innerHeight - 200 // Account for navbars
      });
    }
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      if (!caseId) return;
      setLoading(true);
      setError(null);
      setIsOffline(false);
      try {
        const data = await getGraphData(caseId);
        if (data && data.nodes && data.nodes.length > 0) {
          setGraphData(data);
        } else {
          // Fallback dummy data if backend graph isn't populated
          setGraphData({
            nodes: [
              { id: '1', name: 'John Doe', group: 'person' },
              { id: '2', name: 'Safehouse A', group: 'location' }
            ],
            links: [
              { source: '1', target: '2', label: 'VISITED' }
            ]
          });
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setIsOffline(true);
        } else {
          setError("Failed to synchronize graph projection. Knowledge graph offline.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [caseId]);

  const getNodeColor = (node) => {
    if (node.group === 'person') return '#ef4444'; // Red
    if (node.group === 'location') return '#10b981'; // Green
    if (node.group === 'organization') return '#8b5cf6'; // Purple
    return '#3b82f6'; // Blue
  };

  return (
    <div className="flex-1 flex flex-col pt-20 pb-24 h-screen">
      <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md z-10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Network className="w-5 h-5 text-blue-500" />
            <span>Link Analysis Projection</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Interactive neo4j topological rendering.</p>
        </div>
      </div>

      <div className="flex-1 relative bg-[#050505]" ref={containerRef}>
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500">
             <Activity className="w-8 h-8 animate-pulse mb-4 text-blue-500/50" />
             <p>Rendering topology...</p>
          </div>
        ) : isOffline ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 px-6 text-center">
             <ShieldAlert className="w-12 h-12 mb-4 text-blue-500 opacity-80" />
             <h3 className="text-lg font-bold text-white mb-2">Module Offline</h3>
             <p className="max-w-md mx-auto">The backend Graph Projection pipeline is currently pending initialization. Awaiting Python endpoint integration.</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500">
             <Network className="w-12 h-12 mb-4 text-neutral-700" />
             <p className="bg-red-950/20 px-6 py-4 rounded-xl border border-red-900/50 text-red-500">{error}</p>
          </div>
        ) : (
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeAutoColorBy="group"
            nodeColor={getNodeColor}
            nodeLabel="name"
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            linkColor={() => '#333333'}
            backgroundColor="#050505"
          />
        )}
      </div>
    </div>
  );
};

export default LinkAnalysisView;
