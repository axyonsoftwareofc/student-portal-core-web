// components/student/live-classes/LiveClassDashboardCard.tsx
'use client';

import Link from 'next/link';
import { format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Video, Calendar, ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveClassWithDetails } from '@/lib/types/live-classes';

interface LiveClassDashboardCardProps {
    nextClass: LiveClassWithDetails | null;
    recentCount: number;
    unwatchedCount: number;
}

export function LiveClassDashboardCard({
                                           nextClass,
                                           recentCount,
                                           unwatchedCount,
                                       }: LiveClassDashboardCardProps) {
    const getDateLabel = (date: Date) => {
        if (isToday(date)) return `Hoje às ${format(date, 'HH:mm')}`;
        if (isTomorrow(date)) return `Amanhã às ${format(date, 'HH:mm')}`;
        return format(date, "dd/MM 'às' HH:mm");
    };

    const isLive = nextClass?.status === 'live';

    return (
        <div
            className={cn(
                'rounded-xl border p-4 sm:p-5',
                isLive
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-gray-900/30 border-gray-800'
            )}
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            isLive ? 'bg-rose-500/20' : 'bg-violet-500/20'
                        )}
                    >
                        <Video
                            className={cn('h-5 w-5', isLive ? 'text-rose-400' : 'text-violet-400')}
                            strokeWidth={1.5}
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Aulas ao Vivo</h3>
                        {unwatchedCount > 0 && (
                            <p className="text-xs text-sky-400">
                                {unwatchedCount} nova{unwatchedCount !== 1 ? 's' : ''} gravação{unwatchedCount !== 1 ? 'ões' : ''}
                            </p>
                        )}
                    </div>
                </div>

                <Link
                    href="/aluno/aulas-ao-vivo"
                    className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                    Ver todas
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
            </div>

            {nextClass ? (
                <div className="space-y-3">
                    {/* Próxima aula */}
                    <div
                        className={cn(
                            'rounded-lg p-3',
                            isLive ? 'bg-rose-950/30' : 'bg-gray-800/50'
                        )}
                    >
                        {isLive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white mb-2">
                                🔴 AO VIVO
                            </span>
                        )}
                        <p className="font-medium text-white line-clamp-1">
                            {nextClass.title}
                        </p>
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {getDateLabel(new Date(nextClass.scheduled_at))}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                            {recentCount} gravação{recentCount !== 1 ? 'ões' : ''} disponível{recentCount !== 1 ? 'is' : ''}
                        </span>
                        {nextClass.meet_url && (
                            <a
                                href={nextClass.meet_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors',
                                    isLive
                                        ? 'bg-rose-600 hover:bg-rose-500'
                                        : 'bg-sky-600 hover:bg-sky-500'
                                )}
                            >
                                <Video className="h-3.5 w-3.5" />
                                {isLive ? 'Entrar' : 'Sala'}
                            </a>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-4">
                    <Play className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                        {recentCount > 0
                            ? `${recentCount} gravação${recentCount !== 1 ? 'ões' : ''} disponível${recentCount !== 1 ? 'is' : ''}`
                            : 'Nenhuma aula agendada'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}