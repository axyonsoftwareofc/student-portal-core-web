// components/admin/MaterialsManager.tsx
'use client';

import { useState } from 'react';
import {
    Plus,
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
    Download,
    Package
} from 'lucide-react';
import { useMaterials, type MaterialFormData } from '@/hooks/useMaterials';
import type { Material, MaterialCategory } from '@/lib/types/database';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import MaterialForm from './MaterialForm';

interface MaterialsManagerProps {
    lessonId: string;
    lessonTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

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

export default function MaterialsManager({
                                             lessonId,
                                             lessonTitle,
                                             isOpen,
                                             onClose
                                         }: MaterialsManagerProps) {
    const { materials, isLoading, createMaterial, updateMaterial, deleteMaterial } = useMaterials(lessonId);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (data: MaterialFormData) => {
        setIsSubmitting(true);
        const result = await createMaterial({ ...data, lesson_id: lessonId });
        setIsSubmitting(false);

        if (result.success) {
            setIsFormOpen(false);
        }
        return result;
    };

    const handleEdit = async (data: MaterialFormData) => {
        if (!selectedMaterial) return { success: false, error: 'Material não selecionado' };

        setIsSubmitting(true);
        const result = await updateMaterial(selectedMaterial.id, data);
        setIsSubmitting(false);

        if (result.success) {
            setIsFormOpen(false);
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

    const openEditForm = (material: Material) => {
        setSelectedMaterial(material);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (material: Material) => {
        setSelectedMaterial(material);
        setIsDeleteDialogOpen(true);
    };

    const openLink = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`Materiais: ${lessonTitle}`}
                size="lg"
            >
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                            {materials.length} {materials.length === 1 ? 'material' : 'materiais'}
                        </p>
                        <button
                            onClick={() => {
                                setSelectedMaterial(null);
                                setIsFormOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                        >
                            <Plus className="h-4 w-4" strokeWidth={1.5} />
                            Adicionar
                        </button>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 text-sky-400 animate-spin" strokeWidth={1.5} />
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && materials.length === 0 && (
                        <div className="text-center py-8 rounded-lg border border-gray-800/50 bg-gray-900/30">
                            <Package className="h-10 w-10 text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
                            <p className="text-gray-400 text-sm mb-3">Nenhum material adicionado</p>
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300"
                            >
                                <Plus className="h-4 w-4" strokeWidth={1.5} />
                                Adicionar primeiro material
                            </button>
                        </div>
                    )}

                    {/* Materials List */}
                    {!isLoading && materials.length > 0 && (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {materials.map((material) => {
                                const Icon = getMaterialIcon(material.category);
                                const colorClass = getCategoryColor(material.category);

                                return (
                                    <div
                                        key={material.id}
                                        className="flex items-center gap-3 rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 group hover:border-gray-700 transition-colors"
                                    >
                                        {/* Icon */}
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${colorClass}`}>
                                            <Icon className="h-5 w-5" strokeWidth={1.5} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-200 text-sm truncate">
                                                {material.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500">
                                                    {material.category}
                                                </span>
                                                {material.downloads > 0 && (
                                                    <span className="text-xs text-gray-600 flex items-center gap-1">
                                                        <Download className="h-3 w-3" strokeWidth={1.5} />
                                                        {material.downloads}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openLink(material.filename)}
                                                className="p-2 text-gray-400 hover:text-sky-400 transition-colors"
                                                title="Abrir link"
                                            >
                                                <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                                            </button>
                                            <button
                                                onClick={() => openEditForm(material)}
                                                className="p-2 text-gray-400 hover:text-sky-400 transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                            </button>
                                            <button
                                                onClick={() => openDeleteDialog(material)}
                                                className="p-2 text-gray-400 hover:text-rose-400 transition-colors"
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

                    {/* Close Button */}
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedMaterial(null);
                }}
                title={selectedMaterial ? 'Editar Material' : 'Novo Material'}
                size="md"
            >
                <MaterialForm
                    material={selectedMaterial}
                    lessonId={lessonId}
                    onSubmit={selectedMaterial ? handleEdit : handleCreate}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setSelectedMaterial(null);
                    }}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Dialog */}
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
        </>
    );
}