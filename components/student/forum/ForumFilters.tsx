// components/student/forum/ForumFilters.tsx
'use client';

import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ForumFilters as ForumFiltersType, QuestionStatus } from '@/lib/types/forum';

interface Module {
    id: string;
    name: string;
}

interface ForumFiltersProps {
    filters: ForumFiltersType;
    onFiltersChange: (filters: ForumFiltersType) => void;
    modules: Module[];
    showMyQuestionsFilter?: boolean;
}

export function ForumFilters({
                                 filters,
                                 onFiltersChange,
                                 modules,
                                 showMyQuestionsFilter = true,
                             }: ForumFiltersProps) {
    const statusOptions: { value: QuestionStatus | 'all'; label: string }[] = [
        { value: 'all', label: 'Todas' },
        { value: 'open', label: 'Abertas' },
        { value: 'answered', label: 'Respondidas' },
        { value: 'closed', label: 'Resolvidas' },
    ];

    const hasActiveFilters =
        filters.status !== 'all' ||
        filters.module_id ||
        filters.search ||
        filters.onlyMine;

    const clearFilters = () => {
        onFiltersChange({
            status: 'all',
            module_id: null,
            search: '',
            onlyMine: false,
        });
    };

    return (
        <div className="space-y-4">
            {/* Search + Status */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        value={filters.search || ''}
                        onChange={(e) =>
                            onFiltersChange({ ...filters, search: e.target.value })
                        }
                        placeholder="Buscar perguntas..."
                        className={cn(
                            'w-full pl-10 pr-4 py-2.5 rounded-lg',
                            'bg-gray-800 border border-gray-700',
                            'text-white placeholder-gray-500',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                            'transition-all'
                        )}
                    />
                </div>

                {/* Status Filter */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-800 rounded-lg sm:flex">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() =>
                                onFiltersChange({ ...filters, status: option.value })
                            }
                            className={cn(
                                'min-h-11 px-3 py-1.5 rounded-md text-sm font-medium transition-all sm:min-h-0',
                                filters.status === option.value
                                    ? 'bg-sky-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Module + My Questions */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Module Filter */}
                <div className="relative w-full sm:w-auto">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <select
                        value={filters.module_id || ''}
                        onChange={(e) =>
                            onFiltersChange({
                                ...filters,
                                module_id: e.target.value || null,
                                lesson_id: null,
                            })
                        }
                        className={cn(
                            'w-full min-h-11 pl-10 pr-8 py-2.5 rounded-lg appearance-none sm:w-auto sm:min-h-0',
                            'bg-gray-800 border border-gray-700',
                            'text-white',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                            'transition-all sm:min-w-[200px]'
                        )}
                    >
                        <option value="">Todos os módulos</option>
                        {modules.map((module: Module) => (
                            <option key={module.id} value={module.id}>
                                {module.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* My Questions Toggle */}
                {showMyQuestionsFilter && (
                    <button
                        onClick={() =>
                            onFiltersChange({ ...filters, onlyMine: !filters.onlyMine })
                        }
                        className={cn(
                            'min-h-11 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all sm:min-h-0 sm:w-auto',
                            'border',
                            filters.onlyMine
                                ? 'bg-sky-600 border-sky-500 text-white'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        )}
                    >
                        Minhas perguntas
                    </button>
                )}

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-11 text-gray-400 hover:text-white sm:h-8"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Limpar filtros
                    </Button>
                )}
            </div>
        </div>
    );
}