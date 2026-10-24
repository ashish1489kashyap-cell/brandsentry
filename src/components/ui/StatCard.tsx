import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  isSampleData?: boolean;
  accentColor?: 'blue' | 'rose' | 'amber' | 'emerald';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel = 'vs last period',
  isSampleData = false,
  accentColor = 'blue',
}) => {
  const accentBorderColors = {
    blue: 'hover:border-blue-500/50',
    rose: 'hover:border-rose-500/50',
    amber: 'hover:border-amber-500/50',
    emerald: 'hover:border-emerald-500/50',
  };

  const iconBgColors = {
    blue: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
    rose: 'bg-rose-950/80 text-rose-400 border-rose-800/60',
    amber: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    emerald: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
  };

  return (
    <div
      className={`relative rounded-xl bg-[#0d1527] border border-slate-800/80 p-5 transition-all duration-200 ${accentBorderColors[accentColor]} group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
            {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border ${iconBgColors[accentColor]}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        {trend !== undefined && trend !== 0 ? (
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <span className="inline-flex items-center text-emerald-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{trend}%
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-400 font-medium">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {trend}%
              </span>
            )}
            <span className="text-slate-500">{trendLabel}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-slate-500">
            <Minus className="w-3.5 h-3.5" />
            <span>Baseline</span>
          </div>
        )}

        {isSampleData && (
          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
            Sample
          </span>
        )}
      </div>
    </div>
  );
};
