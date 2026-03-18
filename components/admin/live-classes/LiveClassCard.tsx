// components/admin/live-classes/LiveClassCard.tsx
'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Calendar,
    Clock,
    Video,
    ExternalLink,
    MoreVertical,
    Trash2,
    Edit,
    Eye,
    Play,
    Radio,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    LiveClassWithDetails,
    LiveClassStatus,
    LIVE_CLASS_STATUS_CONFIG,
} from '@/lib/types/live-classes';

interface LiveClassCardProps {
    liveClass: LiveClassWithDetails;
    onEdit: (liveClass: LiveClassWithDetails) => void;
    onDelete: (id: string) => void;
    onUpdateStatus: (id: string, status: LiveClassStatus) => void;
}

export function LiveClassCard({
                                  liveClass,
                                  onEdit,
                                  onDelete,
                                  onUpdateStatus,
                              }: LiveClassCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const config = LIVE_CLASS_STATUS_CONFIG[liveClass.status];
    const scheduledDate = new Date(liveClass.scheduled_at);
    const formattedDate = format(scheduledDate, "dd 'de' MMMM', às' HH:mm", { locale: ptBR });
    const isPast = scheduledDate < new Date();

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}min`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}min`;
    };

    return (
        <article
            className={cn(
                'border rounded-xl p-4 transition-all',
                config.bgColor,
                config.borderColor
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl flex-shrink-0">{config.icon}</span>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white">
                                {liveClass.title}
                            </h3>
                            <span
                                className={cn(
                                    'px-2 py-0.5 rounded-full text-xs font-medium',
                                    config.bgColor,
                                    config.textColor,
                                    'border',
                                    config.borderColor
                                )}
                            >
                                {config.label}
                            </span>
                        </div>

                        {liveClass.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                {liveClass.description}
                            </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formattedDate}
                            </span>
                            {liveClass.duration_minutes && (
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatDuration(liveClass.duration_minutes)}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {liveClass.views_count} visualizações
                            </span>
                        </div>

                        {/* Contexto */}
                        {(liveClass.track_name || liveClass.phase_name || liveClass.module_name) && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                {liveClass.track_name && (
                                    <span className="px-2 py-0.5 rounded bg-gray-800">
                                        {liveClass.track_name}
                                    </span>
                                )}
                                {liveClass.phase_name && (
                                    <span className="px-2 py-0.5 rounded bg-gray-800">
                                        {liveClass.phase_name}
                                    </span>
                                )}
                                {liveClass.module_name && (
                                    <span className="px-2 py-0.5 rounded bg-gray-800">
                                        {liveClass.module_name}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>

                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-8 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[180px]">
                                <button
                                    onClick={() => {
                                        onEdit(liveClass);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Editar
                                </button>

                                {liveClass.status === 'scheduled' && (
                                    <button
                                        onClick={() => {
                                            onUpdateStatus(liveClass.id, 'live');
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-rose-400 hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Radio className="h-4 w-4" />
                                        Iniciar Ao Vivo
                                    </button>
                                )}

                                {liveClass.status === 'live' && (
                                    <button
                                        onClick={() => {
                                            onUpdateStatus(liveClass.id, 'recorded');
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-emerald-400 hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Finalizar (Gravada)
                                    </button>
                                )}

                                {liveClass.status !== 'recorded' && liveClass.status !== 'cancelled' && (
                                    <button
                                        onClick={() => {
                                            onUpdateStatus(liveClass.id, 'cancelled');
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-400 hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Cancelar Aula
                                    </button>
                                )}

                                <hr className="my-1 border-gray-700" />

                                <button
                                    onClick={() => {
                                        onDelete(liveClass.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-rose-400 hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Excluir
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-700/50">
                {liveClass.meet_url && (
                    <a
                        href={liveClass.meet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm transition-colors"
                    >
                        <Video className="h-4 w-4" />
                        Entrar na Sala
                    </a>
                )}
                {liveClass.video_url && (
                    <a
                        href={liveClass.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
                    >
                        <Play className="h-4 w-4" />
                        Ver Gravação
                    </a>
                )}
                {!liveClass.meet_url && !liveClass.video_url && (
                    <span className="text-sm text-gray-500">
                        Nenhum link disponível
                    </span>
                )}
            </div>
        </article>
    );
}