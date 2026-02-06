// app/(dashboard)/admin/cursos/page.tsx
'use client';

import { useState } from 'react';
import {
    GraduationCap,
    Plus,
    Search,
    CheckCircle,
    FileEdit,
    Pause,
    Calendar,
    XCircle,
    Award,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
    Layers,
    Users
} from 'lucide-react';
import { useCourses, type Course } from '@/hooks/useCourses';
import { useModules } from '@/hooks/useModules';
import type { CourseFormData, CourseStatus } from '@/lib/types/database';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CourseForm from '@/components/admin/CourseForm';

const statusConfig: Record<CourseStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
    DRAFT: { label: 'Rascunho', color: 'gray', icon: FileEdit },
    SCHEDULED: { label: 'Agendado', color: 'sky', icon: Calendar },
    ACTIVE: { label: 'Ativo', color: 'emerald', icon: CheckCircle },
    PAUSED: { label: 'Pausado', color: 'amber', icon: Pause },
    COMPLETED: { label: 'Concluído', color: 'violet', icon: Award },
    CANCELLED: { label: 'Cancelado', color: 'rose', icon: XCircle },
};

export default function CursosPage() {
    const { courses, isLoading, error, createCourse, updateCourse, deleteCourse } = useCourses();
    const { modules } = useModules();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | CourseStatus>('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtrar cursos
    const filteredCourses = courses.filter(course => {
        const matchesSearch =
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Contar módulos por curso
    const getModuleCount = (courseId: string) => {
        return modules.filter(m => m.course_id === courseId).length;
    };

    // Estatísticas
    const stats = {
        active: courses.filter(c => c.status === 'ACTIVE').length,
        draft: courses.filter(c => c.status === 'DRAFT').length,
        total: courses.length,
    };

    // Handlers
    const handleCreate = async (data: CourseFormData) => {
        setIsSubmitting(true);
        const result = await createCourse(data);
        setIsSubmitting(false);

        if (result.success) {
            setIsCreateModalOpen(false);
        }
        return result;
    };

    const handleEdit = async (data: CourseFormData) => {
        if (!selectedCourse) return { success: false, error: 'Curso não selecionado' };

        setIsSubmitting(true);
        const result = await updateCourse(selectedCourse.id, data);
        setIsSubmitting(false);

        if (result.success) {
            setIsEditModalOpen(false);
            setSelectedCourse(null);
        }
        return result;
    };

    const handleDelete = async () => {
        if (!selectedCourse) return;

        setIsSubmitting(true);
        const result = await deleteCourse(selectedCourse.id);
        setIsSubmitting(false);

        if (result.success) {
            setIsDeleteDialogOpen(false);
            setSelectedCourse(null);
        }
    };

    const openEditModal = (course: Course) => {
        setSelectedCourse(course);
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (course: Course) => {
        setSelectedCourse(course);
        setIsDeleteDialogOpen(true);
    };

    const getStatusBadge = (status: CourseStatus) => {
        const config = statusConfig[status];
        const Icon = config.icon;

        const colorClasses: Record<string, string> = {
            emerald: 'bg-emerald-500/10 text-emerald-400',
            amber: 'bg-amber-500/10 text-amber-400',
            gray: 'bg-gray-500/10 text-gray-400',
            sky: 'bg-sky-500/10 text-sky-400',
            violet: 'bg-violet-500/10 text-violet-400',
            rose: 'bg-rose-500/10 text-rose-400',
        };

        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClasses[config.color]}`}>
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {config.label}
            </span>
        );
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <GraduationCap className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            Gestão de Cursos
                        </h1>
                        <p className="text-sm text-gray-500">
                            {courses.length} cursos cadastrados
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    Novo Curso
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none transition-colors"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                >
                    <option value="all">Todos os status</option>
                    <option value="ACTIVE">Ativos</option>
                    <option value="DRAFT">Rascunhos</option>
                    <option value="SCHEDULED">Agendados</option>
                    <option value="PAUSED">Pausados</option>
                    <option value="COMPLETED">Concluídos</option>
                    <option value="CANCELLED">Cancelados</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-3">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Ativos</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.active}</p>
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
                            <p className="text-xs sm:text-sm text-gray-400">Total</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.total}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <GraduationCap className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" strokeWidth={1.5} />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && courses.length === 0 && (
                <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50">
                            <GraduationCap className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhum curso criado</h3>
                    <p className="text-gray-400 mb-4">Comece criando seu primeiro curso</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        Criar Curso
                    </button>
                </div>
            )}

            {/* Courses List */}
            {!isLoading && filteredCourses.length > 0 && (
                <div className="space-y-4">
                    {filteredCourses.map((course) => (
                        <div
                            key={course.id}
                            className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-white">
                                            {course.name}
                                        </h3>
                                        {getStatusBadge(course.status)}
                                    </div>

                                    {course.description && (
                                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                            {course.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                            <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                                            {getModuleCount(course.id)} módulos
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                                            Início: {formatDate(course.start_date)}
                                        </span>
                                        {course.end_date && (
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                Término: {formatDate(course.end_date)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 flex-shrink-0">
                                    <button
                                        onClick={() => openEditModal(course)}
                                        className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openDeleteDialog(course)}
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
            {!isLoading && courses.length > 0 && filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <Search className="h-8 w-8 text-gray-500 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhum curso encontrado com os filtros aplicados</p>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Novo Curso"
                size="md"
            >
                <CourseForm
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
                    setSelectedCourse(null);
                }}
                title="Editar Curso"
                size="md"
            >
                <CourseForm
                    course={selectedCourse}
                    onSubmit={handleEdit}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedCourse(null);
                    }}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedCourse(null);
                }}
                onConfirm={handleDelete}
                title="Excluir Curso"
                message={`Tem certeza que deseja excluir o curso "${selectedCourse?.name}"? Todos os módulos associados também serão excluídos. Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                isLoading={isSubmitting}
                variant="danger"
            />
        </div>
    );
}