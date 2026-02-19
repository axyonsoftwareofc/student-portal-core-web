// app/(dashboard)/admin/aulas/page.tsx
'use client';

import { useState } from 'react';
import {
    Play,
    Plus,
    Search,
    Video,
    BookOpen,
    PenTool,
    HelpCircle,
    CheckCircle,
    FileEdit,
    Archive,
    Eye,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
    Layers,
    GraduationCap,
    Package,
} from 'lucide-react';
import { useAllLessons, type LessonWithDetails, type LessonFormData } from '@/hooks/useAllLessons';
import { useModules } from '@/hooks/useModules';
import { useCourses } from '@/hooks/useCourses';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import LessonBasicForm from '@/components/admin/lessons/LessonBasicForm';
import LessonEditorModal from '@/components/admin/lessons/LessonEditorModal';
import LessonPreviewModal from '@/components/admin/lessons/LessonPreviewModal';

type LessonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

const statusConfig: Record<LessonStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
    PUBLISHED: { label: 'Publicado', icon: CheckCircle, color: 'emerald' },
    DRAFT: { label: 'Rascunho', icon: FileEdit, color: 'amber' },
    ARCHIVED: { label: 'Arquivado', icon: Archive, color: 'gray' },
};

export default function AulasPage() {
    const { lessons, isLoading, error, createLesson, updateLesson, deleteLesson } = useAllLessons();
    const { modules } = useModules();
    const { courses } = useCourses();

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<'all' | LessonStatus>('all');
    const [filterModule, setFilterModule] = useState<string>('all');
    const [filterCourse, setFilterCourse] = useState<string>('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [selectedLesson, setSelectedLesson] = useState<LessonWithDetails | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const filteredModulesForSelect = filterCourse === 'all'
        ? modules
        : modules.filter((m) => m.course_id === filterCourse);

    const filteredLessons = lessons.filter((lesson: LessonWithDetails) => {
        const matchesSearch =
            lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || lesson.status === filterStatus;
        const matchesModule = filterModule === 'all' || lesson.module_id === filterModule;
        const matchesCourse = filterCourse === 'all' || lesson.module?.course_id === filterCourse;
        return matchesSearch && matchesStatus && matchesModule && matchesCourse;
    });

    const stats = {
        total: lessons.length,
        published: lessons.filter((l: LessonWithDetails) => l.status === 'PUBLISHED').length,
        draft: lessons.filter((l: LessonWithDetails) => l.status === 'DRAFT').length,
        withContents: lessons.filter((l: LessonWithDetails) => l.total_contents > 0).length,
    };

    const handleCreate = async (data: LessonFormData): Promise<{ success: boolean; error?: string }> => {
        setIsSubmitting(true);
        const result = await createLesson(data);
        setIsSubmitting(false);

        if (result.success && result.lesson) {
            setIsCreateModalOpen(false);
            setSelectedLesson(result.lesson);
            setIsEditorModalOpen(true);
        }
        return result;
    };

    const handleDelete = async (): Promise<void> => {
        if (!selectedLesson) return;

        setIsSubmitting(true);
        const result = await deleteLesson(selectedLesson.id);
        setIsSubmitting(false);

        if (result.success) {
            setIsDeleteDialogOpen(false);
            setSelectedLesson(null);
        }
    };

    const openEditorModal = (lesson: LessonWithDetails): void => {
        setSelectedLesson(lesson);
        setIsEditorModalOpen(true);
    };

    const openPreviewModal = (lesson: LessonWithDetails): void => {
        setSelectedLesson(lesson);
        setIsPreviewModalOpen(true);
    };

    const openDeleteDialog = (lesson: LessonWithDetails): void => {
        setSelectedLesson(lesson);
        setIsDeleteDialogOpen(true);
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

    const getContentSummary = (lesson: LessonWithDetails) => {
        const summary = lesson.content_summary;
        if (!summary) return null;

        const items = [
            { count: summary.VIDEO, icon: Video, color: 'text-sky-400', label: 'vídeo' },
            { count: summary.ARTICLE, icon: BookOpen, color: 'text-emerald-400', label: 'artigo' },
            { count: summary.EXERCISE, icon: PenTool, color: 'text-amber-400', label: 'exercício' },
            { count: summary.QUIZ, icon: HelpCircle, color: 'text-violet-400', label: 'quiz' },
            { count: summary.MATERIAL, icon: Package, color: 'text-gray-400', label: 'material' },
        ].filter(item => item.count > 0);

        if (items.length === 0) {
            return (
                <span className="text-xs text-gray-500 italic">Sem conteúdos</span>
            );
        }

        return (
            <div className="flex flex-wrap items-center gap-2">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <span key={index} className={`inline-flex items-center gap-1 text-xs ${item.color}`}>
                            <Icon className="h-3 w-3" strokeWidth={1.5} />
                            {item.count}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <Play className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            Gestão de Aulas
                        </h1>
                        <p className="text-sm text-gray-500">
                            {stats.total} aulas • {stats.published} publicadas • {stats.withContents} com conteúdos
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={modules.length === 0}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    Nova Aula
                </button>
            </div>

            {/* Aviso se não tem módulos */}
            {modules.length === 0 && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm">
                        Você precisa criar um módulo antes de adicionar aulas.
                    </span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Total</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.total}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <Play className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Publicadas</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.published}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Rascunhos</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.draft}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <FileEdit className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Com Conteúdos</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.withContents}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <Layers className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Buscar por título ou descrição..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none transition-colors"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as typeof filterStatus)}
                        className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                    >
                        <option value="all">Todos os status</option>
                        <option value="PUBLISHED">Publicados</option>
                        <option value="DRAFT">Rascunhos</option>
                        <option value="ARCHIVED">Arquivados</option>
                    </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={filterCourse}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFilterCourse(e.target.value);
                            setFilterModule('all');
                        }}
                        className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                    >
                        <option value="all">Todos os cursos</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterModule}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterModule(e.target.value)}
                        className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                    >
                        <option value="all">Todos os módulos</option>
                        {filteredModulesForSelect.map((module) => (
                            <option key={module.id} value={module.id}>{module.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" strokeWidth={1.5} />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && lessons.length === 0 && modules.length > 0 && (
                <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50">
                            <Play className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhuma aula criada</h3>
                    <p className="text-gray-400 mb-4">Comece adicionando sua primeira aula</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        Criar Aula
                    </button>
                </div>
            )}

            {/* Lessons List */}
            {!isLoading && filteredLessons.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                    {filteredLessons.map((lesson: LessonWithDetails) => (
                        <div
                            key={lesson.id}
                            className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-sky-500/10 flex-shrink-0">
                                        <Play className="h-5 w-5 sm:h-6 sm:w-6 text-sky-400" strokeWidth={1.5} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="flex items-center justify-center h-5 w-5 rounded bg-gray-800 text-xs text-gray-400 font-medium">
                                                {lesson.order_index}
                                            </span>
                                            <h3 className="text-base sm:text-lg font-semibold text-white">
                                                {lesson.title}
                                            </h3>
                                        </div>

                                        {lesson.description && (
                                            <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                                                {lesson.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 mb-2">
                                            <span className="inline-flex items-center gap-1">
                                                <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                {lesson.module?.course?.name || 'Curso'}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                {lesson.module?.name || 'Módulo'}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                {lesson.views_count} views
                                            </span>
                                        </div>

                                        {getContentSummary(lesson)}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-sky-500/10 text-sky-400">
                                        {lesson.total_contents} conteúdos
                                    </span>
                                    {getStatusBadge(lesson.status)}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800/50 pt-4">
                                <span className="text-xs text-gray-500">
                                    Criado em {new Date(lesson.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => openPreviewModal(lesson)}
                                        className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                                        Visualizar
                                    </button>
                                    <button
                                        onClick={() => openEditorModal(lesson)}
                                        className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openDeleteDialog(lesson)}
                                        className="inline-flex items-center gap-1 text-sm text-rose-400 hover:text-rose-300 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {!isLoading && lessons.length > 0 && filteredLessons.length === 0 && (
                <div className="text-center py-12">
                    <Search className="h-8 w-8 text-gray-500 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhuma aula encontrada com os filtros aplicados</p>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Nova Aula"
                size="md"
            >
                <LessonBasicForm
                    modules={modules}
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreateModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Editor Modal */}
            {selectedLesson && (
                <LessonEditorModal
                    lesson={selectedLesson}
                    modules={modules}
                    isOpen={isEditorModalOpen}
                    onClose={() => {
                        setIsEditorModalOpen(false);
                        setSelectedLesson(null);
                    }}
                    onUpdate={updateLesson}
                />
            )}

            {/* Preview Modal */}
            {selectedLesson && (
                <LessonPreviewModal
                    lessonId={selectedLesson.id}
                    lessonTitle={selectedLesson.title}
                    isOpen={isPreviewModalOpen}
                    onClose={() => {
                        setIsPreviewModalOpen(false);
                        setSelectedLesson(null);
                    }}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedLesson(null);
                }}
                onConfirm={handleDelete}
                title="Excluir Aula"
                message={`Tem certeza que deseja excluir a aula "${selectedLesson?.title}"? Todos os conteúdos serão excluídos. Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                isLoading={isSubmitting}
                variant="danger"
            />
        </div>
    );
}