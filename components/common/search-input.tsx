// components/common/search-input.tsx
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchInput({
                                value,
                                onChange,
                                placeholder = "Buscar...",
                                className,
                            }: SearchInputProps) {
    return (
        <div className={cn("relative flex-1", className)}>
            <Search
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                strokeWidth={1.5}
            />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
            />
        </div>
    );
}