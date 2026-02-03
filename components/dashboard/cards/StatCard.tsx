// components/dashboard/cards/StatCard.tsx
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    color: 'sky' | 'emerald' | 'amber' | 'violet';
    trend?: string;
    description?: string;
}

export default function StatCard({
                                     label,
                                     value,
                                     icon: Icon,
                                     color,
                                     trend,
                                     description,
                                 }: StatCardProps) {
    const colorClasses = {
        sky: {
            icon: 'bg-sky-500/10 text-sky-400',
            value: 'text-sky-400',
        },
        emerald: {
            icon: 'bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
        },
        amber: {
            icon: 'bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
        },
        violet: {
            icon: 'bg-violet-500/10 text-violet-400',
            value: 'text-violet-400',
        },
    };

    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-5 transition-all hover:bg-gray-900/50">
            {/* Header */}
            <div className="flex items-start justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    {label}
                </p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorClasses[color].icon}`}>
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
            </div>

            {/* Value */}
            <p className={`mt-3 text-2xl sm:text-3xl font-bold ${colorClasses[color].value}`}>
                {value}
            </p>

            {/* Trend and description */}
            {(trend || description) && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {trend && (
                        <span className="text-xs font-medium text-emerald-400">
              {trend}
            </span>
                    )}
                    {description && (
                        <span className="text-xs text-gray-500">
              {description}
            </span>
                    )}
                </div>
            )}
        </div>
    );
}