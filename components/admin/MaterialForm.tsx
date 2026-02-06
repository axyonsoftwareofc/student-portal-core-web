// components/admin/MaterialForm.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    Loader2,
    FileText,
    Video,
    Image,
    FileSpreadsheet,
    FileArchive,
    Music,
    ExternalLink,
    Github,
    File,
    Link as LinkIcon
} from 'lucide-react';
import type { Material, MaterialCategory } from '@/lib/types/database';
import type { MaterialFormData } from '@/hooks/useMaterials';

interface MaterialFormProps {
    material?: Material | null;
    lessonId?: string;
    onSubmit: (data: MaterialFormData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
    isLoading?: boolean;
}

const categoryOptions: { value: MaterialCategory; label: string; icon: typeof FileText; placeholder: string }[] = [
    { value: 'LINK', label: 'Link', icon: ExternalLink, placeholder: 'https://exemplo.com/recurso' },
    { value: 'GITHUB', label: 'GitHub', icon: Github, placeholder: 'https://github.com/usuario/repositorio' },
    { value: 'PDF', label: 'PDF', icon: FileText, placeholder: 'https://exemplo.com/arquivo.pdf' },
    { value: 'VIDEO', label: 'Vídeo', icon: Video, placeholder: 'https://youtube.com/watch?v=...' },
    { value: 'DOCUMENT', label: 'Documento', icon: FileText, placeholder: 'https://docs.google.com/...' },
    { value: 'PRESENTATION', label: 'Apresentação', icon: FileText, placeholder: 'https://slides.google.com/...' },
    { value: 'SPREADSHEET', label: 'Planilha', icon: FileSpreadsheet, placeholder: 'https://sheets.google.com/...' },
    { value: 'IMAGE', label: 'Imagem', icon: Image, placeholder: 'https://exemplo.com/imagem.png' },
    { value: 'AUDIO', label: 'Áudio', icon: Music, placeholder: 'https://exemplo.com/audio.mp3' },
    { value: 'COMPRESSED', label: 'Compactado', icon: FileArchive, placeholder: 'https://exemplo.com/arquivo.zip' },
    { value: 'ARTICLE', label: 'Artigo', icon: FileText, placeholder: 'https://medium.com/...' },
    { value: 'OTHER', label: 'Outro', icon: File, placeholder: 'https://...' },
];

export default function MaterialForm({
                                         material,
                                         lessonId,
                                         onSubmit,
                                         onCancel,
                                         isLoading
                                     }: MaterialFormProps) {
    const [formData, setFormData] = useState<MaterialFormData>({
        name: '',
        description: '',
        category: 'LINK',
        filename: '',
        file_size: undefined,
        lesson_id: lessonId,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (material) {
            setFormData({
                name: material.name,
                description: material.description || '',
                category: material.category,
                filename: material.filename,
                file_size: material.file_size || undefined,
                lesson_id: material.lesson_id || lessonId,
            });
        } else if (lessonId) {
            setFormData(prev => ({ ...prev, lesson_id: lessonId }));
        }
    }, [material, lessonId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        if (!formData.filename.trim()) {
            setError('URL/Link é obrigatório');
            return;
        }

        // Validar se é uma URL válida
        try {
            new URL(formData.filename);
        } catch {
            setError('Digite uma URL válida (ex: https://...)');
            return;
        }

        const result = await onSubmit(formData);
        if (!result.success && result.error) {
            setError(result.error);
        }
    };

    // Detectar categoria automaticamente pela URL
    const detectCategory = (url: string): MaterialCategory | null => {
        const lowerUrl = url.toLowerCase();

        if (lowerUrl.includes('github.com') || lowerUrl.includes('gitlab.com')) {
            return 'GITHUB';
        }
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo.com')) {
            return 'VIDEO';
        }
        if (lowerUrl.endsWith('.pdf')) {
            return 'PDF';
        }
        if (lowerUrl.match(/\.(doc|docx)$/)) {
            return 'DOCUMENT';
        }
        if (lowerUrl.match(/\.(ppt|pptx)$/)) {
            return 'PRESENTATION';
        }
        if (lowerUrl.match(/\.(xls|xlsx|csv)$/)) {
            return 'SPREADSHEET';
        }
        if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            return 'IMAGE';
        }
        if (lowerUrl.match(/\.(mp3|wav|ogg)$/)) {
            return 'AUDIO';
        }
        if (lowerUrl.match(/\.(zip|rar|7z|tar|gz)$/)) {
            return 'COMPRESSED';
        }

        return null;
    };

    const handleUrlChange = (url: string) => {
        setFormData(prev => ({ ...prev, filename: url }));

        // Auto-detectar categoria
        const detected = detectCategory(url);
        if (detected) {
            setFormData(prev => ({ ...prev, category: detected }));
        }
    };

    const selectedCategory = categoryOptions.find(c => c.value === formData.category);
    const CategoryIcon = selectedCategory?.icon || File;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
                    {error}
                </div>
            )}

            {/* Categoria - Agora primeiro para ficar mais intuitivo */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Tipo de Material
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {categoryOptions.map(option => {
                        const Icon = option.icon;
                        const isSelected = formData.category === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: option.value })}
                                disabled={isLoading}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                                    isSelected
                                        ? 'border-sky-500 bg-sky-500/10'
                                        : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                                }`}
                            >
                                <Icon className={`h-4 w-4 ${isSelected ? 'text-sky-400' : 'text-gray-500'}`} strokeWidth={1.5} />
                                <span className={`text-xs ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* URL/Link */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    URL / Link <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                    <input
                        type="text"
                        value={formData.filename}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                        placeholder={selectedCategory?.placeholder || 'https://...'}
                        disabled={isLoading}
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    Cole a URL do material. A categoria será detectada automaticamente quando possível.
                </p>
            </div>

            {/* Nome */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Nome do Material <span className="text-rose-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    placeholder="Ex: Código fonte da aula"
                    disabled={isLoading}
                />
            </div>

            {/* Descrição */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Descrição <span className="text-gray-500">(opcional)</span>
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors resize-none"
                    placeholder="Breve descrição do material..."
                    disabled={isLoading}
                />
            </div>

            {/* Preview */}
            {formData.filename && formData.name && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <CategoryIcon className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {formData.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {selectedCategory?.label} • {formData.filename}
                        </p>
                    </div>
                </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 justify-end pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {material ? 'Salvar' : 'Adicionar Material'}
                </button>
            </div>
        </form>
    );
}