// components/dashboard/cards/AdminStatCard.tsx
interface AdminStatCardProps {
    label: string;
    value: string | number;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    trend?: {
        value: number;
        label: string;
    };
    description?: string;
}

export default function AdminStatCard({
                                          label,
                                          value,
                                          icon,
                                          color,
                                          trend,
                                          description,
                                      }: AdminStatCardProps) {
    const colorClasses = {
        blue: 'from-blue-600 to-blue-400',
        green: 'from-emerald-600 to-emerald-400',
        purple: 'from-purple-600 to-purple-400',
        orange: 'from-orange-600 to-orange-400',
        red: 'from-red-600 to-red-400',
    };

    return (
        <div className="group rounded-lg border border-gray-700/50 bg-gray-900/30 p-6 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{value}</p>

                    {trend && (
                        <div className="mt-2 flex items-center gap-1">
                            <span
                                className={`text-sm font-medium ${
                                    trend.value > 0 ? 'text-emerald-400' : 'text-red-400'
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

                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-20`}
                >
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
        </div>
    );
}