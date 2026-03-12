// components/admin/ModuleForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Module, ModuleFormData, ModuleStatus, Phase, Track } from '@/lib/types/database';

// 🆕 v20.0 - Agora recebe phases em vez de courses
interface PhaseWithTrack extends Phase {
    track: Track;
}

interface ModuleFormProps {
    module?: Module | null;
    phases: PhaseWithTrack[];
    defaultPhaseId?: string;
    onSubmit: (data: ModuleFormData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
    isLoading?: boolean;
}

const statusOptions: { value: ModuleStatus; label: string }[] = [
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'PUBLISHED', label: 'Publicado' },
    { value: 'ARCHIVED', label: 'Arquivado' },
];

export default function ModuleForm({
                                       module,
                                       phases,
                                       defaultPhaseId,
                                       onSubmit,
                                       onCancel,
                                       isLoading
                                   }: ModuleFormProps) {
    const [formData, setFormData] = useState<ModuleFormData>({
        phase_id: '',
        name: '',
        description: '',
        status: 'DRAFT',
    });
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (module) {
            // Editando módulo existente
            setFormData({
                phase_id: module.phase_id || '',
                name: module.name,
                description: module.description || '',
                status: module.status,
            });
        } else {
            // Criando novo módulo
            const initialPhaseId = defaultPhaseId || (phases.length > 0 ? phases[0].id : '');
            setFormData(prev => ({ ...prev, phase_id: initialPhaseId }));
        }
    }, [module, phases, defaultPhaseId]);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');

        if (!formData.phase_id) {
            setError('Selecione uma fase');
            return;
        }

        if (!formData.name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        const result = await onSubmit(formData);
        if (!result.success && result.error) {
            setError(result.error);
        }
    };

    // Agrupar fases por trilha para exibição organizada
    const phasesByTrack = phases.reduce((acc, phase) => {
        const trackName = phase.track?.name || 'Sem trilha';
        if (!acc[trackName]) {
            acc[trackName] = [];
        }
        acc[trackName].push(phase);
        return acc;
    }, {} as Record<string, PhaseWithTrack[]>);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
                    {error}
                </div>
            )}

            {/* 🆕 v20.0 - Seletor de Fase (agrupado por Trilha) */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Fase <span className="text-rose-400">*</span>
                </label>
                <select
                    value={formData.phase_id}
                    onChange={(e) => setFormData({ ...formData, phase_id: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    disabled={isLoading}
                >
                    <option value="">Selecione uma fase</option>
                    {Object.entries(phasesByTrack).map(([trackName, trackPhases]) => (
                        <optgroup key={trackName} label={`📚 ${trackName}`}>
                            {trackPhases.map(phase => (
                                <option key={phase.id} value={phase.id}>
                                    Fase {phase.number}: {phase.name}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                    O módulo será vinculado à fase e trilha selecionadas
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Nome do Módulo <span className="text-rose-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    placeholder="Ex: 2.1 Introdução à POO"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Descrição
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors resize-none"
                    placeholder="Breve descrição do módulo..."
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Status
                </label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ModuleStatus })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    disabled={isLoading}
                >
                    {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

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
                    {module ? 'Salvar Alterações' : 'Criar Módulo'}
                </button>
            </div>
        </form>
    );
}