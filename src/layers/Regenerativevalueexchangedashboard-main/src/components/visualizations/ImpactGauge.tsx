import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface ImpactGaugeProps {
  value: number;
  maxValue?: number;
  title: string;
  subtitle?: string;
  target?: number;
  previousValue?: number;
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
}

export function ImpactGauge({ 
  value, 
  maxValue = 100, 
  title, 
  subtitle,
  target,
  previousValue,
  thresholds = { low: 40, medium: 70, high: 90 }
}: ImpactGaugeProps) {
  const percentage = (value / maxValue) * 100;
  const targetPercentage = target ? (target / maxValue) * 100 : null;
  
  // Calculate change from previous value
  const change = previousValue ? ((value - previousValue) / previousValue * 100).toFixed(1) : null;
  const isPositive = change ? parseFloat(change) >= 0 : true;

  // Determine status based on thresholds
  const getStatus = () => {
    if (value >= thresholds.high) return { label: 'Excellent', color: '#10b981', icon: CheckCircle };
    if (value >= thresholds.medium) return { label: 'Good', color: '#3b82f6', icon: TrendingUp };
    if (value >= thresholds.low) return { label: 'Fair', color: '#f59e0b', icon: AlertTriangle };
    return { label: 'Needs Attention', color: '#ef4444', icon: AlertTriangle };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  // SVG gauge parameters
  const size = 200;
  const strokeWidth = 20;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Start from -90 degrees (top) and go 270 degrees (3/4 circle)
  const startAngle = -90;
  const endAngle = 180;
  const angleRange = endAngle - startAngle;
  
  const valueOffset = circumference - (percentage / 100) * (angleRange / 360) * circumference;

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-white mb-1">{title}</h3>
        {subtitle && <p className="text-emerald-300/70 text-sm">{subtitle}</p>}
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#065f46"
              strokeWidth={strokeWidth}
              strokeDasharray={`${(angleRange / 360) * circumference} ${circumference}`}
              strokeLinecap="round"
            />
            
            {/* Threshold markers */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeDasharray={`${((thresholds.low / maxValue) * (angleRange / 360)) * circumference} ${circumference}`}
              strokeLinecap="round"
              opacity={0.3}
            />
            
            {/* Value arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={status.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${(angleRange / 360) * circumference} ${circumference}`}
              strokeDashoffset={valueOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))'
              }}
            />

            {/* Target indicator */}
            {targetPercentage && (
              <line
                x1={center + radius * Math.cos((startAngle + (angleRange * targetPercentage / 100)) * Math.PI / 180)}
                y1={center + radius * Math.sin((startAngle + (angleRange * targetPercentage / 100)) * Math.PI / 180)}
                x2={center + (radius + strokeWidth) * Math.cos((startAngle + (angleRange * targetPercentage / 100)) * Math.PI / 180)}
                y2={center + (radius + strokeWidth) * Math.sin((startAngle + (angleRange * targetPercentage / 100)) * Math.PI / 180)}
                stroke="#f59e0b"
                strokeWidth={3}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-white text-4xl mb-1">{value}</div>
            <div className="text-emerald-300/70 text-sm">of {maxValue}</div>
            {change && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(parseFloat(change))}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${status.color}20` }}
        >
          <StatusIcon className="w-5 h-5" style={{ color: status.color }} />
        </div>
        <div>
          <div className="text-emerald-300/70 text-sm">Status</div>
          <div className="text-white">{status.label}</div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4">
        {target && (
          <div className="bg-emerald-900/20 rounded-lg p-3">
            <div className="text-emerald-300/70 text-sm mb-1">Target</div>
            <div className="text-white">{target}</div>
            <div className={`text-xs mt-1 ${value >= target ? 'text-emerald-400' : 'text-amber-400'}`}>
              {value >= target ? 'Target achieved!' : `${target - value} to go`}
            </div>
          </div>
        )}
        {previousValue && (
          <div className="bg-emerald-900/20 rounded-lg p-3">
            <div className="text-emerald-300/70 text-sm mb-1">Previous</div>
            <div className="text-white">{previousValue}</div>
            <div className={`text-xs mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{change}% change
            </div>
          </div>
        )}
      </div>

      {/* Threshold Legend */}
      <div className="mt-6 pt-4 border-t border-emerald-500/20">
        <div className="text-emerald-300/70 text-sm mb-3">Performance Ranges</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-emerald-300/70">Excellent</span>
            </div>
            <span className="text-emerald-300/70">{thresholds.high}+</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-emerald-300/70">Good</span>
            </div>
            <span className="text-emerald-300/70">{thresholds.medium}-{thresholds.high}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-emerald-300/70">Fair</span>
            </div>
            <span className="text-emerald-300/70">{thresholds.low}-{thresholds.medium}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-emerald-300/70">Needs Attention</span>
            </div>
            <span className="text-emerald-300/70">0-{thresholds.low}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
