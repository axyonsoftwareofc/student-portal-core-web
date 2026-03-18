// lib/types/announcements.ts

// Tipo do aviso
export type AnnouncementType = 'info' | 'warning' | 'urgent' | 'success';

// Escopo do aviso
export type AnnouncementTarget = 'all' | 'track' | 'phase' | 'module';

// Aviso do banco
export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    target: AnnouncementTarget;
    target_id: string | null;
    author_id: string;
    is_pinned: boolean;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

// Aviso com dados extras (da view)
export interface AnnouncementWithDetails extends Announcement {
    author_name: string;
    author_avatar_url: string | null;
    target_name: string | null;
    reads_count: number;
    is_read?: boolean;
}

// Registro de leitura
export interface AnnouncementRead {
    id: string;
    announcement_id: string;
    user_id: string;
    read_at: string;
}

// Dados para criar aviso
export interface CreateAnnouncementData {
    title: string;
    content: string;
    type: AnnouncementType;
    target: AnnouncementTarget;
    target_id?: string | null;
    is_pinned?: boolean;
    expires_at?: string | null;
}

// Dados para atualizar aviso
export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {
    is_active?: boolean;
}

// Configurações visuais por tipo
export const ANNOUNCEMENT_CONFIG: Record<AnnouncementType, {
    label: string;
    icon: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    badgeColor: string;
}> = {
    info: {
        label: 'Informativo',
        icon: '📢',
        bgColor: 'bg-sky-950/30',
        borderColor: 'border-sky-500/50',
        textColor: 'text-sky-400',
        badgeColor: 'bg-sky-500',
    },
    warning: {
        label: 'Atenção',
        icon: '⚠️',
        bgColor: 'bg-amber-950/30',
        borderColor: 'border-amber-500/50',
        textColor: 'text-amber-400',
        badgeColor: 'bg-amber-500',
    },
    urgent: {
        label: 'Urgente',
        icon: '🚨',
        bgColor: 'bg-rose-950/30',
        borderColor: 'border-rose-500/50',
        textColor: 'text-rose-400',
        badgeColor: 'bg-rose-500',
    },
    success: {
        label: 'Novidade',
        icon: '🎉',
        bgColor: 'bg-emerald-950/30',
        borderColor: 'border-emerald-500/50',
        textColor: 'text-emerald-400',
        badgeColor: 'bg-emerald-500',
    },
};

// Labels para target
export const TARGET_LABELS: Record<AnnouncementTarget, string> = {
    all: 'Todos os alunos',
    track: 'Trilha específica',
    phase: 'Fase específica',
    module: 'Módulo específico',
};