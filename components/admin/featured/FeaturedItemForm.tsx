// components/admin/featured/FeaturedItemForm.tsx
'use client';

import { useState } from 'react';
import { Send, X, ClipboardCheck, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnnouncementTarget, TARGET_LABELS } from '@/lib/types/announcements';
import type {
    CreateFeaturedItemData,
    FeaturedItemWithLesson,
    FeaturedKind,
    LessonOption,
} from '@/lib/types/featured-items';
import {
    datetimeLocalToIso,
    endOfDayIso,
    toDateInput,
    toDatetimeLocal,
} from '@/lib/featured-items';
import { showToast } from '@/lib/toast';

interface NamedOption {
    id: string;
    name: string;
}

interface FeaturedItemFormProps {
    tracks: NamedOption[];
    phases: NamedOption[];
    modules: NamedOption[];
    lessons: LessonOption[];
    item?: FeaturedItemWithLesson | null;
    onSubmit: (data: CreateFeaturedItemData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
}

const inputClass = cn(
    'w-full px-4 py-3 rounded-lg',
    'bg-gray-800 border border-gray-700',
    'text-white placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
);

const targetOptions: AnnouncementTarget[] = ['all', 'track', 'phase', 'module'];

export function FeaturedItemForm({
                                     tracks,
                                     phases,
                                     modules,
                                     lessons,
                                     item,
                                     onSubmit,
                                     onCancel,
                                 }: FeaturedItemFormProps) {
    const isEditing = !!item;

    const [kind, setKind] = useState<FeaturedKind>(item?.kind ?? 'exercise');
    const [lessonId, setLessonId] = useState<string>(item?.lesson_id ?? '');
    const [title, setTitle] = useState<string>(item?.title ?? '');
    const [description, setDescription] = useState<string>(item?.description ?? '');
    const [deadline, setDeadline] = useState<string>(toDatetimeLocal(item?.deadline ?? null));
    const [target, setTarget] = useState<AnnouncementTarget>(item?.target ?? 'all');
    const [targetId, setTargetId] = useState<string>(item?.target_id ?? '');
    const [expiresAt, setExpiresAt] = useState<string>(toDateInput(item?.expires_at ?? null));
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [lessonSearch, setLessonSearch] = useState<string>('');

    const today = toDateInput(new Date().toISOString());
    const normalizedSearch = lessonSearch.trim().toLowerCase();
    const visibleLessons = lessons.filter(
        (lesson: LessonOption) =>
            lesson.id === lessonId || lesson.label.toLowerCase().includes(normalizedSearch)
    );

    const handleTargetChange = (newTarget: AnnouncementTarget) => {
        setTarget(newTarget);
        setTargetId('');
    };

    const getTargetOptions = (): NamedOption[] => {
        switch (target) {
            case 'track':
                return tracks;
            case 'phase':
                return phases;
            case 'module':
                return modules;
            default:
                return [];
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (kind === 'exercise' && !lessonId) {
            showToast('error', 'Selecione o exercício');
            return;
        }

        if (kind === 'task') {
            if (!title.trim()) {
                showToast('error', 'Digite um título');
                return;
            }
            if (!description.trim()) {
                showToast('error', 'Digite a descrição da tarefa');
                return;
            }
        }

        if (target !== 'all' && !targetId) {
            showToast('error', `Selecione ${TARGET_LABELS[target].toLowerCase()}`);
            return;
        }

        setIsSubmitting(true);

        const data: CreateFeaturedItemData = {
            kind,
            lesson_id: kind === 'exercise' ? lessonId : null,
            title: kind === 'task' ? title : null,
            description: kind === 'task' ? description : null,
            deadline: deadline ? datetimeLocalToIso(deadline) : null,
            target,
            target_id: target === 'all' ? null : targetId,
            expires_at: expiresAt ? endOfDayIso(expiresAt) : null,
        };

        const result = await onSubmit(data);

        setIsSubmitting(false);

        if (result.success) {
            showToast('success', isEditing ? 'Destaque atualizado!' : 'Destaque criado!');
            onCancel();
        } else {
            showToast('error', result.error || 'Erro ao salvar destaque');
        }
    };

    const kindOptions: { value: FeaturedKind; label: string; hint: string; icon: typeof ClipboardCheck }[] = [
        { value: 'exercise', label: 'Exercício existente', hint: 'Uma aula com exercício', icon: ClipboardCheck },
        { value: 'task', label: 'Tarefa avulsa', hint: 'Criada só para o destaque', icon: ClipboardList },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">O que destacar</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {kindOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={isEditing}
                                onClick={() => setKind(option.value)}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                                    kind === option.value
                                        ? 'bg-sky-950/30 border-sky-500/50 text-sky-300'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600',
                                    isEditing && 'opacity-60 cursor-not-allowed'
                                )}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                                <span>
                                    <span className="block text-sm font-medium">{option.label}</span>
                                    <span className="block text-xs text-gray-500">{option.hint}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {kind === 'exercise' ? (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Exercício *</label>
                    <input
                        type="text"
                        value={lessonSearch}
                        onChange={(e) => setLessonSearch(e.target.value)}
                        placeholder="Buscar aula ou módulo..."
                        className={cn(inputClass, 'mb-2')}
                    />
                    <select
                        value={lessonId}
                        onChange={(e) => setLessonId(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Selecione a aula...</option>
                        {visibleLessons.map((lesson: LessonOption) => (
                            <option key={lesson.id} value={lesson.id}>
                                {lesson.label}
                            </option>
                        ))}
                    </select>
                    {lessons.length === 0 && (
                        <p className="mt-2 text-sm text-amber-400">
                            Nenhuma aula com exercício encontrada.
                        </p>
                    )}
                </div>
            ) : (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Enviar o projeto final"
                            maxLength={255}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Descrição *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Explique o que o aluno precisa entregar..."
                            rows={4}
                            className={cn(inputClass, 'resize-none')}
                        />
                    </div>
                </>
            )}

            {/* Prazo e expiração */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prazo (opcional)</label>
                    <input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sai do topo em (opcional)
                    </label>
                    <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        min={expiresAt && expiresAt < today ? expiresAt : today}
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Público alvo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Público alvo</label>
                    <select
                        value={target}
                        onChange={(e) => handleTargetChange(e.target.value as AnnouncementTarget)}
                        className={inputClass}
                    >
                        {targetOptions.map((t: AnnouncementTarget) => (
                            <option key={t} value={t}>
                                {TARGET_LABELS[t]}
                            </option>
                        ))}
                    </select>
                </div>

                {target !== 'all' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Selecionar {target === 'track' ? 'trilha' : target === 'phase' ? 'fase' : 'módulo'}
                        </label>
                        <select
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Selecione...</option>
                            {getTargetOptions().map((option: NamedOption) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Botões */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-gray-800">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-500">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar destaque' : 'Publicar destaque'}
                </Button>
            </div>
        </form>
    );
}
