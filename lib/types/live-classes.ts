// lib/types/live-classes.ts

// Status da aula ao vivo
export type LiveClassStatus = 'scheduled' | 'live' | 'recorded' | 'cancelled';

// Aula ao vivo
export interface LiveClass {
    id: string;
    title: string;
    description: string | null;
    scheduled_at: string;
    video_url: string | null;
    meet_url: string | null;
    duration_minutes: number | null;
    module_id: string | null;
    phase_id: string | null;
    track_id: string | null;
    status: LiveClassStatus;
    thumbnail_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Aula ao vivo com dados extras (da view)
export interface LiveClassWithDetails extends LiveClass {
    module_name: string | null;
    phase_name: string | null;
    track_name: string | null;
    views_count: number;
    is_watched?: boolean;
}

// Registro de visualização
export interface LiveClassView {
    id: string;
    live_class_id: string;
    user_id: string;
    watched_at: string;
}

// Dados para criar aula ao vivo
export interface CreateLiveClassData {
    title: string;
    description?: string | null;
    scheduled_at: string;
    video_url?: string | null;
    meet_url?: string | null;
    duration_minutes?: number | null;
    module_id?: string | null;
    phase_id?: string | null;
    track_id?: string | null;
    status?: LiveClassStatus;
    thumbnail_url?: string | null;
}

// Dados para atualizar aula ao vivo
export interface UpdateLiveClassData extends Partial<CreateLiveClassData> {
    is_active?: boolean;
}

// Configurações visuais por status
export const LIVE_CLASS_STATUS_CONFIG: Record<LiveClassStatus, {
    label: string;
    icon: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
}> = {
    scheduled: {
        label: 'Agendada',
        icon: '📅',
        bgColor: 'bg-sky-950/30',
        borderColor: 'border-sky-500/50',
        textColor: 'text-sky-400',
    },
    live: {
        label: 'Ao Vivo',
        icon: '🔴',
        bgColor: 'bg-rose-950/30',
        borderColor: 'border-rose-500/50',
        textColor: 'text-rose-400',
    },
    recorded: {
        label: 'Gravada',
        icon: '🎬',
        bgColor: 'bg-emerald-950/30',
        borderColor: 'border-emerald-500/50',
        textColor: 'text-emerald-400',
    },
    cancelled: {
        label: 'Cancelada',
        icon: '❌',
        bgColor: 'bg-gray-950/30',
        borderColor: 'border-gray-500/50',
        textColor: 'text-gray-400',
    },
};

// Labels para status
export const STATUS_LABELS: Record<LiveClassStatus, string> = {
    scheduled: 'Agendada',
    live: 'Ao Vivo Agora',
    recorded: 'Gravação Disponível',
    cancelled: 'Cancelada',
};