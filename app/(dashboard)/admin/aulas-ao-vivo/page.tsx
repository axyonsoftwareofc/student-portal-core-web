// app/(dashboard)/admin/aulas-ao-vivo/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { Video, Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LiveClassCard } from '@/components/admin/live-classes/LiveClassCard';
import { LiveClassForm } from '@/components/admin/live-classes/LiveClassForm';
import { useLiveClasses } from '@/hooks/useLiveClasses';
import { LiveClassWithDetails, CreateLiveClassData, LiveClassStatus } from '@/lib/types/live-classes';
import { showToast } from '@/lib/toast';

interface Track {
    id: string;
    name: string;
}

interface Phase {
    id: string;
    name: string;
    track_id: string;
}

interface Module {
    id: string;
    name: string;
    phase_id: string;
}

export default function AulasAoVivoAdminPage() {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [tracks, setTracks] = useState<Track[]>([]);
    const [phases, setPhases] = useState<Phase[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingClass, setEditingClass] = useState<LiveClassWithDetails | null>(null);

    const {
        liveClasses,
        isLoading,
        error,
        createLiveClass,
        updateLiveClass,
        deleteLiveClass,
        updateStatus,
        refresh,
    } = useLiveClasses();

    useEffect(() => {
        async function fetchData() {
            try {
                const [tracksRes, phasesRes, modulesRes] = await Promise.all([
                    supabase.from('tracks').select('id, name').eq('is_active', true).order('order_index'),
                    supabase.from('phases').select('id, name, track_id').eq('is_active', true).order('number'),
                    supabase.from('modules').select('id, name, phase_id').eq('status', 'PUBLISHED').order('order_index'),
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
        setEditingClass(null);
        setIsFormOpen(true);
    };

    const handleEdit = (liveClass: LiveClassWithDetails) => {
        setEditingClass(liveClass);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: CreateLiveClassData): Promise<{ success: boolean; error?: string }> => {
        if (editingClass) {
            return updateLiveClass(editingClass.id, data);
        }
        return createLiveClass(data);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta aula ao vivo?')) return;

        const result = await deleteLiveClass(id);
        if (result.success) {
            showToast('success', 'Aula excluída!');
        } else {
            showToast('error', result.error || 'Erro ao excluir');
        }
    };

    const handleUpdateStatus = async (id: string, status: LiveClassStatus) => {
        const result = await updateStatus(id, status);
        if (result.success) {
            const labels: Record<LiveClassStatus, string> = {
                scheduled: 'Aula agendada',
                live: 'Aula iniciada!',
                recorded: 'Aula finalizada',
                cancelled: 'Aula cancelada',
            };
            showToast('success', labels[status]);
        } else {
            showToast('error', result.error || 'Erro ao atualizar');
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingClass(null);
    };

    const scheduledClasses = liveClasses.filter((lc: LiveClassWithDetails) =>
        lc.status === 'scheduled' || lc.status === 'live'
    );
    const recordedClasses = liveClasses.filter((lc: LiveClassWithDetails) => lc.status === 'recorded');
    const cancelledClasses = liveClasses.filter((lc: LiveClassWithDetails) => lc.status === 'cancelled');

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
                    <div className="p-2 rounded-lg bg-violet-500/20">
                        <Video className="h-6 w-6 text-violet-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Aulas ao Vivo</h1>
                        <p className="text-gray-400">Gerencie as aulas e gravações</p>
                    </div>
                </div>

                <Button onClick={handleCreate} className="bg-sky-600 hover:bg-sky-500 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Aula
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Total" value={liveClasses.length} color="sky" />
                <StatsCard label="Agendadas" value={scheduledClasses.length} color="amber" />
                <StatsCard label="Gravadas" value={recordedClasses.length} color="emerald" />
                <StatsCard label="Canceladas" value={cancelledClasses.length} color="gray" />
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
            {liveClasses.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-900/30 border border-gray-800 rounded-xl">
                    <Video className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Nenhuma aula ao vivo ainda
                    </h3>
                    <p className="text-gray-400 text-center max-w-md mb-6">
                        Crie sua primeira aula ao vivo para informar os alunos sobre as gravações e próximas aulas.
                    </p>
                    <Button onClick={handleCreate} className="bg-sky-600 hover:bg-sky-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar primeira aula
                    </Button>
                </div>
            )}

            {/* Scheduled/Live Classes */}
            {scheduledClasses.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">
                        Agendadas / Ao Vivo ({scheduledClasses.length})
                    </h2>
                    <div className="space-y-3">
                        {scheduledClasses.map((liveClass: LiveClassWithDetails) => (
                            <LiveClassCard
                                key={liveClass.id}
                                liveClass={liveClass}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Recorded Classes */}
            {recordedClasses.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">
                        Gravações Disponíveis ({recordedClasses.length})
                    </h2>
                    <div className="space-y-3">
                        {recordedClasses.map((liveClass: LiveClassWithDetails) => (
                            <LiveClassCard
                                key={liveClass.id}
                                liveClass={liveClass}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Cancelled Classes */}
            {cancelledClasses.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-400">
                        Canceladas ({cancelledClasses.length})
                    </h2>
                    <div className="space-y-3">
                        {cancelledClasses.map((liveClass: LiveClassWithDetails) => (
                            <LiveClassCard
                                key={liveClass.id}
                                liveClass={liveClass}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onUpdateStatus={handleUpdateStatus}
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
                            {editingClass ? 'Editar Aula ao Vivo' : 'Nova Aula ao Vivo'}
                        </DialogTitle>
                    </DialogHeader>
                    <LiveClassForm
                        tracks={tracks}
                        phases={phases}
                        modules={modules}
                        liveClass={editingClass}
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
    color: 'sky' | 'amber' | 'emerald' | 'gray';
}

function StatsCard({ label, value, color }: StatsCardProps) {
    const colors = {
        sky: 'bg-sky-500/20 text-sky-400',
        amber: 'bg-amber-500/20 text-amber-400',
        emerald: 'bg-emerald-500/20 text-emerald-400',
        gray: 'bg-gray-500/20 text-gray-400',
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className={`text-sm ${colors[color]}`}>{label}</p>
        </div>
    );
}