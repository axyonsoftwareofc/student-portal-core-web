// components/aluno/MaterialsList.tsx
'use client';

import {
    FileText,
    Video,
    Image,
    FileSpreadsheet,
    FileArchive,
    Music,
    ExternalLink,
    Github,
    File,
    Download,
    Loader2
} from 'lucide-react';
import type { Material, MaterialCategory } from '@/lib/types/database';

interface MaterialsListProps {
    materials: Material[];
    isLoading?: boolean;
    onDownload?: (materialId: string) => void;
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
function getMaterialColor(category: MaterialCategory) {
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

// Formatar tamanho do arquivo
function formatFileSize(bytes?: number | null): string {
    if (!bytes) return '';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export default function MaterialsList({
                                          materials,
                                          isLoading,
                                          onDownload
                                      }: MaterialsListProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-sky-400 animate-spin" strokeWidth={1.5} />
            </div>
        );
    }

    if (materials.length === 0) {
        return (
            <div className="text-center py-8 rounded-lg border border-gray-800/50 bg-gray-900/30">
                <File className="h-10 w-10 text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-gray-500 text-sm">Nenhum material disponível</p>
            </div>
        );
    }

    const handleClick = (material: Material) => {
        if (onDownload) {
            onDownload(material.id);
        }

        // Abrir link/arquivo
        // Por enquanto, vamos assumir que filename é uma URL
        // Depois podemos integrar com Supabase Storage
        if (material.filename.startsWith('http')) {
            window.open(material.filename, '_blank');
        }
    };

    return (
        <div className="space-y-3">
            {materials.map((material) => {
                const Icon = getMaterialIcon(material.category);
                const colorClass = getMaterialColor(material.category);
                const fileSize = formatFileSize(material.file_size);

                return (
                    <button
                        key={material.id}
                        onClick={() => handleClick(material)}
                        className="w-full flex items-center gap-4 rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50 hover:border-gray-700 text-left group"
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
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs text-gray-500">
                                    {material.category}
                                </span>
                                {fileSize && (
                                    <span className="text-xs text-gray-600">
                                        {fileSize}
                                    </span>
                                )}
                                {material.downloads > 0 && (
                                    <span className="text-xs text-gray-600 flex items-center gap-1">
                                        <Download className="h-3 w-3" strokeWidth={1.5} />
                                        {material.downloads}
                                    </span>
                                )}
                            </div>
                            {material.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {material.description}
                                </p>
                            )}
                        </div>

                        {/* Download icon */}
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}