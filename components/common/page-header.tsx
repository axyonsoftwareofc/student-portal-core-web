// components/common/page-header.tsx
import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderAction {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: "primary" | "secondary" | "outline";
}

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: PageHeaderAction[];
    children?: ReactNode;
    className?: string;
}

export function PageHeader({
                               title,
                               description,
                               actions,
                               children,
                               className,
                           }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
            <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {description && (
                    <p className="text-gray-400">{description}</p>
                )}
            </div>

            {actions && actions.length > 0 && (
                <div className="flex items-center gap-2">
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        const variants = {
                            primary: "bg-sky-600 text-white hover:bg-sky-500",
                            secondary: "bg-gray-800 text-gray-200 hover:bg-gray-700",
                            outline: "border border-gray-700 text-gray-300 hover:bg-gray-800",
                        };

                        return (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className={cn(
                                    "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors",
                                    variants[action.variant || "primary"]
                                )}
                            >
                                {Icon && <Icon className="h-5 w-5" strokeWidth={1.5} />}
                                <span>{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {children}
        </div>
    );
}