import React from 'react';

interface MatchScoreDialProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MatchScoreDial: React.FC<MatchScoreDialProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  // Clamped score
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  const sizeConfigs = {
    sm: { diameter: 48, stroke: 4, fontSize: 'text-xs', labelClass: 'text-[10px]' },
    md: { diameter: 72, stroke: 6, fontSize: 'text-base', labelClass: 'text-xs' },
    lg: { diameter: 104, stroke: 8, fontSize: 'text-2xl', labelClass: 'text-sm' },
  };

  const { diameter, stroke, fontSize, labelClass } = sizeConfigs[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  // Color scheme based on match percentage
  const getColor = (s: number) => {
    if (s >= 85) return { stroke: '#10b981', glow: 'glow-emerald', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300' };
    if (s >= 70) return { stroke: '#6366f1', glow: 'glow-indigo', text: 'text-indigo-400', badge: 'bg-indigo-500/10 text-indigo-300' };
    if (s >= 50) return { stroke: '#f59e0b', glow: '', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300' };
    return { stroke: '#64748b', glow: '', text: 'text-slate-400', badge: 'bg-slate-800 text-slate-400' };
  };

  const theme = getColor(safeScore);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative flex items-center justify-center ${theme.glow}`}>
        <svg width={diameter} height={diameter} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={stroke}
            fill="transparent"
          />
          {/* Animated score arc */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono font-bold tracking-tighter">
          <span className={`${fontSize} ${theme.text}`}>{safeScore}%</span>
        </div>
      </div>

      {showLabel && (
        <span className={`mt-1 font-semibold uppercase tracking-wider ${labelClass} ${theme.text}`}>
          {safeScore >= 85 ? 'AI Match' : safeScore >= 70 ? 'Strong Fit' : 'Moderate'}
        </span>
      )}
    </div>
  );
};
