import { useState, useEffect } from 'react';
import { Link2, Zap, Users, Building } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'project' | 'custodian' | 'asset' | 'community';
  value: number;
  connections: string[];
}

interface NetworkGraphProps {
  nodes: Node[];
  title?: string;
  height?: number;
}

export function NetworkGraph({ nodes, title = 'Network Connections', height = 400 }: NetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Position nodes in a circle
  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 120;
    return {
      x: 200 + radius * Math.cos(angle),
      y: 200 + radius * Math.sin(angle),
    };
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'project': return '#10b981';
      case 'custodian': return '#3b82f6';
      case 'asset': return '#f59e0b';
      case 'community': return '#8b5cf6';
      default: return '#6ee7b7';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'project': return Zap;
      case 'custodian': return Building;
      case 'asset': return Link2;
      case 'community': return Users;
      default: return Link2;
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white">{title}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-emerald-300/70 text-sm">Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-emerald-300/70 text-sm">Custodians</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-emerald-300/70 text-sm">Assets</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-emerald-300/70 text-sm">Communities</span>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible">
          {/* Draw connections */}
          {nodes.map((node, i) => {
            const pos1 = getNodePosition(i, nodes.length);
            return node.connections.map((connId) => {
              const connIndex = nodes.findIndex(n => n.id === connId);
              if (connIndex === -1) return null;
              const pos2 = getNodePosition(connIndex, nodes.length);
              
              const isHighlighted = hoveredNode === node.id || hoveredNode === connId || 
                                   selectedNode === node.id || selectedNode === connId;
              
              return (
                <line
                  key={`${node.id}-${connId}`}
                  x1={pos1.x}
                  y1={pos1.y}
                  x2={pos2.x}
                  y2={pos2.y}
                  stroke={isHighlighted ? '#10b981' : '#10b981'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={isHighlighted ? 0.8 : 0.2}
                  className="transition-all duration-300"
                />
              );
            });
          })}

          {/* Draw nodes */}
          {nodes.map((node, i) => {
            const pos = getNodePosition(i, nodes.length);
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            const isConnected = selectedNode && nodes.find(n => n.id === selectedNode)?.connections.includes(node.id);
            const radius = 8 + (node.value / 100) * 12;
            const Icon = getNodeIcon(node.type);
            
            return (
              <g key={node.id}>
                {/* Outer glow for selected/hovered */}
                {(isHovered || isSelected || isConnected) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 8}
                    fill={getNodeColor(node.type)}
                    fillOpacity={0.2}
                    className="animate-pulse"
                  />
                )}
                
                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={getNodeColor(node.type)}
                  fillOpacity={isHovered || isSelected ? 1 : 0.8}
                  stroke={isSelected ? '#fff' : getNodeColor(node.type)}
                  strokeWidth={isSelected ? 3 : 0}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                />

                {/* Node label */}
                {(isHovered || isSelected) && (
                  <text
                    x={pos.x}
                    y={pos.y - radius - 10}
                    textAnchor="middle"
                    fill="#6ee7b7"
                    fontSize="12"
                    fontWeight="500"
                  >
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Details */}
      {selectedNode && (
        <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/20">
          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            const Icon = getNodeIcon(node.type);
            return (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: getNodeColor(node.type) }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white">{node.label}</div>
                    <div className="text-emerald-300/70 text-sm capitalize">{node.type}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-emerald-300/70 text-sm mb-1">Impact Value</div>
                    <div className="text-white">${node.value}M</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 text-sm mb-1">Connections</div>
                    <div className="text-white">{node.connections.length}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
