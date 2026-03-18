// app/(dashboard)/aluno/aulas-ao-vivo/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { Video, Loader2, Calendar, Play } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LiveClassCard } from '@/components/student/live-classes/LiveClassCard';
import { NextLiveClassBanner } from '@/components/student/live-classes/NextLiveClassBanner';
import { useStudentLiveClasses } from '@/hooks/useStudentLiveClasses';
import { LiveClassWithDetails } from '@/lib/types/live-classes';

export default function AulasAoVivoPage() {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUserId(user?.id || null);
            } catch (error) {
                console.error('Erro ao buscar usuário:', error);
            } finally {
                setIsLoadingUser(false);
            }
        }

        fetchUser();
    }, [supabase]);

    const {
        liveClasses,
        nextClass,
        recentRecordings,
        unwatchedCount,
        isLoading,
        error,
        markAsWatched,
    } = useStudentLiveClasses(currentUserId);

    if (isLoadingUser || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    const upcomingClasses = liveClasses.filter((lc: LiveClassWithDetails) =>
        lc.status === 'scheduled' && new Date(lc.scheduled_at) > new Date()
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                    <Video className="h-6 w-6 text-violet-400" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Aulas ao Vivo</h1>
                    <p className="text-gray-400">Gravações e próximas aulas</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    icon={Calendar}
                    label="Próximas"
                    value={upcomingClasses.length.toString()}
                    color="sky"
                />
                <StatsCard
                    icon={Play}
                    label="Gravações"
                    value={recentRecordings.length.toString()}
                    color="emerald"
                />
                <StatsCard
                    icon={Video}
                    label="Não Assistidas"
                    value={unwatchedCount.toString()}
                    color="amber"
                />
                <StatsCard
                    icon={Video}
                    label="Total"
                    value={liveClasses.length.toString()}
                    color="violet"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-4 text-center">
                    <p className="text-rose-400">{error}</p>
                </div>
            )}

            {/* Next Class Banner */}
            {nextClass && (
                <NextLiveClassBanner liveClass={nextClass} />
            )}

            {/* Empty State */}
            {liveClasses.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-900/30 border border-gray-800 rounded-xl">
                    <Video className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Nenhuma aula ao vivo ainda
                    </h3>
                    <p className="text-gray-400 text-center max-w-md">
                        Quando o professor agendar ou gravar aulas ao vivo, elas aparecerão aqui.
                    </p>
                </div>
            )}

            {/* Recordings */}
            {recentRecordings.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Play className="h-5 w-5 text-emerald-400" />
                            Gravações Disponíveis
                            {unwatchedCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-sky-500 text-white">
                                    {unwatchedCount} nova{unwatchedCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {recentRecordings.map((liveClass: LiveClassWithDetails) => (
                            <LiveClassCard
                                key={liveClass.id}
                                liveClass={liveClass}
                                onWatch={markAsWatched}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Classes */}
            {upcomingClasses.length > 1 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-sky-400" />
                        Próximas Aulas
                    </h2>
                    <div className="space-y-3">
                        {upcomingClasses.slice(1).map((liveClass: LiveClassWithDetails) => (
                            <LiveClassCard
                                key={liveClass.id}
                                liveClass={liveClass}
                                onWatch={markAsWatched}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

interface StatsCardProps {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
    value: string;
    color: 'sky' | 'emerald' | 'amber' | 'violet';
}

function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
    const colors = {
        sky: 'bg-sky-500/20 text-sky-400',
        emerald: 'bg-emerald-500/20 text-emerald-400',
        amber: 'bg-amber-500/20 text-amber-400',
        violet: 'bg-violet-500/20 text-violet-400',
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-gray-400">{label}</p>
                </div>
            </div>
        </div>
    );
}