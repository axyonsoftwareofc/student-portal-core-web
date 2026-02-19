// app/(dashboard)/admin/leads/page.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Lead } from '@/lib/types/leads';
import { LeadsHeader } from '@/components/admin/leads/LeadsHeader';
import { LeadsFilters, FilterOption } from '@/components/admin/leads/LeadsFilters';
import { LeadsList } from '@/components/admin/leads/LeadsList';
import { LeadDetailsModal } from '@/components/admin/leads/LeadDetailsModal';

export default function LeadsPage() {
    const {
        leads,
        isLoading,
        markAsContacted,
        convertToStudent,
        declineLead,
        deleteLead,
        updateLead,
    } = useLeads();

    const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const filteredLeads = useMemo((): Lead[] => {
        return leads
            .filter((lead: Lead) => {
                if (activeFilter === 'all') return true;
                return lead.status === activeFilter;
            })
            .filter((lead: Lead) => {
                if (!searchQuery.trim()) return true;
                const normalizedQuery = searchQuery.toLowerCase();
                return (
                    lead.name.toLowerCase().includes(normalizedQuery) ||
                    lead.email.toLowerCase().includes(normalizedQuery) ||
                    lead.phone.includes(normalizedQuery)
                );
            });
    }, [leads, activeFilter, searchQuery]);

    const handleViewDetails = useCallback((lead: Lead): void => {
        setSelectedLead(lead);
    }, []);

    const handleCloseModal = useCallback((): void => {
        setSelectedLead(null);
    }, []);

    const handleMarkAsContacted = useCallback(
        async (leadId: string): Promise<void> => {
            await markAsContacted(leadId);
        },
        [markAsContacted]
    );

    const handleConvertToStudent = useCallback(
        async (leadId: string): Promise<void> => {
            await convertToStudent(leadId, '');
        },
        [convertToStudent]
    );

    const handleDecline = useCallback(
        async (leadId: string): Promise<void> => {
            await declineLead(leadId);
        },
        [declineLead]
    );

    const handleDelete = useCallback(
        async (leadId: string): Promise<void> => {
            await deleteLead(leadId);
        },
        [deleteLead]
    );

    const handleUpdateNotes = useCallback(
        async (leadId: string, notes: string): Promise<void> => {
            await updateLead(leadId, { notes });
        },
        [updateLead]
    );

    return (
        <div className="space-y-6">
            <LeadsHeader leads={leads} />

            <LeadsFilters
                activeFilter={activeFilter}
                searchQuery={searchQuery}
                onFilterChange={setActiveFilter}
                onSearchChange={setSearchQuery}
            />

            <LeadsList
                leads={filteredLeads}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
            />

            {selectedLead && (
                <LeadDetailsModal
                    lead={selectedLead}
                    isOpen={true}
                    onClose={handleCloseModal}
                    onMarkAsContacted={handleMarkAsContacted}
                    onConvertToStudent={handleConvertToStudent}
                    onDecline={handleDecline}
                    onDelete={handleDelete}
                    onUpdateNotes={handleUpdateNotes}
                />
            )}
        </div>
    );
}