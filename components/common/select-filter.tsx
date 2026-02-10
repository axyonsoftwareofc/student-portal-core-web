// components/common/select-filter.tsx
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFilterProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    icon?: LucideIcon;
    placeholder?: string;
    className?: string;
}

export function SelectFilter({
                                 value,
                                 onChange,
                                 options,
                                 icon: Icon,
                                 placeholder,
                                 className,
                             }: SelectFilterProps) {
    return (
        <div className={cn("relative", className)}>
            {Icon && (
                <Icon
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                    strokeWidth={1.5}
                />
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "appearance-none rounded-lg border border-gray-800 bg-gray-900 py-2.5 pr-10 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50",
                    Icon ? "pl-10" : "pl-4"
                )}
            >
                {placeholder && <option value="ALL">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}