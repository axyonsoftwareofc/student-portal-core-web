// components/admin/lessons/LessonEditorModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    X,
    Plus,
    GripVertical,
    Video,
    BookOpen,
    PenTool,
    HelpCircle,
    Package,
    Pencil,
    Trash2,
    Loader2,
    Save,
    CheckCircle,
    FileEdit,
    Archive,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useLessonContents } from '@/hooks/useLessonContents';
import type { LessonWithDetails, LessonFormData } from '@/hooks/useAllLessons';
import type { Module } from '@/lib/types/database';
import type { LessonContent, LessonContentFormData, LessonContentType } from '@/lib/types/lesson-contents';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import ContentForm from './ContentForm';

interface LessonEditorModalProps {
    lesson: LessonWithDetails;
    modules: Module[];
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, data: Partial<LessonFormData>) => Promise<{ success: boolean; error?: string }>;
}

const typeConfig: Record<LessonContentType, { icon: typeof Video; color: string; label: string }> = {
    VIDEO: { icon: Video, color: 'sky', label: 'Vídeo' },
    ARTICLE: { icon: BookOpen, color: 'emerald', label: 'Artigo' },
    EXERCISE: { icon: PenTool, color: 'amber', label: 'Exercício' },
    QUIZ: { icon: HelpCircle, color: 'violet', label: 'Quiz' },
    MATERIAL: { icon: Package, color: 'gray', label: 'Material' },
};

const statusOptions = [
    { value: 'DRAFT', label: 'Rascunho', icon: FileEdit, color: 'amber' },
    { value: 'PUBLISHED', label: 'Publicado', icon: CheckCircle, color: 'emerald' },
    { value: 'ARCHIVED', label: 'Arquivado', icon: Archive, color: 'gray' },
];

export default function LessonEditorModal({
                                              lesson,
                                              modules,
                                              isOpen,
                                              onClose,
                                              onUpdate,
                                          }: LessonEditorModalProps) {
    const { contents, isLoading, createContent, updateContent, deleteContent, reorderContents, refetch } = useLessonContents(lesson.id);

    const [title, setTitle] = useState<string>(lesson.title);
    const [description, setDescription] = useState<string>(lesson.description || '');
    const [moduleId, setModuleId] = useState<string>(lesson.module_id);
    const [status, setStatus] = useState<string>(lesson.status);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    const [isContentFormOpen, setIsContentFormOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [selectedContent, setSelectedContent] = useState<LessonContent | null>(null);
    const [isSubmittingContent, setIsSubmittingContent] = useState<boolean>(false);

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        setTitle(lesson.title);
        setDescription(lesson.description || '');
        setModuleId(lesson.module_id);
        setStatus(lesson.status);
        setHasChanges(false);
    }, [lesson]);

    useEffect(() => {
        const changed =
            title !== lesson.title ||
            description !== (lesson.description || '') ||
            moduleId !== lesson.module_id ||
            status !== lesson.status;
        setHasChanges(changed);
    }, [title, description, moduleId, status, lesson]);

    const handleSaveLesson = async (): Promise<void> => {
        setIsSaving(true);
        await onUpdate(lesson.id, {
            title,
            description,
            module_id: moduleId,
            status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        });
        setIsSaving(false);
        setHasChanges(false);
    };

    const handleCreateContent = async (data: LessonContentFormData): Promise<{ success: boolean; error?: string }> => {
        setIsSubmittingContent(true);
        const result = await createContent(lesson.id, data);
        setIsSubmittingContent(false);

        if (result.success) {
            setIsContentFormOpen(false);
            setSelectedContent(null);
        }
        return result;
    };

    const handleUpdateContent = async (data: LessonContentFormData): Promise<{ success: boolean; error?: string }> => {
        if (!selectedContent) return { success: false, error: 'Conteúdo não selecionado' };

        setIsSubmittingContent(true);
        const result = await updateContent(selectedContent.id, data);
        setIsSubmittingContent(false);

        if (result.success) {
            setIsContentFormOpen(false);
            setSelectedContent(null);
        }
        return result;
    };

    const handleDeleteContent = async (): Promise<void> => {
        if (!selectedContent) return;

        setIsSubmittingContent(true);
        await deleteContent(selectedContent.id);
        setIsSubmittingContent(false);
        setIsDeleteDialogOpen(false);
        setSelectedContent(null);
    };

    const openEditContent = (content: LessonContent): void => {
        setSelectedContent(content);
        setIsContentFormOpen(true);
    };

    const openDeleteContent = (content: LessonContent): void => {
        setSelectedContent(content);
        setIsDeleteDialogOpen(true);
    };

    const handleDragStart = (index: number): void => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number): void => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = async (): Promise<void> => {
        if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newContents = [...contents];
        const [draggedItem] = newContents.splice(draggedIndex, 1);
        newContents.splice(dragOverIndex, 0, draggedItem);

        const orderedIds = newContents.map((c) => c.id);
        await reorderContents(lesson.id, orderedIds);

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const moveContent = async (index: number, direction: 'up' | 'down'): Promise<void> => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= contents.length) return;

        const newContents = [...contents];
        [newContents[index], newContents[newIndex]] = [newContents[newIndex], newContents[index]];

        const orderedIds = newContents.map((c) => c.id);
        await reorderContents(lesson.id, orderedIds);
    };

    if (!isOpen) return null;

    const currentStatus = statusOptions.find((s) => s.value === status);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-white">Editar Aula</h2>
                            {hasChanges && (
                                <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">
                                    Não salvo
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {hasChanges && (
                                <button
                                    onClick={handleSaveLesson}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                    ) : (
                                        <Save className="h-4 w-4" strokeWidth={1.5} />
                                    )}
                                    Salvar
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                            >
                                <X className="h-5 w-5" strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Lesson Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Título da Aula
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                    className="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Descrição
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none transition-colors resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Módulo
                                </label>
                                <select
                                    value={moduleId}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModuleId(e.target.value)}
                                    className="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors"
                                >
                                    {modules.map((module) => (
                                        <option key={module.id} value={module.id}>
                                            {module.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
                                    className="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-800/50" />

                        {/* Contents Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-white">
                                    Conteúdos da Aula ({contents.length})
                                </h3>
                                <button
                                    onClick={() => {
                                        setSelectedContent(null);
                                        setIsContentFormOpen(true);
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition-colors"
                                >
                                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                                    Adicionar
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 text-sky-400 animate-spin" strokeWidth={1.5} />
                                </div>
                            ) : contents.length === 0 ? (
                                <div className="text-center py-8 rounded-lg border border-dashed border-gray-700 bg-gray-900/30">
                                    <Package className="h-10 w-10 text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
                                    <p className="text-gray-400 text-sm mb-3">Nenhum conteúdo adicionado</p>
                                    <button
                                        onClick={() => setIsContentFormOpen(true)}
                                        className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300"
                                    >
                                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                                        Adicionar primeiro conteúdo
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {contents.map((content, index) => {
                                        const config = typeConfig[content.type];
                                        const Icon = config.icon;
                                        const isDragging = draggedIndex === index;
                                        const isDragOver = dragOverIndex === index;

                                        return (
                                            <div
                                                key={content.id}
                                                draggable
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragEnd={handleDragEnd}
                                                className={`flex items-center gap-3 rounded-lg border p-3 transition-all cursor-move ${
                                                    isDragging
                                                        ? 'opacity-50 border-sky-500 bg-sky-500/10'
                                                        : isDragOver
                                                            ? 'border-sky-500/50 bg-sky-500/5'
                                                            : 'border-gray-800/50 bg-gray-900/30 hover:border-gray-700'
                                                }`}
                                            >
                                                <GripVertical className="h-5 w-5 text-gray-600 flex-shrink-0" strokeWidth={1.5} />

                                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-${config.color}-500/10 flex-shrink-0`}>
                                                    <Icon className={`h-4 w-4 text-${config.color}-400`} strokeWidth={1.5} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {index + 1}.
                                                        </span>
                                                        <p className="font-medium text-gray-200 text-sm truncate">
                                                            {content.title}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-xs text-${config.color}-400`}>
                                                            {config.label}
                                                        </span>
                                                        {content.duration && (
                                                            <span className="text-xs text-gray-500">
                                                                • {content.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => moveContent(index, 'up')}
                                                        disabled={index === 0}
                                                        className="p-1.5 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => moveContent(index, 'down')}
                                                        disabled={index === contents.length - 1}
                                                        className="p-1.5 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditContent(content)}
                                                        className="p-1.5 text-gray-400 hover:text-sky-400 transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteContent(content)}
                                                        className="p-1.5 text-gray-400 hover:text-rose-400 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800/50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Form Modal */}
            <Modal
                isOpen={isContentFormOpen}
                onClose={() => {
                    setIsContentFormOpen(false);
                    setSelectedContent(null);
                }}
                title={selectedContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                size="lg"
            >
                <ContentForm
                    content={selectedContent}
                    onSubmit={selectedContent ? handleUpdateContent : handleCreateContent}
                    onCancel={() => {
                        setIsContentFormOpen(false);
                        setSelectedContent(null);
                    }}
                    isLoading={isSubmittingContent}
                />
            </Modal>

            {/* Delete Content Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedContent(null);
                }}
                onConfirm={handleDeleteContent}
                title="Excluir Conteúdo"
                message={`Tem certeza que deseja excluir "${selectedContent?.title}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                isLoading={isSubmittingContent}
                variant="danger"
            />
        </>
    );
}