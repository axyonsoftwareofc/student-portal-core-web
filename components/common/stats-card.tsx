// components/common/stats-card.tsx
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsCardVariant = "default" | "success" | "warning" | "danger" | "info";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    variant?: StatsCardVariant;
    className?: string;
}

const variantStyles: Record<StatsCardVariant, { text: string; iconBg: string }> = {
    default: {
        text: "text-white",
        iconBg: "bg-sky-500/10 text-sky-400",
    },
    success: {
        text: "text-emerald-400",
        iconBg: "bg-emerald-500/10 text-emerald-400",
    },
    warning: {
        text: "text-amber-400",
        iconBg: "bg-amber-500/10 text-amber-400",
    },
    danger: {
        text: "text-rose-400",
        iconBg: "bg-rose-500/10 text-rose-400",
    },
    info: {
        text: "text-sky-400",
        iconBg: "bg-sky-500/10 text-sky-400",
    },
};

export function StatsCard({
                              title,
                              value,
                              subtitle,
                              icon: Icon,
                              variant = "default",
                              className,
                          }: StatsCardProps) {
    const styles = variantStyles[variant];

    return (
        <div className={cn(
            "rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-5",
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-400">
                        {title}
                    </p>
                    <p className={cn(
                        "mt-1 sm:mt-2 text-lg sm:text-2xl font-bold truncate",
                        styles.text
                    )}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="mt-0.5 sm:mt-1 text-xs text-gray-500">
                            {subtitle}
                        </p>
                    )}
                </div>

                {Icon && (
                    <div className={cn(
                        "hidden sm:flex h-11 w-11 items-center justify-center rounded-lg",
                        styles.iconBg
                    )}>
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                )}
            </div>
        </div>
    );
}