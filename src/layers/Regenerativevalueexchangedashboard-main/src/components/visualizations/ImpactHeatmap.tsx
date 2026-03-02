import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HeatmapCell {
  region: string;
  month: string;
  value: number;
  change: number;
}

interface ImpactHeatmapProps {
  data: HeatmapCell[];
  title?: string;
  valueLabel?: string;
}

export function ImpactHeatmap({ 
  data, 
  title = 'Regional Impact Activity', 
  valueLabel = 'Impact Score' 
}: ImpactHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  // Get unique regions and months
  const regions = [...new Set(data.map(d => d.region))];
  const months = [...new Set(data.map(d => d.month))];

  // Get min and max values for color scale
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Color scale function
  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    
    if (normalized < 0.2) return '#065f46'; // dark green
    if (normalized < 0.4) return '#047857';
    if (normalized < 0.6) return '#059669';
    if (normalized < 0.8) return '#10b981';
    return '#34d399'; // bright green
  };

  const getCellData = (region: string, month: string) => {
    return data.find(d => d.region === region && d.month === month);
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white mb-2">{title}</h3>
          <p className="text-emerald-300/70 text-sm">Hover over cells to see detailed metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-emerald-300/70 text-sm">Scale</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#065f46' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#047857' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#059669' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#34d399' }}></div>
              <span className="text-emerald-300/70 text-xs ml-2">Low → High</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month headers */}
          <div className="flex items-center mb-2">
            <div className="w-32 flex-shrink-0"></div>
            {months.map((month) => (
              <div key={month} className="w-24 text-center flex-shrink-0">
                <span className="text-emerald-300/70 text-sm">{month}</span>
              </div>
            ))}
          </div>

          {/* Heatmap rows */}
          {regions.map((region) => (
            <div key={region} className="flex items-center mb-2">
              {/* Region label */}
              <div className="w-32 flex-shrink-0">
                <span className="text-emerald-300 text-sm">{region}</span>
              </div>

              {/* Cells */}
              {months.map((month) => {
                const cellData = getCellData(region, month);
                if (!cellData) return <div key={month} className="w-24 h-16 flex-shrink-0 mx-1"></div>;

                return (
                  <div
                    key={month}
                    className="w-24 h-16 flex-shrink-0 mx-1 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg relative"
                    style={{ backgroundColor: getColor(cellData.value) }}
                    onMouseEnter={() => setHoveredCell(cellData)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-sm">{cellData.value}</span>
                    </div>
                    {cellData.change !== 0 && (
                      <div className={`absolute top-1 right-1 ${cellData.change > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                        {cellData.change > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div className="mt-6 bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-emerald-300/70 text-sm mb-1">Region</div>
              <div className="text-white">{hoveredCell.region}</div>
            </div>
            <div>
              <div className="text-emerald-300/70 text-sm mb-1">Period</div>
              <div className="text-white">{hoveredCell.month}</div>
            </div>
            <div>
              <div className="text-emerald-300/70 text-sm mb-1">{valueLabel}</div>
              <div className="flex items-center gap-2">
                <span className="text-white">{hoveredCell.value}</span>
                {hoveredCell.change !== 0 && (
                  <span className={`flex items-center gap-1 text-sm ${hoveredCell.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {hoveredCell.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(hoveredCell.change)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
