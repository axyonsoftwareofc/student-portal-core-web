// app/(dashboard)/admin/avisos/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { Megaphone, Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnnouncementCard } from '@/components/admin/announcements/AnnouncementCard';
import { AnnouncementForm } from '@/components/admin/announcements/AnnouncementForm';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AnnouncementWithDetails, CreateAnnouncementData } from '@/lib/types/announcements';
import { showToast } from '@/lib/toast';

interface Track {
    id: string;
    name: string;
}

interface Phase {
    id: string;
    name: string;
}

interface Module {
    id: string;
    name: string;
}

export default function AvisosPage() {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [tracks, setTracks] = useState<Track[]>([]);
    const [phases, setPhases] = useState<Phase[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementWithDetails | null>(null);

    const {
        announcements,
        isLoading,
        error,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        togglePin,
        toggleActive,
        refresh,
    } = useAnnouncements();

    useEffect(() => {
        async function fetchData() {
            try {
                const [tracksRes, phasesRes, modulesRes] = await Promise.all([
                    supabase.from('tracks').select('id, name').eq('is_active', true).order('order_index'),
                    supabase.from('phases').select('id, name').eq('is_active', true).order('number'),
                    supabase.from('modules').select('id, name').eq('status', 'PUBLISHED').order('order_index'),
                ]);

                setTracks(tracksRes.data || []);
                setPhases(phasesRes.data || []);
                setModules(modulesRes.data || []);
            } catch (err) {
                console.error('Erro ao carregar dados:', err);
            } finally {
                setIsLoadingData(false);
            }
        }

        fetchData();
    }, [supabase]);

    const handleCreate = () => {
        setEditingAnnouncement(null);
        setIsFormOpen(true);
    };

    const handleEdit = (announcement: AnnouncementWithDetails) => {
        setEditingAnnouncement(announcement);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: CreateAnnouncementData): Promise<{ success: boolean; error?: string }> => {
        if (editingAnnouncement) {
            return updateAnnouncement(editingAnnouncement.id, data);
        }
        return createAnnouncement(data);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este aviso?')) return;

        const result = await deleteAnnouncement(id);
        if (result.success) {
            showToast('success', 'Aviso excluído!');
        } else {
            showToast('error', result.error || 'Erro ao excluir');
        }
    };

    const handleTogglePin = async (id: string, isPinned: boolean) => {
        const result = await togglePin(id, isPinned);
        if (result.success) {
            showToast('success', isPinned ? 'Aviso fixado!' : 'Aviso desafixado!');
        }
    };

    const handleToggleActive = async (id: string, isActive: boolean) => {
        const result = await toggleActive(id, isActive);
        if (result.success) {
            showToast('success', isActive ? 'Aviso ativado!' : 'Aviso desativado!');
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingAnnouncement(null);
    };

    const activeAnnouncements = announcements.filter((a: AnnouncementWithDetails) => a.is_active);
    const inactiveAnnouncements = announcements.filter((a: AnnouncementWithDetails) => !a.is_active);

    if (isLoading || isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                        <Megaphone className="h-6 w-6 text-amber-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Avisos</h1>
                        <p className="text-gray-400">Comunique-se com seus alunos</p>
                    </div>
                </div>

                <Button onClick={handleCreate} className="bg-sky-600 hover:bg-sky-500 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Aviso
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Total" value={announcements.length} color="sky" />
                <StatsCard label="Ativos" value={activeAnnouncements.length} color="emerald" />
                <StatsCard label="Fixados" value={announcements.filter((a: AnnouncementWithDetails) => a.is_pinned).length} color="violet" />
                <StatsCard label="Inativos" value={inactiveAnnouncements.length} color="gray" />
            </div>

            {/* Error */}
            {error && (
                <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-4 text-center">
                    <p className="text-rose-400">{error}</p>
                    <Button variant="outline" onClick={refresh} className="mt-3">
                        Tentar novamente
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {announcements.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-900/30 border border-gray-800 rounded-xl">
                    <Megaphone className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Nenhum aviso ainda
                    </h3>
                    <p className="text-gray-400 text-center max-w-md mb-6">
                        Crie seu primeiro aviso para comunicar novidades, lembretes ou informações importantes para seus alunos.
                    </p>
                    <Button onClick={handleCreate} className="bg-sky-600 hover:bg-sky-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar primeiro aviso
                    </Button>
                </div>
            )}

            {/* Active Announcements */}
            {activeAnnouncements.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">
                        Avisos Ativos ({activeAnnouncements.length})
                    </h2>
                    <div className="space-y-3">
                        {activeAnnouncements.map((announcement: AnnouncementWithDetails) => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onTogglePin={handleTogglePin}
                                onToggleActive={handleToggleActive}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Inactive Announcements */}
            {inactiveAnnouncements.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-400">
                        Avisos Inativos ({inactiveAnnouncements.length})
                    </h2>
                    <div className="space-y-3">
                        {inactiveAnnouncements.map((announcement: AnnouncementWithDetails) => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onTogglePin={handleTogglePin}
                                onToggleActive={handleToggleActive}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}
                        </DialogTitle>
                    </DialogHeader>
                    <AnnouncementForm
                        tracks={tracks}
                        phases={phases}
                        modules={modules}
                        announcement={editingAnnouncement}
                        onSubmit={handleSubmit}
                        onCancel={handleCloseForm}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface StatsCardProps {
    label: string;
    value: number;
    color: 'sky' | 'emerald' | 'violet' | 'gray';
}

function StatsCard({ label, value, color }: StatsCardProps) {
    const colors = {
        sky: 'bg-sky-500/20 text-sky-400',
        emerald: 'bg-emerald-500/20 text-emerald-400',
        violet: 'bg-violet-500/20 text-violet-400',
        gray: 'bg-gray-500/20 text-gray-400',
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className={`text-sm ${colors[color]}`}>{label}</p>
        </div>
    );
}