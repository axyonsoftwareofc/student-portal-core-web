// components/admin/leads/LeadCard.tsx
'use client';

import { Phone, Mail, Calendar, MessageSquare, Eye } from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types/leads';
import { cn } from '@/lib/utils';

interface StatusConfig {
    label: string;
    className: string;
}

const STATUS_MAP: Record<LeadStatus, StatusConfig> = {
    new: { label: 'Novo', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    contacted: { label: 'Contatado', className: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    converted: { label: 'Convertido', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    declined: { label: 'Declinado', className: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

const SOURCE_LABELS: Record<string, string> = {
    google: 'Google',
    instagram: 'Instagram',
    indicacao: 'Indicação',
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
    outro: 'Outro',
};

interface LeadCardProps {
    lead: Lead;
    onViewDetails: (lead: Lead) => void;
}

export function LeadCard({ lead, onViewDetails }: LeadCardProps) {
    const statusConfig = STATUS_MAP[lead.status as LeadStatus];
    const formattedDate = new Date(lead.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const sourceLabel = lead.source ? SOURCE_LABELS[lead.source] || lead.source : null;

    return (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600/50 transition-all duration-200">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-white font-semibold truncate">{lead.name}</h3>
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', statusConfig.className)}>
              {statusConfig.label}
            </span>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
                            <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
                            <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
                            <span>{formattedDate}</span>
                            {sourceLabel && (
                                <>
                                    <span className="text-gray-600">•</span>
                                    <span>{sourceLabel}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {lead.message && (
                        <div className="flex items-start gap-2 text-sm text-gray-400 bg-gray-900/50 rounded-lg p-3">
                            <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                            <p className="line-clamp-2">{lead.message}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onViewDetails(lead)}
                    className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all duration-200"
                    title="Ver detalhes"
                >
                    <Eye className="h-5 w-5" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}