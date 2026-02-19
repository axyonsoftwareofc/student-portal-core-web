// components/admin/leads/LeadsHeader.tsx
'use client';

import { UserPlus, Users, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Lead } from '@/lib/types/leads';

interface LeadStats {
    total: number;
    newCount: number;
    contactedCount: number;
    convertedCount: number;
    declinedCount: number;
}

interface LeadsHeaderProps {
    leads: Lead[];
}

export function LeadsHeader({ leads }: LeadsHeaderProps) {
    const stats: LeadStats = {
        total: leads.length,
        newCount: leads.filter((lead: Lead) => lead.status === 'new').length,
        contactedCount: leads.filter((lead: Lead) => lead.status === 'contacted').length,
        convertedCount: leads.filter((lead: Lead) => lead.status === 'converted').length,
        declinedCount: leads.filter((lead: Lead) => lead.status === 'declined').length,
    };

    const statCards = [
        {
            label: 'Total',
            value: stats.total,
            icon: Users,
            colorClass: 'text-sky-400 bg-sky-500/10',
        },
        {
            label: 'Novos',
            value: stats.newCount,
            icon: UserPlus,
            colorClass: 'text-amber-400 bg-amber-500/10',
        },
        {
            label: 'Contatados',
            value: stats.contactedCount,
            icon: Phone,
            colorClass: 'text-sky-400 bg-sky-500/10',
        },
        {
            label: 'Convertidos',
            value: stats.convertedCount,
            icon: CheckCircle,
            colorClass: 'text-emerald-400 bg-emerald-500/10',
        },
        {
            label: 'Declinados',
            value: stats.declinedCount,
            icon: XCircle,
            colorClass: 'text-rose-400 bg-rose-500/10',
        },
    ] as const;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Leads</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Gerencie os interessados no curso
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.colorClass}`}>
                                <stat.icon className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}