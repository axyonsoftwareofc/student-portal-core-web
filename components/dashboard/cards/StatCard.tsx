// components/dashboard/cards/StatCard.tsx
export default function StatCard({
                                     label,
                                     value,
                                     icon,
                                     color,
                                     trend,
                                     description,
                                 }: {
    label: string;
    value: string;
    icon: string;
    color: string;
    trend: string;
    description: string;
}) {
    return (
        <div className="group relative h-full overflow-hidden rounded-lg sm:rounded-xl border border-gray-700/50 bg-gray-900/30 p-3 sm:p-4 lg:p-6 backdrop-blur transition-all duration-300 hover:border-violet-500/50 hover:bg-gray-900/60">
            {/* Background gradient effect */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-2 sm:gap-4">
                {/* Header with icon and label */}
                <div className="flex items-start justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400 line-clamp-1">
                        {label}
                    </p>
                    <span className="text-lg sm:text-2xl">{icon}</span>
                </div>

                {/* Value */}
                <div className="flex flex-col gap-1 sm:gap-2">
                    <p
                        className={`bg-gradient-to-r ${color} bg-clip-text text-xl sm:text-2xl lg:text-3xl font-bold text-transparent`}
                    >
                        {value}
                    </p>

                    {/* Trend and description */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="text-xs font-semibold text-emerald-400">
                            {trend}
                        </span>
                        <span className="text-xs text-gray-500 hidden sm:inline">
                            {description}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}