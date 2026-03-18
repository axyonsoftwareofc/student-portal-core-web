// app/(dashboard)/aluno/comunidade/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { Users, Trophy, TrendingUp, Megaphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CommunityFeed } from '@/components/student/community/CommunityFeed';
import { CommunityAnnouncements } from '@/components/student/community/CommunityAnnouncements';
import { useStudentAnnouncements } from '@/hooks/useStudentAnnouncements';

export default function ComunidadePage() {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const {
        announcements,
        unreadCount,
        markAsRead,
    } = useStudentAnnouncements(currentUserId);

    useEffect(() => {
        async function fetchUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUserId(user?.id || null);
            } catch (error) {
                console.error('Erro ao buscar usuário:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUser();
    }, [supabase]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                    <Users className="h-6 w-6 text-violet-400" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Mural da Turma</h1>
                    <p className="text-gray-400">Comemore as conquistas dos colegas!</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                    icon={Megaphone}
                    label="Avisos Novos"
                    value={unreadCount.toString()}
                    color="amber"
                />
                <StatsCard
                    icon={Trophy}
                    label="Conquistas Hoje"
                    value="--"
                    color="emerald"
                />
                <StatsCard
                    icon={Users}
                    label="Alunos Ativos"
                    value="--"
                    color="sky"
                />
                <StatsCard
                    icon={TrendingUp}
                    label="Reações Totais"
                    value="--"
                    color="violet"
                />
            </div>

            {/* Content */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 md:p-6">
                {/* Avisos do Professor */}
                {announcements.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-amber-400" />
                            Avisos do Professor
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-white">
                                    {unreadCount} novo{unreadCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </h2>
                        <CommunityAnnouncements
                            announcements={announcements}
                            onMarkAsRead={markAsRead}
                        />
                    </div>
                )}

                {/* Conquistas da Turma */}
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-emerald-400" />
                        Conquistas da Turma
                    </h2>
                    <CommunityFeed currentUserId={currentUserId} />
                </div>
            </div>
        </div>
    );
}

interface StatsCardProps {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
    value: string;
    color: 'amber' | 'emerald' | 'sky' | 'violet';
}

function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
    const colors = {
        amber: 'bg-amber-500/20 text-amber-400',
        emerald: 'bg-emerald-500/20 text-emerald-400',
        sky: 'bg-sky-500/20 text-sky-400',
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