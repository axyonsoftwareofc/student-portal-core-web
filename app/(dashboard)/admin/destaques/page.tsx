// app/(dashboard)/admin/destaques/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Pin, Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FeaturedItemCard, FeaturedItemForm } from '@/components/admin/featured';
import { useFeaturedItems } from '@/hooks/useFeaturedItems';
import type {
    CreateFeaturedItemData,
    FeaturedItemWithLesson,
    LessonOption,
} from '@/lib/types/featured-items';
import { showToast } from '@/lib/toast';

interface NamedOption {
    id: string;
    name: string;
}

interface ExerciseContentRow {
    lesson_id: string;
    lesson: {
        id: string;
        title: string;
        module: { name: string } | null;
    } | null;
}

export default function DestaquesPage() {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [tracks, setTracks] = useState<NamedOption[]>([]);
    const [phases, setPhases] = useState<NamedOption[]>([]);
    const [modules, setModules] = useState<NamedOption[]>([]);
    const [lessons, setLessons] = useState<LessonOption[]>([]);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<FeaturedItemWithLesson | null>(null);
    const [submissionsItem, setSubmissionsItem] = useState<FeaturedItemWithLesson | null>(null);

    const {
        items,
        isLoading,
        error,
        createItem,
        updateItem,
        deleteItem,
        toggleActive,
        refresh,
    } = useFeaturedItems();

    useEffect(() => {
        async function fetchData() {
            try {
                const [tracksRes, phasesRes, modulesRes, lessonsRes] = await Promise.all([
                    supabase.from('tracks').select('id, name').eq('is_active', true).order('order_index'),
                    supabase.from('phases').select('id, name').eq('is_active', true).order('number'),
                    supabase.from('modules').select('id, name').eq('status', 'PUBLISHED').order('order_index'),
                    supabase
                        .from('lesson_contents')
                        .select('lesson_id, lesson:lessons(id, title, module:modules(name))')
                        .eq('type', 'EXERCISE'),
                ]);

                setTracks(tracksRes.data || []);
                setPhases(phasesRes.data || []);
                setModules(modulesRes.data || []);

                // Uma opção por aula (a aula pode ter vários exercícios)
                const byLesson = new Map<string, LessonOption>();
                ((lessonsRes.data || []) as unknown as ExerciseContentRow[]).forEach((row: ExerciseContentRow) => {
                    if (!row.lesson || byLesson.has(row.lesson.id)) return;
                    const moduleName = row.lesson.module?.name;
                    byLesson.set(row.lesson.id, {
                        id: row.lesson.id,
                        label: moduleName ? `${moduleName} — ${row.lesson.title}` : row.lesson.title,
                    });
                });
                setLessons(
                    Array.from(byLesson.values()).sort((a: LessonOption, b: LessonOption) =>
                        a.label.localeCompare(b.label, 'pt-BR')
                    )
                );
            } catch (err) {
                console.error('Erro ao carregar dados:', err);
            } finally {
                setIsLoadingData(false);
            }
        }

        fetchData();
    }, [supabase]);

    const getTargetName = (item: FeaturedItemWithLesson): string | null => {
        const source =
            item.target === 'track' ? tracks : item.target === 'phase' ? phases : item.target === 'module' ? modules : [];
        return source.find((option: NamedOption) => option.id === item.target_id)?.name ?? null;
    };

    const handleCreate = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: FeaturedItemWithLesson) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: CreateFeaturedItemData): Promise<{ success: boolean; error?: string }> => {
        if (editingItem) {
            return updateItem(editingItem.id, data);
        }
        return createItem(data);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este destaque? As entregas dele também serão apagadas.')) return;

        const result = await deleteItem(id);
        if (result.success) {
            showToast('success', 'Destaque excluído!');
        } else {
            showToast('error', result.error || 'Erro ao excluir');
        }
    };

    const handleToggleActive = async (id: string, isActive: boolean) => {
        const result = await toggleActive(id, isActive);
        if (result.success) {
            showToast('success', isActive ? 'Destaque ativado!' : 'Destaque desativado!');
        } else {
            showToast('error', result.error || 'Erro ao atualizar');
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const activeItems = items.filter((i: FeaturedItemWithLesson) => i.is_active);
    const inactiveItems = items.filter((i: FeaturedItemWithLesson) => !i.is_active);

    if (isLoading || isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    const renderList = (list: FeaturedItemWithLesson[]) => (
        <div className="space-y-3">
            {list.map((item: FeaturedItemWithLesson) => (
                <FeaturedItemCard
                    key={item.id}
                    item={item}
                    targetName={getTargetName(item)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    onOpenSubmissions={setSubmissionsItem}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/20">
                        <Pin className="h-6 w-6 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Destaques</h1>
                        <p className="text-gray-400">Fixe exercícios e tarefas no topo do dashboard</p>
                    </div>
                </div>

                <Button onClick={handleCreate} className="bg-sky-600 hover:bg-sky-500 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Destaque
                </Button>
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
            {items.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-900/30 border border-gray-800 rounded-xl">
                    <Pin className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Nenhum destaque ainda</h3>
                    <p className="text-gray-400 text-center max-w-md mb-6">
                        Destaque um exercício ou crie uma tarefa avulsa para aparecer no topo do dashboard dos alunos.
                    </p>
                    <Button onClick={handleCreate} className="bg-sky-600 hover:bg-sky-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar primeiro destaque
                    </Button>
                </div>
            )}

            {activeItems.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Ativos ({activeItems.length})</h2>
                    {renderList(activeItems)}
                </section>
            )}

            {inactiveItems.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-400">Inativos ({inactiveItems.length})</h2>
                    {renderList(inactiveItems)}
                </section>
            )}

            {/* Form Dialog (a key recria o formulário ao trocar de item) */}
            <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Destaque' : 'Novo Destaque'}</DialogTitle>
                    </DialogHeader>
                    <FeaturedItemForm
                        key={editingItem?.id ?? 'new'}
                        tracks={tracks}
                        phases={phases}
                        modules={modules}
                        lessons={lessons}
                        item={editingItem}
                        onSubmit={handleSubmit}
                        onCancel={handleCloseForm}
                    />
                </DialogContent>
            </Dialog>

            {/* O painel de entregas (submissionsItem) é adicionado na Task 4 */}
            {submissionsItem && null}
        </div>
    );
}
