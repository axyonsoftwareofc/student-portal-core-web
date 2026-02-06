// app/(dashboard)/admin/materiais/page.tsx
'use client';

import { useState } from 'react';
import {
    Package,
    Plus,
    Search,
    FileText,
    Video,
    Image,
    FileSpreadsheet,
    FileArchive,
    Music,
    ExternalLink,
    Github,
    File,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
    Download,
    Layers,
    GraduationCap,
    BookOpen
} from 'lucide-react';
import { useMaterials, type MaterialWithLesson, type MaterialFormData } from '@/hooks/useMaterials';
import { useLessons } from '@/hooks/useLessons';
import { useCourses } from '@/hooks/useCourses';
import type { Material, MaterialCategory } from '@/lib/types/database';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import MaterialForm from '@/components/admin/MaterialForm';

// Ícone por categoria
function getMaterialIcon(category: MaterialCategory) {
    const icons: Record<MaterialCategory, typeof FileText> = {
        PDF: FileText,
        VIDEO: Video,
        ARTICLE: FileText,
        PRESENTATION: FileText,
        DOCUMENT: FileText,
        SPREADSHEET: FileSpreadsheet,
        IMAGE: Image,
        AUDIO: Music,
        COMPRESSED: FileArchive,
        LINK: ExternalLink,
        GITHUB: Github,
        OTHER: File,
    };
    return icons[category] || File;
}

// Cor por categoria
function getCategoryColor(category: MaterialCategory): string {
    const colors: Record<MaterialCategory, string> = {
        PDF: 'bg-rose-500/10 text-rose-400',
        VIDEO: 'bg-violet-500/10 text-violet-400',
        ARTICLE: 'bg-sky-500/10 text-sky-400',
        PRESENTATION: 'bg-amber-500/10 text-amber-400',
        DOCUMENT: 'bg-sky-500/10 text-sky-400',
        SPREADSHEET: 'bg-emerald-500/10 text-emerald-400',
        IMAGE: 'bg-pink-500/10 text-pink-400',
        AUDIO: 'bg-purple-500/10 text-purple-400',
        COMPRESSED: 'bg-gray-500/10 text-gray-400',
        LINK: 'bg-sky-500/10 text-sky-400',
        GITHUB: 'bg-gray-500/10 text-gray-400',
        OTHER: 'bg-gray-500/10 text-gray-400',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-400';
}

const categoryLabels: Record<MaterialCategory, string> = {
    PDF: 'PDF',
    VIDEO: 'Vídeo',
    ARTICLE: 'Artigo',
    PRESENTATION: 'Apresentação',
    DOCUMENT: 'Documento',
    SPREADSHEET: 'Planilha',
    IMAGE: 'Imagem',
    AUDIO: 'Áudio',
    COMPRESSED: 'Compactado',
    LINK: 'Link',
    GITHUB: 'GitHub',
    OTHER: 'Outro',
};

export default function MateriaisPage() {
    const { materials, isLoading, error, createMaterial, updateMaterial, deleteMaterial } = useMaterials();
    const { lessons } = useLessons();
    const { courses } = useCourses();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<'all' | MaterialCategory>('all');
    const [filterCourse, setFilterCourse] = useState<string>('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithLesson | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtrar materiais
    const filteredMaterials = materials.filter(material => {
        const matchesSearch =
            material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
        const matchesCourse = filterCourse === 'all' || material.lesson?.module?.course?.id === filterCourse;
        return matchesSearch && matchesCategory && matchesCourse;
    });

    // Estatísticas
    const stats = {
        total: materials.length,
        github: materials.filter(m => m.category === 'GITHUB').length,
        pdfs: materials.filter(m => m.category === 'PDF').length,
        links: materials.filter(m => m.category === 'LINK').length,
    };

    // Handlers
    const handleCreate = async (data: MaterialFormData) => {
        setIsSubmitting(true);
        const result = await createMaterial(data);
        setIsSubmitting(false);

        if (result.success) {
            setIsCreateModalOpen(false);
        }
        return result;
    };

    const handleEdit = async (data: MaterialFormData) => {
        if (!selectedMaterial) return { success: false, error: 'Material não selecionado' };

        setIsSubmitting(true);
        const result = await updateMaterial(selectedMaterial.id, data);
        setIsSubmitting(false);

        if (result.success) {
            setIsEditModalOpen(false);
            setSelectedMaterial(null);
        }
        return result;
    };

    const handleDelete = async () => {
        if (!selectedMaterial) return;

        setIsSubmitting(true);
        const result = await deleteMaterial(selectedMaterial.id);
        setIsSubmitting(false);

        if (result.success) {
            setIsDeleteDialogOpen(false);
            setSelectedMaterial(null);
        }
    };

    const openEditModal = (material: MaterialWithLesson) => {
        setSelectedMaterial(material);
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (material: MaterialWithLesson) => {
        setSelectedMaterial(material);
        setIsDeleteDialogOpen(true);
    };

    const openLink = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <Package className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            Materiais
                        </h1>
                        <p className="text-sm text-gray-500">
                            {materials.length} materiais cadastrados
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={lessons.length === 0}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    Novo Material
                </button>
            </div>

            {/* Aviso se não tem aulas */}
            {lessons.length === 0 && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm">
                        Você precisa criar uma aula antes de adicionar materiais.
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
                            <Package className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">GitHub</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.github}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10">
                            <Github className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">PDFs</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.pdfs}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                            <FileText className="h-5 w-5 text-rose-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Links</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.links}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <ExternalLink className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
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
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}
                    className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                >
                    <option value="all">Todas as categorias</option>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
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
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" strokeWidth={1.5} />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && materials.length === 0 && lessons.length > 0 && (
                <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50">
                            <Package className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhum material cadastrado</h3>
                    <p className="text-gray-400 mb-4">Adicione materiais às suas aulas</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        Adicionar Material
                    </button>
                </div>
            )}

            {/* Materials List */}
            {!isLoading && filteredMaterials.length > 0 && (
                <div className="space-y-3">
                    {filteredMaterials.map((material) => {
                        const Icon = getMaterialIcon(material.category);
                        const colorClass = getCategoryColor(material.category);

                        return (
                            <div
                                key={material.id}
                                className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0 ${colorClass}`}>
                                        <Icon className="h-6 w-6" strokeWidth={1.5} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-white text-base">
                                                    {material.name}
                                                </h3>
                                                {material.description && (
                                                    <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">
                                                        {material.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}>
                                                <Icon className="h-3 w-3" strokeWidth={1.5} />
                                                {categoryLabels[material.category]}
                                            </span>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                                            {material.lesson && (
                                                <>
                                                    <span className="inline-flex items-center gap-1">
                                                        <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                        {material.lesson.module?.course?.name || 'Curso'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                        {material.lesson.module?.name || 'Módulo'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                        {material.lesson.title}
                                                    </span>
                                                </>
                                            )}
                                            <span className="inline-flex items-center gap-1">
                                                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                {material.downloads} downloads
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex items-center justify-between border-t border-gray-800/50 pt-3">
                                    <span className="text-xs text-gray-500 truncate max-w-xs">
                                        {material.filename}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => openLink(material.filename)}
                                            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                                            Abrir
                                        </button>
                                        <button
                                            onClick={() => openEditModal(material)}
                                            className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                                        >
                                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => openDeleteDialog(material)}
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
            {!isLoading && materials.length > 0 && filteredMaterials.length === 0 && (
                <div className="text-center py-12">
                    <Search className="h-8 w-8 text-gray-500 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhum material encontrado com os filtros aplicados</p>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Novo Material"
                size="md"
            >
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Aula <span className="text-rose-400">*</span>
                    </label>
                    <select
                        id="lesson-select"
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    >
                        <option value="">Selecione uma aula</option>
                        {lessons.map(lesson => (
                            <option key={lesson.id} value={lesson.id}>
                                {lesson.module?.course?.name} → {lesson.module?.name} → {lesson.title}
                            </option>
                        ))}
                    </select>
                </div>
                <MaterialForm
                    onSubmit={async (data) => {
                        const select = document.getElementById('lesson-select') as HTMLSelectElement;
                        const lessonId = select?.value;
                        if (!lessonId) {
                            return { success: false, error: 'Selecione uma aula' };
                        }
                        return handleCreate({ ...data, lesson_id: lessonId });
                    }}
                    onCancel={() => setIsCreateModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedMaterial(null);
                }}
                title="Editar Material"
                size="md"
            >
                <MaterialForm
                    material={selectedMaterial}
                    lessonId={selectedMaterial?.lesson_id || undefined}
                    onSubmit={handleEdit}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedMaterial(null);
                    }}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedMaterial(null);
                }}
                onConfirm={handleDelete}
                title="Excluir Material"
                message={`Tem certeza que deseja excluir "${selectedMaterial?.name}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                isLoading={isSubmitting}
                variant="danger"
            />
        </div>
    );
}