// app/(dashboard)/admin/modulos/page.tsx
'use client';

import { useState } from 'react';
import {
    Layers,
    Plus,
    Search,
    CheckCircle,
    FileEdit,
    Archive,
    BookOpen,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { useModules, type ModuleWithCourse } from '@/hooks/useModules';
import { useCourses } from '@/hooks/useCourses';
import type { ModuleFormData, ModuleStatus } from '@/lib/types/database';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import ModuleForm from '@/components/admin/ModuleForm';
import Link from 'next/link';

const statusConfig: Record<ModuleStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
    PUBLISHED: { label: 'Publicado', color: 'emerald', icon: CheckCircle },
    DRAFT: { label: 'Rascunho', color: 'amber', icon: FileEdit },
    ARCHIVED: { label: 'Arquivado', color: 'gray', icon: Archive },
};

export default function ModulosPage() {
    const { modules, isLoading, error, createModule, updateModule, deleteModule } = useModules();
    const { courses, isLoading: isLoadingCourses } = useCourses();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | ModuleStatus>('all');
    const [filterCourse, setFilterCourse] = useState<string>('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<ModuleWithCourse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtrar módulos
    const filteredModules = modules.filter(module => {
        const matchesSearch =
            module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || module.status === filterStatus;
        const matchesCourse = filterCourse === 'all' || module.course_id === filterCourse;
        return matchesSearch && matchesStatus && matchesCourse;
    });

    // Estatísticas
    const stats = {
        published: modules.filter(m => m.status === 'PUBLISHED').length,
        draft: modules.filter(m => m.status === 'DRAFT').length,
        total: modules.length,
    };

    // Handlers
    const handleCreate = async (data: ModuleFormData) => {
        setIsSubmitting(true);
        const result = await createModule(data);
        setIsSubmitting(false);

        if (result.success) {
            setIsCreateModalOpen(false);
        }
        return result;
    };

    const handleEdit = async (data: ModuleFormData) => {
        if (!selectedModule) return { success: false, error: 'Módulo não selecionado' };

        setIsSubmitting(true);
        const result = await updateModule(selectedModule.id, data);
        setIsSubmitting(false);

        if (result.success) {
            setIsEditModalOpen(false);
            setSelectedModule(null);
        }
        return result;
    };

    const handleDelete = async () => {
        if (!selectedModule) return;

        setIsSubmitting(true);
        const result = await deleteModule(selectedModule.id);
        setIsSubmitting(false);

        if (result.success) {
            setIsDeleteDialogOpen(false);
            setSelectedModule(null);
        }
    };

    const openEditModal = (module: ModuleWithCourse) => {
        setSelectedModule(module);
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (module: ModuleWithCourse) => {
        setSelectedModule(module);
        setIsDeleteDialogOpen(true);
    };

    const getStatusBadge = (status: ModuleStatus) => {
        const config = statusConfig[status];
        const Icon = config.icon;

        const colorClasses = {
            emerald: 'bg-emerald-500/10 text-emerald-400',
            amber: 'bg-amber-500/10 text-amber-400',
            gray: 'bg-gray-500/10 text-gray-400',
        }[config.color];

        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClasses}`}>
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
                        <Layers className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            Gestão de Módulos
                        </h1>
                        <p className="text-sm text-gray-500">
                            {modules.length} módulos criados
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={courses.length === 0}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    Novo Módulo
                </button>
            </div>

            {/* Aviso se não tem cursos */}
            {!isLoadingCourses && courses.length === 0 && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm">
                        Você precisa criar um curso antes de adicionar módulos.
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                >
                    <option value="all">Todos os cursos</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
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

            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-3">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Publicados</p>
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
                            <p className="text-xs sm:text-sm text-gray-400">Total</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.total}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <Layers className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
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
            {!isLoading && modules.length === 0 && courses.length > 0 && (
                <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50">
                            <Layers className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhum módulo criado</h3>
                    <p className="text-gray-400 mb-4">Comece adicionando seu primeiro módulo</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        Criar Módulo
                    </button>
                </div>
            )}

            {/* Modules Grid */}
            {!isLoading && filteredModules.length > 0 && (
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    {filteredModules.map((module) => (
                        <div
                            key={module.id}
                            className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                        >
                            <div className="flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center justify-center h-6 w-6 rounded bg-gray-800 text-xs text-gray-400 font-medium">
                                            {module.order_index}
                                        </span>
                                        <Link
                                            href={`/admin/modulos/${module.id}`}
                                            className="text-base sm:text-lg font-semibold text-white hover:text-sky-400 transition-colors"
                                        >
                                            {module.name}
                                        </Link>
                                    </div>
                                    {getStatusBadge(module.status)}
                                </div>

                                {module.description && (
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                        {module.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1">
                                        <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        {module.course?.name || 'Curso não encontrado'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-800/50 pt-4">
                                <span className="text-xs text-gray-500">
                                    Criado em {new Date(module.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => openEditModal(module)}
                                        className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openDeleteDialog(module)}
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
            {!isLoading && modules.length > 0 && filteredModules.length === 0 && (
                <div className="text-center py-12">
                    <Search className="h-8 w-8 text-gray-500 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhum módulo encontrado com os filtros aplicados</p>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Novo Módulo"
                size="md"
            >
                <ModuleForm
                    courses={courses}
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
                    setSelectedModule(null);
                }}
                title="Editar Módulo"
                size="md"
            >
                <ModuleForm
                    module={selectedModule}
                    courses={courses}
                    onSubmit={handleEdit}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedModule(null);
                    }}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedModule(null);
                }}
                onConfirm={handleDelete}
                title="Excluir Módulo"
                message={`Tem certeza que deseja excluir o módulo "${selectedModule?.name}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                isLoading={isSubmitting}
                variant="danger"
            />
        </div>
    );
}