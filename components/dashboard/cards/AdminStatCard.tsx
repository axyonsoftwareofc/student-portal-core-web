// components/dashboard/cards/AdminStatCard.tsx
import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: 'sky' | 'emerald' | 'amber' | 'rose';
    trend?: {
        value: number;
        label: string;
    };
    description?: string;
}

export default function AdminStatCard({
                                          label,
                                          value,
                                          icon: Icon,
                                          color,
                                          trend,
                                          description,
                                      }: AdminStatCardProps) {
    const colorClasses = {
        sky: 'bg-sky-500/10 text-sky-400',
        emerald: 'bg-emerald-500/10 text-emerald-400',
        amber: 'bg-amber-500/10 text-amber-400',
        rose: 'bg-rose-500/10 text-rose-400',
    };

    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{value}</p>

                    {trend && (
                        <div className="mt-2 flex items-center gap-1.5">
              <span
                  className={`text-sm font-medium ${
                      trend.value > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
              >
                {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
                            <span className="text-xs text-gray-500">{trend.label}</span>
                        </div>
                    )}

                    {description && (
                        <p className="mt-2 text-xs text-gray-500">{description}</p>
                    )}
                </div>

                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}