// components/admin/leads/LeadsFilters.tsx
'use client';

import { Search } from 'lucide-react';
import { LeadStatus } from '@/lib/types/leads';
import { cn } from '@/lib/utils';

type FilterOption = LeadStatus | 'all';

interface FilterTab {
    value: FilterOption;
    label: string;
}

const FILTER_TABS: FilterTab[] = [
    { value: 'all', label: 'Todos' },
    { value: 'new', label: 'Novos' },
    { value: 'contacted', label: 'Contatados' },
    { value: 'converted', label: 'Convertidos' },
    { value: 'declined', label: 'Declinados' },
];

interface LeadsFiltersProps {
    activeFilter: FilterOption;
    searchQuery: string;
    onFilterChange: (filter: FilterOption) => void;
    onSearchChange: (query: string) => void;
}

export function LeadsFilters({
                                 activeFilter,
                                 searchQuery,
                                 onFilterChange,
                                 onSearchChange,
                             }: LeadsFiltersProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {FILTER_TABS.map((tab: FilterTab) => (
                    <button
                        key={tab.value}
                        onClick={() => onFilterChange(tab.value)}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                            activeFilter === tab.value
                                ? 'bg-sky-500 text-white'
                                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                <input
                    type="text"
                    placeholder="Buscar por nome, e-mail ou telefone..."
                    value={searchQuery}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-200"
                />
            </div>
        </div>
    );
}

export type { FilterOption };