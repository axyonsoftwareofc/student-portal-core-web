// components/admin/announcements/AnnouncementForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    AnnouncementWithDetails,
    CreateAnnouncementData,
    AnnouncementType,
    AnnouncementTarget,
    ANNOUNCEMENT_CONFIG,
    TARGET_LABELS,
} from '@/lib/types/announcements';
import { showToast } from '@/lib/toast';

interface Track {
    id: string;
    name: string;
}

interface Phase {
    id: string;
    name: string;
}

interface Module {
    id: string;
    name: string;
}

interface AnnouncementFormProps {
    tracks: Track[];
    phases: Phase[];
    modules: Module[];
    announcement?: AnnouncementWithDetails | null;
    onSubmit: (data: CreateAnnouncementData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function AnnouncementForm({
                                     tracks,
                                     phases,
                                     modules,
                                     announcement,
                                     onSubmit,
                                     onCancel,
                                     isLoading = false,
                                 }: AnnouncementFormProps) {
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [type, setType] = useState<AnnouncementType>('info');
    const [target, setTarget] = useState<AnnouncementTarget>('all');
    const [targetId, setTargetId] = useState<string>('');
    const [isPinned, setIsPinned] = useState<boolean>(false);
    const [expiresAt, setExpiresAt] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const isEditing = !!announcement;

    useEffect(() => {
        if (announcement) {
            setTitle(announcement.title);
            setContent(announcement.content);
            setType(announcement.type);
            setTarget(announcement.target);
            setTargetId(announcement.target_id || '');
            setIsPinned(announcement.is_pinned);
            setExpiresAt(announcement.expires_at ? announcement.expires_at.split('T')[0] : '');
        }
    }, [announcement]);

    const handleTargetChange = (newTarget: AnnouncementTarget) => {
        setTarget(newTarget);
        setTargetId('');
    };

    const getTargetOptions = () => {
        switch (target) {
            case 'track':
                return tracks;
            case 'phase':
                return phases;
            case 'module':
                return modules;
            default:
                return [];
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            showToast('error', 'Digite um título');
            return;
        }

        if (!content.trim()) {
            showToast('error', 'Digite o conteúdo do aviso');
            return;
        }

        if (target !== 'all' && !targetId) {
            showToast('error', `Selecione ${TARGET_LABELS[target].toLowerCase()}`);
            return;
        }

        setIsSubmitting(true);

        const data: CreateAnnouncementData = {
            title: title.trim(),
            content: content.trim(),
            type,
            target,
            target_id: target === 'all' ? null : targetId,
            is_pinned: isPinned,
            expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        };

        const result = await onSubmit(data);

        setIsSubmitting(false);

        if (result.success) {
            showToast('success', isEditing ? 'Aviso atualizado!' : 'Aviso criado!');
            onCancel();
        } else {
            showToast('error', result.error || 'Erro ao salvar aviso');
        }
    };

    const typeOptions: AnnouncementType[] = ['info', 'success', 'warning', 'urgent'];
    const targetOptions: AnnouncementTarget[] = ['all', 'track', 'phase', 'module'];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo do Aviso */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo do aviso
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {typeOptions.map((t: AnnouncementType) => {
                        const config = ANNOUNCEMENT_CONFIG[t];
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={cn(
                                    'p-3 rounded-lg border text-center transition-all',
                                    type === t
                                        ? `${config.bgColor} ${config.borderColor} ${config.textColor}`
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                                )}
                            >
                                <span className="text-xl">{config.icon}</span>
                                <p className="text-sm mt-1">{config.label}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Título */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Aula extra neste sábado!"
                    maxLength={255}
                    className={cn(
                        'w-full px-4 py-3 rounded-lg',
                        'bg-gray-800 border border-gray-700',
                        'text-white placeholder-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                    )}
                />
            </div>

            {/* Conteúdo */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Conteúdo *
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escreva os detalhes do aviso..."
                    rows={4}
                    className={cn(
                        'w-full px-4 py-3 rounded-lg',
                        'bg-gray-800 border border-gray-700',
                        'text-white placeholder-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                        'resize-none'
                    )}
                />
            </div>

            {/* Público Alvo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Público alvo
                    </label>
                    <select
                        value={target}
                        onChange={(e) => handleTargetChange(e.target.value as AnnouncementTarget)}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-gray-800 border border-gray-700',
                            'text-white',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                        )}
                    >
                        {targetOptions.map((t: AnnouncementTarget) => (
                            <option key={t} value={t}>
                                {TARGET_LABELS[t]}
                            </option>
                        ))}
                    </select>
                </div>

                {target !== 'all' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Selecionar {target === 'track' ? 'trilha' : target === 'phase' ? 'fase' : 'módulo'}
                        </label>
                        <select
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                            className={cn(
                                'w-full px-4 py-2.5 rounded-lg',
                                'bg-gray-800 border border-gray-700',
                                'text-white',
                                'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                            )}
                        >
                            <option value="">Selecione...</option>
                            {getTargetOptions().map((option: Track | Phase | Module) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Opções Extras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fixar */}
                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer hover:border-gray-600">
                    <input
                        type="checkbox"
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-sky-500 focus:ring-sky-500"
                    />
                    <div>
                        <p className="text-white font-medium">Fixar no topo</p>
                        <p className="text-sm text-gray-400">Aparece sempre primeiro</p>
                    </div>
                </label>

                {/* Data de Expiração */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expira em (opcional)
                    </label>
                    <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-gray-800 border border-gray-700',
                            'text-white',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                        )}
                    />
                </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isSubmitting || isLoading}
                >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="bg-sky-600 hover:bg-sky-500"
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4 mr-2" />
                            {isEditing ? 'Atualizar Aviso' : 'Publicar Aviso'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}