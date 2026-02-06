// app/(dashboard)/admin/conteudos/page.tsx
'use client';

import { useState } from 'react';
import {
    FileText,
    Plus,
    Search,
    Video,
    BookOpen,
    PenTool,
    HelpCircle,
    CheckCircle,
    FileEdit,
    Archive,
    Clock,
    Eye,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
    Layers,
    GraduationCap,
    Package
} from 'lucide-react';
import { useLessons, type LessonWithModule } from '@/hooks/useLessons';
import { useModules } from '@/hooks/useModules';
import { useCourses } from '@/hooks/useCourses';
import type { LessonFormData, LessonType, LessonStatus } from '@/lib/types/database';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LessonForm from '@/components/admin/LessonForm';
import MaterialsManager from '@/components/admin/MaterialsManager';

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

export default function ConteudosPage() {
    const { lessons, isLoading, error, createLesson, updateLesson, deleteLesson } = useLessons();
    const { modules } = useModules();
    const { courses } = useCourses();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | LessonType>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | LessonStatus>('all');
    const [filterModule, setFilterModule] = useState<string>('all');
    const [filterCourse, setFilterCourse] = useState<string>('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isMaterialsManagerOpen, setIsMaterialsManagerOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<LessonWithModule | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtrar módulos pelo curso selecionado
    const filteredModulesForSelect = filterCourse === 'all'
        ? modules
        : modules.filter(m => m.course_id === filterCourse);

    // Filtrar aulas
    const filteredLessons = lessons.filter(lesson => {
        const matchesSearch =
            lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || lesson.type === filterType;
        const matchesStatus = filterStatus === 'all' || lesson.status === filterStatus;
        const matchesModule = filterModule === 'all' || lesson.module_id === filterModule;
        const matchesCourse = filterCourse === 'all' || lesson.module?.course_id === filterCourse;
        return matchesSearch && matchesType && matchesStatus && matchesModule && matchesCourse;
    });

    // Estatísticas por tipo
    const statsByType = Object.entries(typeConfig).map(([type, config]) => ({
        type: type as LessonType,
        ...config,
        count: lessons.filter(l => l.type === type).length,
    }));

    // Handlers
    const handleCreate = async (data: LessonFormData) => {
        setIsSubmitting(true);
        const result = await createLesson(data);
        setIsSubmitting(false);

        if (result.success) {
            setIsCreateModalOpen(false);
        }
        return result;
    };

    const handleEdit = async (data: LessonFormData) => {
        if (!selectedLesson) return { success: false, error: 'Aula não selecionada' };

        setIsSubmitting(true);
        const result = await updateLesson(selectedLesson.id, data);
        setIsSubmitting(false);

        if (result.success) {
            setIsEditModalOpen(false);
            setSelectedLesson(null);
        }
        return result;
    };

    const handleDelete = async () => {
        if (!selectedLesson) return;

        setIsSubmitting(true);
        const result = await deleteLesson(selectedLesson.id);
        setIsSubmitting(false);

        if (result.success) {
            setIsDeleteDialogOpen(false);
            setSelectedLesson(null);
        }
    };

    const openEditModal = (lesson: LessonWithModule) => {
        setSelectedLesson(lesson);
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (lesson: LessonWithModule) => {
        setSelectedLesson(lesson);
        setIsDeleteDialogOpen(true);
    };

    const openMaterialsManager = (lesson: LessonWithModule) => {
        setSelectedLesson(lesson);
        setIsMaterialsManagerOpen(true);
    };

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

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <FileText className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            Gestão de Conteúdos
                        </h1>
                        <p className="text-sm text-gray-500">
                            {lessons.length} aulas cadastradas
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
                {statsByType.map(stat => {
                    const Icon = stat.icon;
                    const colorClasses: Record<string, string> = {
                        sky: 'bg-sky-500/10 text-sky-400',
                        emerald: 'bg-emerald-500/10 text-emerald-400',
                        amber: 'bg-amber-500/10 text-amber-400',
                        violet: 'bg-violet-500/10 text-violet-400',
                    };
                    return (
                        <div
                            key={stat.type}
                            className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-400">{stat.label}s</p>
                                    <p className="text-xl sm:text-2xl font-semibold text-white">{stat.count}</p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[stat.color].split(' ')[0]}`}>
                                    <Icon className={colorClasses[stat.color].split(' ')[1]} strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                    );
                })}
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none transition-colors"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                        className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                    >
                        <option value="all">Todos os tipos</option>
                        <option value="VIDEO">Vídeos</option>
                        <option value="ARTICLE">Artigos</option>
                        <option value="EXERCISE">Exercícios</option>
                        <option value="QUIZ">Quizzes</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
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
                        onChange={(e) => {
                            setFilterCourse(e.target.value);
                            setFilterModule('all');
                        }}
                        className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                    >
                        <option value="all">Todos os cursos</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                    >
                        <option value="all">Todos os módulos</option>
                        {filteredModulesForSelect.map(module => (
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
                            <FileText className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
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
                    {filteredLessons.map((lesson) => {
                        const typeInfo = typeConfig[lesson.type];
                        const TypeIcon = typeInfo.icon;

                        return (
                            <div
                                key={lesson.id}
                                className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-${typeInfo.color}-500/10 flex-shrink-0`}>
                                            <TypeIcon className={`h-5 w-5 sm:h-6 sm:w-6 text-${typeInfo.color}-400`} strokeWidth={1.5} />
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

                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                    {lesson.module?.course?.name || 'Curso'}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                    {lesson.module?.name || 'Módulo'}
                                                </span>
                                                {lesson.duration && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                        {lesson.duration}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1">
                                                    <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                    {lesson.views_count}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {getTypeBadge(lesson.type)}
                                        {getStatusBadge(lesson.status)}
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800/50 pt-4">
                                    <span className="text-xs text-gray-500">
                                        Criado em {new Date(lesson.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => openMaterialsManager(lesson)}
                                            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                                        >
                                            <Package className="h-4 w-4" strokeWidth={1.5} />
                                            Materiais
                                        </button>
                                        <button
                                            onClick={() => openEditModal(lesson)}
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
                        );
                    })}
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
                size="lg"
            >
                <LessonForm
                    modules={modules}
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreateModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedLesson(null);
                }}
                title="Editar Aula"
                size="lg"
            >
                <LessonForm
                    lesson={selectedLesson}
                    modules={modules}
                    onSubmit={handleEdit}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedLesson(null);
                    }}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedLesson(null);
                }}
                onConfirm={handleDelete}
                title="Excluir Aula"
                message={`Tem certeza que deseja excluir a aula "${selectedLesson?.title}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                isLoading={isSubmitting}
                variant="danger"
            />

            {/* Materials Manager */}
            {selectedLesson && (
                <MaterialsManager
                    lessonId={selectedLesson.id}
                    lessonTitle={selectedLesson.title}
                    isOpen={isMaterialsManagerOpen}
                    onClose={() => {
                        setIsMaterialsManagerOpen(false);
                        setSelectedLesson(null);
                    }}
                />
            )}
        </div>
    );
}