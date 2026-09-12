import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, ZoomIn, ZoomOut, RotateCcw, Network, X, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api.js';

const LinkGraphPanel = ({ caseId }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState(null);

  // Pan & Zoom Mechanics
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Data Fetching & Layout Engine
  const syncNetwork = useCallback(async () => {
    if (!caseId) return;
    try {
      setError(null);
      const data = await apiClient.getGraph(caseId);
      
      if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
        throw new Error("Invalid graph payload from API.");
      }

      // Radial Layout: Center the case, circle the evidence/entities
      const nodesWithCoords = data.nodes.map((n, i) => {
        if (n.group === 'case') {
          return { ...n, x: 50, y: 50 }; // Dead center
        }
        // Distribute other nodes in a 35% radius circle
        const nonCaseNodes = data.nodes.filter(node => node.group !== 'case');
        const nodeIndex = nonCaseNodes.findIndex(node => node.id === n.id);
        const angle = (nodeIndex / nonCaseNodes.length) * 2 * Math.PI;
        const radius = 35;
        
        return {
          ...n,
          x: n.x ?? (50 + radius * Math.cos(angle)),
          y: n.y ?? (50 + radius * Math.sin(angle))
        };
      });

      setGraphData({ nodes: nodesWithCoords, links: data.links });
    } catch (err) {
      console.error("Graph sync failed:", err);
      setError("Failed to load investigation network.");
    }
  }, [caseId]);

  useEffect(() => {
    syncNetwork();
  }, [syncNetwork]);

  // O(1) Lookups
  const nodeMap = useMemo(() => Object.fromEntries(graphData.nodes.map((n) => [n.id, n])), [graphData.nodes]);
  const edgeMap = useMemo(() => Object.fromEntries(graphData.links.map((e) => [e.id, e])), [graphData.links]);

  const selectedNode = selection?.type === "node" ? nodeMap[selection.id] : null;
  const selectedEdge = selection?.type === "edge" ? edgeMap[selection.id] : null;

  // Interaction Handlers
  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => (e.deltaY < 0 ? Math.min(z + 0.1, 2.5) : Math.max(z - 0.1, 0.4)));
  };

  const handleMouseDown = (e) => {
    if (e.target.closest("button") || e.target.closest(".inspector-panel")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  return (
    <div className="space-y-4">
      {/* Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-blue-500 transition-colors">
          <Search size={16} className="text-zinc-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search network nodes..."
            className="w-full text-sm text-zinc-200 placeholder-zinc-500 bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl shadow-sm">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))} className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg"><ZoomIn size={16} /></button>
          <span className="text-xs font-medium text-zinc-300 px-3 min-w-[60px] text-center font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))} className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg"><ZoomOut size={16} /></button>
          <div className="w-px h-5 bg-zinc-800 mx-1" />
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg"><RotateCcw size={14} /></button>
          <div className="w-px h-5 bg-zinc-800 mx-1" />
          <button onClick={syncNetwork} className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-lg"><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        className="relative bg-[#030712] border border-zinc-800 rounded-xl overflow-hidden shadow-sm cursor-grab active:cursor-grabbing select-none"
        style={{ height: "600px" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center"><p className="text-red-500 bg-red-950/20 px-4 py-2 border border-red-900 rounded font-mono text-sm">{error}</p></div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center"><p className="text-zinc-600 font-mono text-sm">Awaiting graph intelligence...</p></div>
        ) : (
          <div className="w-full h-full relative origin-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
            
            {/* 1. SVG Edges Layer */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {graphData.links.map((edge, idx) => {
                const sourceId = edge.source || edge.from;
                const targetId = edge.target || edge.to;
                const a = nodeMap[sourceId];
                const b = nodeMap[targetId];
                if (!a || !b) return null;
                
                const edgeId = edge.id || `edge-${idx}`;
                const isSelected = selection?.type === "edge" && selection.id === edgeId;
                
                return (
                  <g key={edgeId}>
                    <line x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} stroke={isSelected ? "#3b82f6" : "#27272a"} strokeWidth={isSelected ? "0.6" : "0.3"} strokeDasharray={edge.style === "dashed" ? "1.5,1.5" : undefined} />
                    <line x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} stroke="transparent" strokeWidth="5" className="cursor-pointer" onClick={() => setSelection({ type: "edge", id: edgeId, data: edge })} />
                  </g>
                );
              })}
            </svg>

            {/* 2. Edge Labels Layer */}
            {graphData.links.map((edge, idx) => {
              const sourceId = edge.source || edge.from;
              const targetId = edge.target || edge.to;
              const a = nodeMap[sourceId];
              const b = nodeMap[targetId];
              if (!a || !b || !edge.label) return null;
              
              const edgeId = edge.id || `edge-${idx}`;
              const isSelected = selection?.type === "edge" && selection.id === edgeId;
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              
              return (
                <button
                  key={`lbl-${edgeId}`}
                  onClick={() => setSelection({ type: "edge", id: edgeId, data: edge })}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-medium px-2 py-0.5 rounded-full border shadow-sm transition-all ${
                    isSelected ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-blue-500/50 hover:text-blue-400"
                  }`}
                  style={{ left: `${mx}%`, top: `${my}%` }}
                >
                  {edge.label}
                </button>
              );
            })}

            {/* 3. HTML Nodes Layer */}
            {graphData.nodes.map((n) => {
              const isSelected = selection?.type === "node" && selection.id === n.id;
              const matchesQuery = query === "" || n.name?.toLowerCase().includes(query.toLowerCase());
              const type = n.group || n.type || "Entity";
              
              return (
                <button
                  key={n.id}
                  onClick={() => setSelection({ type: "node", id: n.id })}
                  className={`absolute w-48 -translate-x-1/2 -translate-y-1/2 text-left bg-zinc-950 border rounded-xl p-3 shadow-sm transition-all ${
                    isSelected ? "border-blue-500 ring-4 ring-blue-500/20 bg-zinc-900 shadow-xl" : "border-zinc-800 hover:border-blue-500/50"
                  } ${matchesQuery ? "opacity-100 scale-100" : "opacity-30 scale-95"}`}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2">
                    <span className="text-[10px] text-zinc-500 font-mono font-medium truncate max-w-[80px]">{n.code || n.id.slice(0,8)}</span>
                    <span className="text-[9px] text-blue-400 font-medium px-1.5 py-0.5 bg-blue-950/30 rounded border border-blue-900/50 truncate max-w-[60px] uppercase">{type}</span>
                  </div>
                  <div className="text-sm font-semibold text-zinc-100 truncate">{n.name || n.title || "Unknown"}</div>
                  {n.classification && <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wide">Class: {n.classification}</div>}
                </button>
              );
            })}
          </div>
        )}

        {/* 4. Slide-out Inspector Panel */}
        <div className={`inspector-panel absolute top-0 right-0 h-full w-80 bg-zinc-950/95 border-l border-zinc-800 p-5 transition-transform duration-300 overflow-y-auto backdrop-blur-md shadow-2xl ${selection ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200 flex items-center gap-2"><Network size={16} className="text-blue-500" /> Inspector</span>
            <button onClick={() => setSelection(null)} className="text-zinc-400 hover:text-zinc-200 bg-black border border-zinc-800 p-1.5 rounded-lg"><X size={16} /></button>
          </div>

          {selectedNode && (
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-zinc-100 leading-tight">{selectedNode.name || selectedNode.title}</div>
                <div className="text-xs text-blue-400 font-mono mt-2 bg-blue-950/20 inline-block px-2 py-0.5 rounded border border-blue-900/30 uppercase">
                  {selectedNode.code || selectedNode.id.slice(0,8)} • {selectedNode.group || selectedNode.type || "Entity"}
                </div>
              </div>
              
              <div className="bg-black p-4 border border-zinc-800 rounded-xl text-sm text-zinc-300 leading-relaxed shadow-inner">
                {selectedNode.summary || "No detailed summary available for this node in the current database extraction."}
              </div>

              {selectedNode.aliases && selectedNode.aliases.length > 0 && (
                <div className="text-xs text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                  <span className="text-zinc-500 font-medium block mb-1">Known Aliases:</span> 
                  {selectedNode.aliases.join(", ")}
                </div>
              )}
            </div>
          )}

          {selectedEdge && (
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-zinc-100">{selection.data?.label || "Relationship Vector"}</div>
                <div className="text-[10px] text-blue-400 mt-1.5 font-semibold uppercase tracking-wider bg-blue-950/20 inline-block px-2 py-0.5 rounded border border-blue-900/30">Vector Analysis</div>
              </div>
              <div className="bg-black p-4 border border-zinc-800 rounded-xl text-sm text-zinc-300 leading-relaxed shadow-inner">
                {selection.data?.context || "This relationship was automatically mapped by the extraction engine. No extended context provided."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkGraphPanel;