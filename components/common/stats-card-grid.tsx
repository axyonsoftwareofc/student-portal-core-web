// components/common/stats-card-grid.tsx
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardGridProps {
    children: ReactNode;
    columns?: 2 | 3 | 4;
    className?: string;
}

export function StatsCardGrid({
                                  children,
                                  columns = 4,
                                  className,
                              }: StatsCardGridProps) {
    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={cn(
            "grid gap-3 sm:gap-4",
            gridCols[columns],
            className
        )}>
            {children}
        </div>
    );
}