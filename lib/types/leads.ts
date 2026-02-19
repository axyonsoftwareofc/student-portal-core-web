export type LeadStatus = 'new' | 'contacted' | 'converted' | 'declined';
export type LeadSource = 'google' | 'instagram' | 'indicacao' | 'outro';

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    source: string | null;
    message: string | null;
    status: LeadStatus;
    created_at: string;
    contacted_at: string | null;
    converted_at: string | null;
    notes: string | null;
}

export interface CreateLeadDTO {
    name: string;
    email: string;
    phone: string;
    source?: string;
    message?: string;
}

export interface UpdateLeadDTO {
    name?: string;
    email?: string;
    phone?: string;
    source?: string;
    message?: string;
    notes?: string;
}

export interface UseLeadsReturn {
    leads: Lead[];
    isLoading: boolean;
    error: string | null;
    createLead: (data: CreateLeadDTO) => Promise<Lead>;
    updateLead: (id: string, data: UpdateLeadDTO) => Promise<void>;
    markAsContacted: (id: string) => Promise<void>;
    convertToStudent: (leadId: string, courseId: string) => Promise<void>;
    declineLead: (id: string) => Promise<void>;
    deleteLead: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
}