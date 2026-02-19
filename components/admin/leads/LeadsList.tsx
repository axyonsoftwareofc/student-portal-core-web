// components/admin/leads/LeadsList.tsx
'use client';

import { UserPlus } from 'lucide-react';
import { Lead } from '@/lib/types/leads';
import { LeadCard } from './LeadCard';

interface LeadsListProps {
    leads: Lead[];
    isLoading: boolean;
    onViewDetails: (lead: Lead) => void;
}

export function LeadsList({ leads, isLoading, onViewDetails }: LeadsListProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index: number) => (
                    <div
                        key={index}
                        className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 animate-pulse"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-32 bg-gray-700/50 rounded" />
                                <div className="h-5 w-16 bg-gray-700/50 rounded-full" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-4 w-48 bg-gray-700/50 rounded" />
                                <div className="h-4 w-36 bg-gray-700/50 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto">
                    <UserPlus className="h-8 w-8 text-gray-600" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                    <p className="text-gray-400 font-medium">Nenhum lead encontrado</p>
                    <p className="text-gray-500 text-sm">
                        Os leads aparecerão aqui quando visitantes se inscreverem.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {leads.map((lead: Lead) => (
                <LeadCard
                    key={lead.id}
                    lead={lead}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
}