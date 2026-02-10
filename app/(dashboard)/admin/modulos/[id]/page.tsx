// app/(dashboard)/admin/modulos/[id]/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Layers,
    Pencil,
    Trash2,
    Plus,
    Video,
    BookOpen,
    PenTool,
    HelpCircle,
    CheckCircle,
    FileEdit,
    Archive,
    Clock,
    Eye,
    Loader2,
    AlertTriangle,
    GraduationCap,
    MoreVertical
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLessons, type LessonWithModule } from '@/hooks/useLessons';
import { useCourses } from '@/hooks/useCourses';
import type { Module, Course, LessonType, LessonStatus, LessonFormData, ModuleFormData } from '@/lib/types/database';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import LessonForm from '@/components/admin/LessonForm';
import ModuleForm from '@/components/admin/ModuleForm';

const typeConfig: Record<LessonType, { label: string; icon: typeof Video; color: string }> = {
    VIDEO: { label: 'Vídeo', icon: Video, color: 'sky' },
    ARTICLE: { label: 'Artigo', icon: BookOpen, color: 'emerald' },
    EXERCISE: { label: 'Exercício', icon: PenTool, color: 'amber' },
    QUIZ: { label: 'Quiz', icon: HelpCircle, color: 'violet' },
};

const statusConfig: Record<LessonStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
    PUBLISHED: { label: 'Publicado', icon: CheckCircle, color: 'emerald' },
    DRAFT: { label: 'Rascunho', icon: FileEdit, color: 'amber' },
    ARCHIVED: { label: 'Arquivado', icon: Archive, color: 'gray' },
};

interface ModuleWithCourse extends Module {
    course: Course;
}

export default function ModuleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const moduleId = params?.id as string;

    const [module, setModule] = useState<ModuleWithCourse | null>(null);
    const [isLoadingModule, setIsLoadingModule] = useState(true);
    const [moduleError, setModuleError] = useState<string | null>(null);

    const { lessons, isLoading: isLoadingLessons, createLesson, updateLesson, deleteLesson } = useLessons(moduleId);
    const { courses } = useCourses();

    const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
    const [isDeleteModuleDialogOpen, setIsDeleteModuleDialogOpen] = useState(false);
    const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
    const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
    const [isDeleteLessonDialogOpen, setIsDeleteLessonDialogOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<LessonWithModule | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    // Buscar módulo
    const fetchModule = useCallback(async () => {
        if (!moduleId) return;

        setIsLoadingModule(true);
        setModuleError(null);

        try {
            const { data, error } = await supabase
                .from('modules')
                .select(`
                    *,
                    course:courses(*)
                `)
                .eq('id', moduleId)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Módulo não encontrado');

            setModule(data as ModuleWithCourse);
        } catch (err) {
            console.error('[ModuleDetail] Erro:', err);
            setModuleError('Módulo não encontrado');
        } finally {
            setIsLoadingModule(false);
        }
    }, [moduleId, supabase]);

    useEffect(() => {
        fetchModule();
    }, [fetchModule]);

    // Atualizar módulo
    const handleUpdateModule = async (data: ModuleFormData) => {
        if (!module) return { success: false, error: 'Módulo não encontrado' };

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('modules')
                .update({
                    name: data.name,
                    description: data.description || null,
                    status: data.status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', module.id);

            if (error) throw error;

            await fetchModule();
            setIsEditModuleModalOpen(false);
            return { success: true };
        } catch (err) {
            console.error('[ModuleDetail] Erro ao atualizar:', err);
            return { success: false, error: 'Erro ao atualizar módulo' };
        } finally {
            setIsSubmitting(false);
        }
    };

    // Excluir módulo
    const handleDeleteModule = async () => {
        if (!module) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('modules')
                .delete()
                .eq('id', module.id);

            if (error) throw error;

            router.push('/admin/modulos');
        } catch (err) {
            console.error('[ModuleDetail] Erro ao excluir:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handlers de Aulas
    const handleCreateLesson = async (data: LessonFormData) => {
        setIsSubmitting(true);
        const result = await createLesson({ ...data, module_id: moduleId });
        setIsSubmitting(false);

        if (result.success) {
            setIsCreateLessonModalOpen(false);
        }
        return result;
    };

    const handleEditLesson = async (data: LessonFormData) => {
        if (!selectedLesson) return { success: false, error: 'Aula não selecionada' };

        setIsSubmitting(true);
        const result = await updateLesson(selectedLesson.id, data);
        setIsSubmitting(false);

        if (result.success) {
            setIsEditLessonModalOpen(false);
            setSelectedLesson(null);
        }
        return result;
    };

    const handleDeleteLesson = async () => {
        if (!selectedLesson) return;

        setIsSubmitting(true);
        const result = await deleteLesson(selectedLesson.id);
        setIsSubmitting(false);

        if (result.success) {
            setIsDeleteLessonDialogOpen(false);
            setSelectedLesson(null);
        }
    };

    // Estatísticas
    const stats = {
        total: lessons.length,
        videos: lessons.filter(l => l.type === 'VIDEO').length,
        articles: lessons.filter(l => l.type === 'ARTICLE').length,
        exercises: lessons.filter(l => l.type === 'EXERCISE').length,
        quizzes: lessons.filter(l => l.type === 'QUIZ').length,
        published: lessons.filter(l => l.status === 'PUBLISHED').length,
    };

    // Helpers de UI
    const getTypeBadge = (type: LessonType) => {
        const config = typeConfig[type];
        const Icon = config.icon;
        const colorClasses: Record<string, string> = {
            sky: 'bg-sky-500/10 text-sky-400',
            emerald: 'bg-emerald-500/10 text-emerald-400',
            amber: 'bg-amber-500/10 text-amber-400',
            violet: 'bg-violet-500/10 text-violet-400',
        };
        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClasses[config.color]}`}>
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {config.label}
            </span>
        );
    };

    const getStatusBadge = (status: LessonStatus) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const colorClasses: Record<string, string> = {
            emerald: 'bg-emerald-500/10 text-emerald-400',
            amber: 'bg-amber-500/10 text-amber-400',
            gray: 'bg-gray-500/10 text-gray-400',
        };
        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClasses[config.color]}`}>
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {config.label}
            </span>
        );
    };

    const getModuleStatusBadge = (status: string) => {
        const configs: Record<string, { label: string; color: string }> = {
            PUBLISHED: { label: 'Publicado', color: 'emerald' },
            DRAFT: { label: 'Rascunho', color: 'amber' },
            ARCHIVED: { label: 'Arquivado', color: 'gray' },
        };
        const config = configs[status] || configs.DRAFT;
        const colorClasses: Record<string, string> = {
            emerald: 'bg-emerald-500/10 text-emerald-400',
            amber: 'bg-amber-500/10 text-amber-400',
            gray: 'bg-gray-500/10 text-gray-400',
        };
        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${colorClasses[config.color]}`}>
                {config.label}
            </span>
        );
    };

    // Loading state
    if (isLoadingModule) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" strokeWidth={1.5} />
            </div>
        );
    }

    // Error state
    if (moduleError || !module) {
        return (
            <div className="text-center py-20">
                <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
                        <AlertTriangle className="h-8 w-8 text-rose-400" strokeWidth={1.5} />
                    </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Módulo não encontrado</h2>
                <p className="text-gray-400 mb-4">O módulo que você está procurando não existe ou foi removido.</p>
                <Link
                    href="/admin/modulos"
                    className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar para Módulos
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <Link
                    href="/admin/modulos"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar para Módulos
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 flex-shrink-0">
                            <Layers className="h-6 w-6 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="font-nacelle text-2xl font-semibold text-white">
                                    {module.name}
                                </h1>
                                {getModuleStatusBadge(module.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <GraduationCap className="h-4 w-4" strokeWidth={1.5} />
                                <span>{module.course?.name || 'Curso não encontrado'}</span>
                            </div>
                            {module.description && (
                                <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                                    {module.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            onClick={() => setIsEditModuleModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 bg-gray-900 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                            Editar
                        </button>
                        <button
                            onClick={() => setIsDeleteModuleDialogOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-950/20 text-sm text-rose-400 hover:bg-rose-950/40 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            Excluir
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <p className="text-xs text-gray-500 mb-1">Total de Aulas</p>
                    <p className="text-2xl font-semibold text-white">{stats.total}</p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <p className="text-xs text-gray-500 mb-1">Vídeos</p>
                    <p className="text-2xl font-semibold text-sky-400">{stats.videos}</p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <p className="text-xs text-gray-500 mb-1">Artigos</p>
                    <p className="text-2xl font-semibold text-emerald-400">{stats.articles}</p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <p className="text-xs text-gray-500 mb-1">Exercícios</p>
                    <p className="text-2xl font-semibold text-amber-400">{stats.exercises}</p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4 col-span-2 sm:col-span-1">
                    <p className="text-xs text-gray-500 mb-1">Quizzes</p>
                    <p className="text-2xl font-semibold text-violet-400">{stats.quizzes}</p>
                </div>
            </div>

            {/* Lessons Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                        Aulas do Módulo
                    </h2>
                    <button
                        onClick={() => setIsCreateLessonModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        Nova Aula
                    </button>
                </div>

                {/* Loading lessons */}
                {isLoadingLessons && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-sky-400" strokeWidth={1.5} />
                    </div>
                )}

                {/* Empty state */}
                {!isLoadingLessons && lessons.length === 0 && (
                    <div className="text-center py-12 rounded-lg border border-dashed border-gray-800 bg-gray-900/20">
                        <div className="flex justify-center mb-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/50">
                                <Video className="h-6 w-6 text-gray-500" strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="text-gray-400 mb-3">Nenhuma aula neste módulo</p>
                        <button
                            onClick={() => setIsCreateLessonModalOpen(true)}
                            className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                        >
                            <Plus className="h-4 w-4" strokeWidth={1.5} />
                            Adicionar primeira aula
                        </button>
                    </div>
                )}

                {/* Lessons list */}
                {!isLoadingLessons && lessons.length > 0 && (
                    <div className="space-y-2">
                        {lessons.map((lesson) => {
                            const TypeIcon = typeConfig[lesson.type].icon;
                            const typeColor = typeConfig[lesson.type].color;

                            return (
                                <div
                                    key={lesson.id}
                                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-800/50 bg-gray-900/30 hover:bg-gray-900/50 hover:border-gray-700 transition-all group"
                                >
                                    {/* Order */}
                                    <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-800 text-sm text-gray-400 font-medium flex-shrink-0">
                                        {lesson.order_index}
                                    </span>

                                    {/* Type Icon */}
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${typeColor}-500/10 flex-shrink-0`}>
                                        <TypeIcon className={`h-5 w-5 text-${typeColor}-400`} strokeWidth={1.5} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-medium text-white truncate">
                                                {lesson.title}
                                            </h3>
                                            <div className="hidden sm:flex items-center gap-2">
                                                {getTypeBadge(lesson.type)}
                                                {getStatusBadge(lesson.status)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            {lesson.duration && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                                                    {lesson.duration}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" strokeWidth={1.5} />
                                                {lesson.views_count} views
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                setSelectedLesson(lesson);
                                                setIsEditLessonModalOpen(true);
                                            }}
                                            className="p-2 text-gray-500 hover:text-sky-400 transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedLesson(lesson);
                                                setIsDeleteLessonDialogOpen(true);
                                            }}
                                            className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
                                            title="Excluir"
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

            {/* Edit Module Modal */}
            <Modal
                isOpen={isEditModuleModalOpen}
                onClose={() => setIsEditModuleModalOpen(false)}
                title="Editar Módulo"
                size="md"
            >
                <ModuleForm
                    module={module}
                    courses={courses}
                    onSubmit={handleUpdateModule}
                    onCancel={() => setIsEditModuleModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Module Dialog */}
            <ConfirmDialog
                isOpen={isDeleteModuleDialogOpen}
                onClose={() => setIsDeleteModuleDialogOpen(false)}
                onConfirm={handleDeleteModule}
                title="Excluir Módulo"
                message={`Tem certeza que deseja excluir o módulo "${module.name}"? Todas as ${lessons.length} aulas serão excluídas também. Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                isLoading={isSubmitting}
                variant="danger"
            />

            {/* Create Lesson Modal */}
            <Modal
                isOpen={isCreateLessonModalOpen}
                onClose={() => setIsCreateLessonModalOpen(false)}
                title="Nova Aula"
                size="lg"
            >
                <LessonForm
                    modules={[module]} // Só mostra o módulo atual
                    defaultModuleId={moduleId}
                    onSubmit={handleCreateLesson}
                    onCancel={() => setIsCreateLessonModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Edit Lesson Modal */}
            <Modal
                isOpen={isEditLessonModalOpen}
                onClose={() => {
                    setIsEditLessonModalOpen(false);
                    setSelectedLesson(null);
                }}
                title="Editar Aula"
                size="lg"
            >
                <LessonForm
                    lesson={selectedLesson}
                    modules={[module]}
                    defaultModuleId={moduleId}
                    onSubmit={handleEditLesson}
                    onCancel={() => {
                        setIsEditLessonModalOpen(false);
                        setSelectedLesson(null);
                    }}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Lesson Dialog */}
            <ConfirmDialog
                isOpen={isDeleteLessonDialogOpen}
                onClose={() => {
                    setIsDeleteLessonDialogOpen(false);
                    setSelectedLesson(null);
                }}
                onConfirm={handleDeleteLesson}
                title="Excluir Aula"
                message={`Tem certeza que deseja excluir a aula "${selectedLesson?.title}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                isLoading={isSubmitting}
                variant="danger"
            />
        </div>
    );
}