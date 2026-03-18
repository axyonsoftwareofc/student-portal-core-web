// components/student/live-classes/LiveClassCard.tsx
'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Play, Video, CheckCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveClassWithDetails, LIVE_CLASS_STATUS_CONFIG } from '@/lib/types/live-classes';

interface LiveClassCardProps {
    liveClass: LiveClassWithDetails;
    onWatch: (id: string) => void;
}

export function LiveClassCard({ liveClass, onWatch }: LiveClassCardProps) {
    const config = LIVE_CLASS_STATUS_CONFIG[liveClass.status];
    const scheduledDate = new Date(liveClass.scheduled_at);
    const formattedDate = format(scheduledDate, "dd 'de' MMM", { locale: ptBR });
    const formattedTime = format(scheduledDate, "HH:mm", { locale: ptBR });

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}min`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}min`;
    };

    const handleClick = () => {
        if (liveClass.video_url) {
            onWatch(liveClass.id);
            window.open(liveClass.video_url, '_blank');
        } else if (liveClass.meet_url) {
            window.open(liveClass.meet_url, '_blank');
        }
    };

    const hasLink = liveClass.video_url || liveClass.meet_url;

    return (
        <article
            onClick={hasLink ? handleClick : undefined}
            className={cn(
                'border rounded-xl p-4 transition-all',
                hasLink && 'cursor-pointer hover:border-gray-600',
                liveClass.is_watched
                    ? 'bg-gray-900/30 border-gray-800'
                    : `${config.bgColor} ${config.borderColor}`
            )}
        >
            <div className="flex items-start gap-4">
                {/* Thumbnail ou Ícone */}
                <div
                    className={cn(
                        'flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center',
                        liveClass.is_watched ? 'bg-gray-800' : config.bgColor
                    )}
                >
                    {liveClass.status === 'recorded' ? (
                        <Play className={cn('h-8 w-8', liveClass.is_watched ? 'text-gray-500' : config.textColor)} />
                    ) : liveClass.status === 'live' ? (
                        <div className="relative">
                            <Video className="h-8 w-8 text-rose-400" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
                        </div>
                    ) : (
                        <Calendar className={cn('h-8 w-8', config.textColor)} />
                    )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={cn(
                                    'font-semibold',
                                    liveClass.is_watched ? 'text-gray-400' : 'text-white'
                                )}>
                                    {liveClass.title}
                                </h3>
                                {liveClass.is_watched && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                                        <CheckCircle className="h-3 w-3" />
                                        Assistido
                                    </span>
                                )}
                                {!liveClass.is_watched && liveClass.status === 'recorded' && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-sky-500/20 text-sky-400">
                                        Novo
                                    </span>
                                )}
                            </div>

                            {liveClass.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                    {liveClass.description}
                                </p>
                            )}
                        </div>

                        {/* Status Badge */}
                        <span
                            className={cn(
                                'flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium',
                                config.bgColor,
                                config.textColor,
                                'border',
                                config.borderColor
                            )}
                        >
                            {config.icon} {config.label}
                        </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formattedDate} às {formattedTime}
                        </span>
                        {liveClass.duration_minutes && (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDuration(liveClass.duration_minutes)}
                            </span>
                        )}
                        {liveClass.views_count > 0 && (
                            <span className="inline-flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {liveClass.views_count}
                            </span>
                        )}
                    </div>

                    {/* Contexto */}
                    {(liveClass.track_name || liveClass.phase_name || liveClass.module_name) && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                            {liveClass.track_name && (
                                <span className="px-2 py-0.5 rounded bg-gray-800">
                                    {liveClass.track_name}
                                </span>
                            )}
                            {liveClass.module_name && (
                                <>
                                    <span>→</span>
                                    <span className="px-2 py-0.5 rounded bg-gray-800">
                                        {liveClass.module_name}
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}