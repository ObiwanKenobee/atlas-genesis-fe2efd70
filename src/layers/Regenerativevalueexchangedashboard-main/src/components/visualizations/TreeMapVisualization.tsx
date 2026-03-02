import { useState } from 'react';
import { Maximize2, TrendingUp, Info } from 'lucide-react';

interface TreeMapNode {
  id: string;
  label: string;
  value: number;
  category: string;
  change: number;
  color: string;
  children?: TreeMapNode[];
}

interface TreeMapVisualizationProps {
  data: TreeMapNode[];
  title?: string;
  width?: number;
  height?: number;
}

export function TreeMapVisualization({ 
  data, 
  title = 'Asset Distribution TreeMap',
  width = 800,
  height = 500
}: TreeMapVisualizationProps) {
  const [hoveredNode, setHoveredNode] = useState<TreeMapNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeMapNode | null>(null);

  // Calculate total value
  const totalValue = data.reduce((sum, node) => sum + node.value, 0);

  // Simple treemap layout algorithm (squarified)
  const layoutTreeMap = (nodes: TreeMapNode[], x: number, y: number, w: number, h: number) => {
    if (nodes.length === 0) return [];

    const sortedNodes = [...nodes].sort((a, b) => b.value - a.value);
    const layoutNodes: Array<TreeMapNode & { x: number; y: number; w: number; h: number }> = [];

    let currentX = x;
    let currentY = y;
    let remainingWidth = w;
    let remainingHeight = h;

    sortedNodes.forEach((node, index) => {
      const ratio = node.value / totalValue;
      const area = w * h * ratio;

      let nodeWidth: number;
      let nodeHeight: number;

      if (index % 2 === 0) {
        // Vertical split
        nodeWidth = Math.min(area / remainingHeight, remainingWidth);
        nodeHeight = remainingHeight;
      } else {
        // Horizontal split
        nodeWidth = remainingWidth;
        nodeHeight = Math.min(area / remainingWidth, remainingHeight);
      }

      layoutNodes.push({
        ...node,
        x: currentX,
        y: currentY,
        w: nodeWidth,
        h: nodeHeight
      });

      if (index % 2 === 0) {
        currentX += nodeWidth;
        remainingWidth -= nodeWidth;
      } else {
        currentY += nodeHeight;
        remainingHeight -= nodeHeight;
      }
    });

    return layoutNodes;
  };

  const layoutedNodes = layoutTreeMap(data, 0, 0, width, height);

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white mb-2">{title}</h3>
          <p className="text-emerald-300/70 text-sm">Hover over areas to see detailed metrics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/20 rounded-lg">
          <Maximize2 className="w-4 h-4 text-emerald-400" />
          <span className="text-white">${totalValue.toFixed(1)}B Total</span>
        </div>
      </div>

      {/* TreeMap */}
      <div className="relative overflow-hidden rounded-lg border border-emerald-500/10">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          {layoutedNodes.map((node) => {
            const isHovered = hoveredNode?.id === node.id;
            const isSelected = selectedNode?.id === node.id;
            const opacity = isHovered || isSelected ? 1 : 0.8;

            return (
              <g key={node.id}>
                {/* Node rectangle */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  fill={node.color}
                  fillOpacity={opacity}
                  stroke={isSelected ? '#fff' : node.color}
                  strokeWidth={isSelected ? 3 : 1}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                />

                {/* Node label (only if large enough) */}
                {node.w > 80 && node.h > 60 && (
                  <>
                    <text
                      x={node.x + node.w / 2}
                      y={node.y + node.h / 2 - 15}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="14"
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      {node.label}
                    </text>
                    <text
                      x={node.x + node.w / 2}
                      y={node.y + node.h / 2 + 5}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="18"
                      fontWeight="700"
                      className="pointer-events-none"
                    >
                      ${node.value}B
                    </text>
                    <text
                      x={node.x + node.w / 2}
                      y={node.y + node.h / 2 + 25}
                      textAnchor="middle"
                      fill={node.change >= 0 ? '#6ee7b7' : '#fca5a5'}
                      fontSize="12"
                      className="pointer-events-none"
                    >
                      {node.change >= 0 ? '+' : ''}{node.change}%
                    </text>
                  </>
                )}

                {/* Minimal label for small nodes */}
                {(node.w <= 80 || node.h <= 60) && node.w > 40 && node.h > 30 && (
                  <text
                    x={node.x + node.w / 2}
                    y={node.y + node.h / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12"
                    fontWeight="600"
                    className="pointer-events-none"
                    dominantBaseline="middle"
                  >
                    {node.label.substring(0, 8)}...
                  </text>
                )}

                {/* Hover overlay */}
                {isHovered && (
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.w}
                    height={node.h}
                    fill="#fff"
                    fillOpacity={0.1}
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Details */}
      {(hoveredNode || selectedNode) && (
        <div className="mt-6 bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-4">
          {(() => {
            const node = selectedNode || hoveredNode;
            if (!node) return null;

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: node.color }}></div>
                    <span className="text-emerald-300/70 text-sm">Asset</span>
                  </div>
                  <div className="text-white">{node.label}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-sm mb-2">Category</div>
                  <div className="text-white capitalize">{node.category}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-sm mb-2">Value</div>
                  <div className="text-white">${node.value}B</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-sm mb-2">Change</div>
                  <div className={`flex items-center gap-1 ${node.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <TrendingUp className={`w-4 h-4 ${node.change < 0 ? 'rotate-180' : ''}`} />
                    <span>{node.change >= 0 ? '+' : ''}{node.change}%</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-emerald-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300/70 text-sm">Asset Categories</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...new Set(data.map(d => d.category))].map((category, idx) => {
            const categoryNodes = data.filter(d => d.category === category);
            const categoryValue = categoryNodes.reduce((sum, n) => sum + n.value, 0);
            const categoryColor = categoryNodes[0]?.color || '#10b981';

            return (
              <div key={category} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: categoryColor }}></div>
                <div>
                  <div className="text-emerald-300/70 text-xs capitalize">{category}</div>
                  <div className="text-white text-sm">${categoryValue.toFixed(1)}B</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
