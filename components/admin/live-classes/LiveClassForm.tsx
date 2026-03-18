// components/admin/live-classes/LiveClassForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Send, X, Calendar, Video, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    LiveClassWithDetails,
    CreateLiveClassData,
    LiveClassStatus,
    LIVE_CLASS_STATUS_CONFIG,
} from '@/lib/types/live-classes';
import { showToast } from '@/lib/toast';

interface Track {
    id: string;
    name: string;
}

interface Phase {
    id: string;
    name: string;
    track_id: string;
}

interface Module {
    id: string;
    name: string;
    phase_id: string;
}

interface LiveClassFormProps {
    tracks: Track[];
    phases: Phase[];
    modules: Module[];
    liveClass?: LiveClassWithDetails | null;
    onSubmit: (data: CreateLiveClassData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function LiveClassForm({
                                  tracks,
                                  phases,
                                  modules,
                                  liveClass,
                                  onSubmit,
                                  onCancel,
                                  isLoading = false,
                              }: LiveClassFormProps) {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [scheduledAt, setScheduledAt] = useState<string>('');
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [meetUrl, setMeetUrl] = useState<string>('');
    const [durationMinutes, setDurationMinutes] = useState<string>('');
    const [trackId, setTrackId] = useState<string>('');
    const [phaseId, setPhaseId] = useState<string>('');
    const [moduleId, setModuleId] = useState<string>('');
    const [status, setStatus] = useState<LiveClassStatus>('scheduled');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const isEditing = !!liveClass;

    useEffect(() => {
        if (liveClass) {
            setTitle(liveClass.title);
            setDescription(liveClass.description || '');
            setScheduledAt(liveClass.scheduled_at.slice(0, 16));
            setVideoUrl(liveClass.video_url || '');
            setMeetUrl(liveClass.meet_url || '');
            setDurationMinutes(liveClass.duration_minutes?.toString() || '');
            setTrackId(liveClass.track_id || '');
            setPhaseId(liveClass.phase_id || '');
            setModuleId(liveClass.module_id || '');
            setStatus(liveClass.status);
        }
    }, [liveClass]);

    const filteredPhases = trackId
        ? phases.filter((p: Phase) => p.track_id === trackId)
        : phases;

    const filteredModules = phaseId
        ? modules.filter((m: Module) => m.phase_id === phaseId)
        : modules;

    const handleTrackChange = (newTrackId: string) => {
        setTrackId(newTrackId);
        setPhaseId('');
        setModuleId('');
    };

    const handlePhaseChange = (newPhaseId: string) => {
        setPhaseId(newPhaseId);
        setModuleId('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            showToast('error', 'Digite um título');
            return;
        }

        if (!scheduledAt) {
            showToast('error', 'Selecione a data e hora');
            return;
        }

        setIsSubmitting(true);

        const data: CreateLiveClassData = {
            title: title.trim(),
            description: description.trim() || null,
            scheduled_at: new Date(scheduledAt).toISOString(),
            video_url: videoUrl.trim() || null,
            meet_url: meetUrl.trim() || null,
            duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
            track_id: trackId || null,
            phase_id: phaseId || null,
            module_id: moduleId || null,
            status,
        };

        const result = await onSubmit(data);

        setIsSubmitting(false);

        if (result.success) {
            showToast('success', isEditing ? 'Aula atualizada!' : 'Aula criada!');
            onCancel();
        } else {
            showToast('error', result.error || 'Erro ao salvar');
        }
    };

    const statusOptions: LiveClassStatus[] = ['scheduled', 'live', 'recorded', 'cancelled'];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título da Aula *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Revisão de POO - Dúvidas"
                    maxLength={255}
                    className={cn(
                        'w-full px-4 py-3 rounded-lg',
                        'bg-gray-800 border border-gray-700',
                        'text-white placeholder-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                    )}
                />
            </div>

            {/* Descrição */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição (opcional)
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tópicos que serão abordados..."
                    rows={3}
                    className={cn(
                        'w-full px-4 py-3 rounded-lg',
                        'bg-gray-800 border border-gray-700',
                        'text-white placeholder-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                        'resize-none'
                    )}
                />
            </div>

            {/* Data/Hora e Duração */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Data e Hora *
                    </label>
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-gray-800 border border-gray-700',
                            'text-white',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                        )}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duração (minutos)
                    </label>
                    <input
                        type="number"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        placeholder="Ex: 90"
                        min="1"
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-gray-800 border border-gray-700',
                            'text-white placeholder-gray-500',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                        )}
                    />
                </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Video className="inline h-4 w-4 mr-1" />
                        Link do Google Meet
                    </label>
                    <input
                        type="url"
                        value={meetUrl}
                        onChange={(e) => setMeetUrl(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-gray-800 border border-gray-700',
                            'text-white placeholder-gray-500',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                        )}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <LinkIcon className="inline h-4 w-4 mr-1" />
                        Link da Gravação (YouTube/Drive)
                    </label>
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/... ou https://drive.google.com/..."
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-gray-800 border border-gray-700',
                            'text-white placeholder-gray-500',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                        )}
                    />
                </div>
            </div>

            {/* Vinculação (Trilha > Fase > Módulo) */}
            <div className="space-y-4">
                <p className="text-sm font-medium text-gray-300">
                    Vincular a (opcional):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Trilha</label>
                        <select
                            value={trackId}
                            onChange={(e) => handleTrackChange(e.target.value)}
                            className={cn(
                                'w-full px-4 py-2.5 rounded-lg',
                                'bg-gray-800 border border-gray-700',
                                'text-white',
                                'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                            )}
                        >
                            <option value="">Nenhuma</option>
                            {tracks.map((track: Track) => (
                                <option key={track.id} value={track.id}>
                                    {track.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Fase</label>
                        <select
                            value={phaseId}
                            onChange={(e) => handlePhaseChange(e.target.value)}
                            disabled={!trackId}
                            className={cn(
                                'w-full px-4 py-2.5 rounded-lg',
                                'bg-gray-800 border border-gray-700',
                                'text-white',
                                'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                                !trackId && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <option value="">Nenhuma</option>
                            {filteredPhases.map((phase: Phase) => (
                                <option key={phase.id} value={phase.id}>
                                    {phase.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Módulo</label>
                        <select
                            value={moduleId}
                            onChange={(e) => setModuleId(e.target.value)}
                            disabled={!phaseId}
                            className={cn(
                                'w-full px-4 py-2.5 rounded-lg',
                                'bg-gray-800 border border-gray-700',
                                'text-white',
                                'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                                !phaseId && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <option value="">Nenhum</option>
                            {filteredModules.map((module: Module) => (
                                <option key={module.id} value={module.id}>
                                    {module.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {statusOptions.map((s: LiveClassStatus) => {
                        const config = LIVE_CLASS_STATUS_CONFIG[s];
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(s)}
                                className={cn(
                                    'p-3 rounded-lg border text-center transition-all',
                                    status === s
                                        ? `${config.bgColor} ${config.borderColor} ${config.textColor}`
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                                )}
                            >
                                <span className="text-xl">{config.icon}</span>
                                <p className="text-xs mt-1">{config.label}</p>
                            </button>
                        );
                    })}
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
                            {isEditing ? 'Atualizar' : 'Criar Aula'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}