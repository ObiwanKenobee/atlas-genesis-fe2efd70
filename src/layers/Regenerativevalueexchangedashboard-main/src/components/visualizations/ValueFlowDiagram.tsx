import { useState } from 'react';
import { ArrowRight, DollarSign, TrendingUp } from 'lucide-react';

interface FlowNode {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface Flow {
  from: string;
  to: string;
  value: number;
  label: string;
}

interface ValueFlowDiagramProps {
  sources: FlowNode[];
  targets: FlowNode[];
  flows: Flow[];
  title?: string;
}

export function ValueFlowDiagram({ 
  sources, 
  targets, 
  flows, 
  title = 'Value Flow Analysis' 
}: ValueFlowDiagramProps) {
  const [hoveredFlow, setHoveredFlow] = useState<Flow | null>(null);

  // Calculate total values
  const totalSourceValue = sources.reduce((sum, s) => sum + s.value, 0);
  const totalTargetValue = targets.reduce((sum, t) => sum + t.value, 0);
  const totalFlowValue = flows.reduce((sum, f) => sum + f.value, 0);

  // Calculate heights for nodes based on their value
  const getNodeHeight = (value: number, total: number) => {
    return Math.max((value / total) * 300, 20);
  };

  // Calculate vertical position
  const getNodeY = (nodes: FlowNode[], index: number, total: number) => {
    const prevHeight = nodes.slice(0, index).reduce((sum, n) => sum + getNodeHeight(n.value, total), 0);
    const spacing = index * 10;
    return prevHeight + spacing;
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white mb-2">{title}</h3>
          <p className="text-emerald-300/70 text-sm">Visualizing regenerative value distribution and flow</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/20 rounded-lg">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-white">${totalFlowValue.toFixed(1)}B Total Flow</span>
        </div>
      </div>

      <div className="relative" style={{ height: '400px' }}>
        <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          {/* Draw flows */}
          {flows.map((flow, i) => {
            const sourceIndex = sources.findIndex(s => s.id === flow.from);
            const targetIndex = targets.findIndex(t => t.id === flow.to);
            
            if (sourceIndex === -1 || targetIndex === -1) return null;

            const sourceY = getNodeY(sources, sourceIndex, totalSourceValue) + getNodeHeight(sources[sourceIndex].value, totalSourceValue) / 2;
            const targetY = getNodeY(targets, targetIndex, totalTargetValue) + getNodeHeight(targets[targetIndex].value, totalTargetValue) / 2;
            
            const flowHeight = (flow.value / totalFlowValue) * 50;
            const isHovered = hoveredFlow?.from === flow.from && hoveredFlow?.to === flow.to;

            // Create smooth curve path
            const path = `
              M 150,${sourceY}
              C 350,${sourceY} 450,${targetY} 650,${targetY}
            `;

            return (
              <g key={i}>
                {/* Flow path */}
                <path
                  d={path}
                  fill="none"
                  stroke={sources[sourceIndex].color}
                  strokeWidth={isHovered ? flowHeight * 1.5 : flowHeight}
                  strokeOpacity={isHovered ? 0.8 : 0.4}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredFlow(flow)}
                  onMouseLeave={() => setHoveredFlow(null)}
                />
                
                {/* Flow label on hover */}
                {isHovered && (
                  <>
                    <text
                      x="400"
                      y={sourceY + (targetY - sourceY) / 2 - 10}
                      textAnchor="middle"
                      fill="#6ee7b7"
                      fontSize="14"
                      fontWeight="600"
                    >
                      {flow.label}
                    </text>
                    <text
                      x="400"
                      y={sourceY + (targetY - sourceY) / 2 + 10}
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize="12"
                    >
                      ${flow.value}B
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Draw source nodes */}
          {sources.map((source, i) => {
            const height = getNodeHeight(source.value, totalSourceValue);
            const y = getNodeY(sources, i, totalSourceValue);
            
            return (
              <g key={source.id}>
                <rect
                  x="50"
                  y={y}
                  width="100"
                  height={height}
                  fill={source.color}
                  rx="8"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                />
                <text
                  x="25"
                  y={y + height / 2}
                  textAnchor="end"
                  fill="#6ee7b7"
                  fontSize="12"
                  dominantBaseline="middle"
                >
                  {source.label}
                </text>
                <text
                  x="100"
                  y={y + height / 2}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="600"
                  dominantBaseline="middle"
                >
                  ${source.value}B
                </text>
              </g>
            );
          })}

          {/* Draw target nodes */}
          {targets.map((target, i) => {
            const height = getNodeHeight(target.value, totalTargetValue);
            const y = getNodeY(targets, i, totalTargetValue);
            
            return (
              <g key={target.id}>
                <rect
                  x="650"
                  y={y}
                  width="100"
                  height={height}
                  fill={target.color}
                  rx="8"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                />
                <text
                  x="775"
                  y={y + height / 2}
                  textAnchor="start"
                  fill="#6ee7b7"
                  fontSize="12"
                  dominantBaseline="middle"
                >
                  {target.label}
                </text>
                <text
                  x="700"
                  y={y + height / 2}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="600"
                  dominantBaseline="middle"
                >
                  ${target.value}B
                </text>
              </g>
            );
          })}

          {/* Labels */}
          <text x="100" y="30" textAnchor="middle" fill="#6ee7b7" fontSize="14" fontWeight="600">
            Sources
          </text>
          <text x="700" y="30" textAnchor="middle" fill="#6ee7b7" fontSize="14" fontWeight="600">
            Destinations
          </text>
        </svg>
      </div>

      {/* Flow details */}
      {hoveredFlow && (
        <div className="mt-6 bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-emerald-300/70 text-sm mb-1">From</div>
                <div className="text-white">
                  {sources.find(s => s.id === hoveredFlow.from)?.label}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-emerald-300/70 text-sm mb-1">To</div>
                <div className="text-white">
                  {targets.find(t => t.id === hoveredFlow.to)?.label}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-emerald-300/70 text-sm mb-1">{hoveredFlow.label}</div>
              <div className="text-white">${hoveredFlow.value}B</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-emerald-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300/70 text-sm">Total Sources</span>
          </div>
          <div className="text-white">${totalSourceValue.toFixed(1)}B</div>
        </div>
        <div className="bg-emerald-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300/70 text-sm">Active Flows</span>
          </div>
          <div className="text-white">{flows.length} channels</div>
        </div>
        <div className="bg-emerald-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300/70 text-sm">Total Targets</span>
          </div>
          <div className="text-white">${totalTargetValue.toFixed(1)}B</div>
        </div>
      </div>
    </div>
  );
}
