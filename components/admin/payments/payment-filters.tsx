// components/admin/payments/payment-filters.tsx
'use client';

import { Filter, User, RefreshCw, ChevronDown, Calendar } from 'lucide-react';
import { SearchInput, SelectFilter } from '@/components/common';
import { cn } from '@/lib/utils';
import { type PaymentStatus } from '@/hooks/usePayments';

interface StudentOption {
    id: string;
    name: string;
}

interface PeriodOption {
    value: string;
    label: string;
}

interface PaymentFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: PaymentStatus | 'ALL';
    onStatusChange: (value: PaymentStatus | 'ALL') => void;
    studentFilter: string;
    onStudentChange: (value: string) => void;
    periodFilter: string;
    onPeriodChange: (value: string) => void;
    students: StudentOption[];
    periods: PeriodOption[];
    onRefresh: () => void;
    showFilters: boolean;
    onToggleFilters: () => void;
}

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pendentes' },
    { value: 'PAID', label: 'Pagos' },
    { value: 'OVERDUE', label: 'Atrasados' },
    { value: 'CANCELLED', label: 'Cancelados' },
];

export function PaymentFilters({
                                   searchTerm,
                                   onSearchChange,
                                   statusFilter,
                                   onStatusChange,
                                   studentFilter,
                                   onStudentChange,
                                   periodFilter,
                                   onPeriodChange,
                                   students,
                                   periods,
                                   onRefresh,
                                   showFilters,
                                   onToggleFilters,
                               }: PaymentFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <SearchInput
                    value={searchTerm}
                    onChange={onSearchChange}
                    placeholder="Buscar pagamento..."
                />

                <button
                    onClick={onToggleFilters}
                    className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
                >
                    <Filter className="h-5 w-5" strokeWidth={1.5} />
                    <ChevronDown className={cn('h-4 w-4 transition-transform', showFilters && 'rotate-180')} />
                </button>

                <button
                    onClick={onRefresh}
                    className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 px-3 py-2.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                    <RefreshCw className="h-5 w-5" strokeWidth={1.5} />
                </button>
            </div>

            <div className={cn('flex flex-col gap-2 sm:flex-row', !showFilters && 'hidden lg:flex')}>
                <SelectFilter
                    value={statusFilter}
                    onChange={(v) => onStatusChange(v as PaymentStatus | 'ALL')}
                    options={STATUS_OPTIONS}
                    icon={Filter}
                    placeholder="Todos os status"
                    className="flex-1 lg:flex-none"
                />

                <SelectFilter
                    value={studentFilter}
                    onChange={onStudentChange}
                    options={students.map((s) => ({ value: s.id, label: s.name }))}
                    icon={User}
                    placeholder="Todos os alunos"
                    className="flex-1 lg:flex-none"
                />

                <SelectFilter
                    value={periodFilter}
                    onChange={onPeriodChange}
                    options={periods}
                    icon={Calendar}
                    placeholder="Todos os períodos"
                    className="flex-1 lg:flex-none"
                />
            </div>
        </div>
    );
}