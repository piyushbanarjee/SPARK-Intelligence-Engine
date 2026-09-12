import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ErrorBoundary from './ErrorBoundary';
import { apiClient } from '../api.js';

const NODE_COLORS = {
  case: '#22d3ee',     // Cyan
  evidence: '#f87171', // Red
  note: '#4ade80',     // Green
};

const LinkAnalysisView = ({ caseId }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const graphRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const syncNetwork = useCallback(async () => {
    if (!caseId) return;

    try {
      setError(null);
      const data = await apiClient.getGraph(caseId);

      if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
        setError("Invalid payload: API did not return {nodes: [], links: []}.");
        return;
      }

      const nodeIds = new Set();
      for (const node of data.nodes) {
        if (node.id === undefined || node.id === null) {
          setError("Invalid payload: A node is missing an 'id' field.");
          return;
        }
        nodeIds.add(String(node.id));
      }

      for (const link of data.links) {
        const src = String(link.source);
        const tgt = String(link.target);
        if (!nodeIds.has(src) || !nodeIds.has(tgt)) {
          setError(`Orphan link detected: source="${src}" or target="${tgt}" has no matching node.`);
          return;
        }
      }

      setGraphData(data);
    } catch (err) {
      console.error("Failed to fetch graph intelligence:", err);
      setError(err.message || "Failed to load the link analysis network.");
    }
  }, [caseId]);

  useEffect(() => {
    syncNetwork();
  }, [syncNetwork]);

  // Custom node rendering via Canvas 2D — no SVG DOM manipulation
  const paintNode = useCallback((node, ctx, globalScale) => {
    const group = node.group ? String(node.group).toLowerCase() : '';
    const color = NODE_COLORS[group] || '#9ca3af';
    const label = node.name || node.title || String(node.id).slice(0, 8);
    const fontSize = Math.max(10 / globalScale, 3);
    const radius = group === 'case' ? 8 : 5;

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI);
    ctx.fillStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba');
    ctx.fill();

    // Solid node
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Border ring
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    // Label
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#d1d5db';
    ctx.fillText(label, node.x, node.y + radius + 3);
  }, []);

  const canRenderGraph = graphData.nodes.length > 0 && dimensions.width > 0 && dimensions.height > 0;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg shadow-xl h-[600px] flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center space-x-2">
          <span className="text-cyan-500 text-sm">🔗</span>
          <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400">
            Link Analysis Network
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={syncNetwork}
            className="bg-gray-800 text-cyan-400 hover:bg-gray-700 border border-gray-700 px-3 py-1 rounded text-xs font-semibold shadow transition-colors font-mono"
          >
            ↻ Sync
          </button>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Module Active" />
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full relative bg-[#030712]"
      >
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-500 font-mono font-bold z-10 p-4 bg-gray-900 border border-red-900 rounded shadow-lg max-w-md text-center text-sm">
              {error}
            </div>
          </div>
        ) : !canRenderGraph ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-600 italic text-sm font-mono">
              Awaiting intelligence data...
            </p>
          </div>
        ) : (
          <ErrorBoundary>
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <ForceGraph2D
                ref={graphRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeCanvasObject={paintNode}
                nodePointerAreaPaint={(node, color, ctx) => {
                  const radius = (node.group?.toLowerCase() === 'case') ? 8 : 5;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI);
                  ctx.fillStyle = color;
                  ctx.fill();
                }}
                linkColor={() => '#1e293b'}
                linkWidth={1.5}
                backgroundColor="#030712"
                cooldownTicks={80}
              />
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default LinkAnalysisView;
