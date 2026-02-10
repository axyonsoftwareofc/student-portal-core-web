// components/common/empty-state.tsx
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
                               icon: Icon,
                               title,
                               description,
                               action,
                               className,
                           }: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-12 text-center rounded-lg border border-gray-800/50 bg-gray-900/30",
            className
        )}>
            <Icon className="h-12 w-12 text-gray-600" strokeWidth={1.5} />
            <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
            {description && (
                <p className="mt-1 text-gray-400">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}