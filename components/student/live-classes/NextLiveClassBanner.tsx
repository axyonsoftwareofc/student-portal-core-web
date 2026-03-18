// components/student/live-classes/NextLiveClassBanner.tsx
'use client';

import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Video, Calendar, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveClassWithDetails } from '@/lib/types/live-classes';

interface NextLiveClassBannerProps {
    liveClass: LiveClassWithDetails;
}

export function NextLiveClassBanner({ liveClass }: NextLiveClassBannerProps) {
    const scheduledDate = new Date(liveClass.scheduled_at);
    const isLive = liveClass.status === 'live';

    const getDateLabel = () => {
        if (isToday(scheduledDate)) {
            return `Hoje às ${format(scheduledDate, 'HH:mm')}`;
        }
        if (isTomorrow(scheduledDate)) {
            return `Amanhã às ${format(scheduledDate, 'HH:mm')}`;
        }
        return format(scheduledDate, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    };

    const timeUntil = formatDistanceToNow(scheduledDate, { locale: ptBR, addSuffix: false });

    return (
        <div
            className={cn(
                'rounded-xl border p-4 sm:p-5',
                isLive
                    ? 'bg-rose-950/30 border-rose-500/50'
                    : 'bg-sky-950/30 border-sky-500/50'
            )}
        >
            <div className="flex items-start gap-4">
                {/* Ícone */}
                <div
                    className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
                        isLive ? 'bg-rose-500/20' : 'bg-sky-500/20'
                    )}
                >
                    {isLive ? (
                        <div className="relative">
                            <Video className="h-6 w-6 text-rose-400" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
                        </div>
                    ) : (
                        <Calendar className="h-6 w-6 text-sky-400" />
                    )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {isLive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                                🔴 AO VIVO AGORA
                            </span>
                        ) : (
                            <span className="text-sm font-medium text-sky-400">
                                Próxima aula ao vivo
                            </span>
                        )}
                    </div>

                    <h3 className="font-semibold text-white text-lg">
                        {liveClass.title}
                    </h3>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="inline-flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {getDateLabel()}
                        </span>
                        {!isLive && (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                em {timeUntil}
                            </span>
                        )}
                    </div>

                    {liveClass.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {liveClass.description}
                        </p>
                    )}
                </div>

                {/* Botão */}
                {liveClass.meet_url && (
                    <a
                        href={liveClass.meet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-colors',
                            isLive
                                ? 'bg-rose-600 hover:bg-rose-500'
                                : 'bg-sky-600 hover:bg-sky-500'
                        )}
                    >
                        <Video className="h-4 w-4" />
                        <span className="hidden sm:inline">
                            {isLive ? 'Entrar Agora' : 'Link da Sala'}
                        </span>
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>
        </div>
    );
}