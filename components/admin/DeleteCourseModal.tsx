// components/admin/DeleteCourseModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Trash2,
    Loader2,
    Layers,
    BookOpen,
    FileText,
    Users,
    GraduationCap
} from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface CourseStats {
    modules: number;
    lessons: number;
    contents: number;
    enrollments: number;
}

interface DeleteCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    course: {
        id: string;
        name: string;
    } | null;
    isLoading?: boolean;
}

export default function DeleteCourseModal({
                                              isOpen,
                                              onClose,
                                              onConfirm,
                                              course,
                                              isLoading = false
                                          }: DeleteCourseModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');
    const [stats, setStats] = useState<CourseStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Buscar estatísticas quando abrir o modal
    useEffect(() => {
        if (isOpen && course?.id) {
            setConfirmText('');
            setError('');
            fetchStats();
        }
    }, [isOpen, course?.id]);

    const fetchStats = async () => {
        if (!course?.id) return;

        setLoadingStats(true);
        try {
            const response = await fetch(`/api/admin/delete-course?courseId=${course.id}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Erro ao buscar estatísticas:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    const isConfirmValid = confirmText.trim().toUpperCase() === 'EXCLUIR';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConfirmValid) {
            setError('Digite "EXCLUIR" para confirmar');
            return;
        }

        await onConfirm();
    };

    const handleClose = () => {
        if (!isLoading) {
            setConfirmText('');
            setError('');
            setStats(null);
            onClose();
        }
    };

    if (!course) return null;

    const hasContent = stats && (stats.modules > 0 || stats.lessons > 0 || stats.enrollments > 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title=""
            size="md"
        >
            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 mb-4">
                        <AlertTriangle className="h-7 w-7 text-rose-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                        Excluir Curso Permanentemente
                    </h2>
                    <p className="text-gray-400 mt-1">
                        Esta ação é <span className="text-rose-400 font-medium">irreversível</span>
                    </p>
                </div>

                {/* Dados do curso */}
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <GraduationCap className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-white truncate">{course.name}</p>
                        </div>
                    </div>
                </div>

                {/* Estatísticas do que será deletado */}
                {loadingStats ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-400">Carregando informações...</span>
                    </div>
                ) : stats && hasContent ? (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-rose-400 flex items-center gap-2">
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            Serão excluídos permanentemente:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {stats.modules > 0 && (
                                <div className="flex flex-col items-center p-3 rounded-lg bg-rose-950/20 border border-rose-500/10">
                                    <Layers className="h-5 w-5 text-rose-400/70 mb-1" strokeWidth={1.5} />
                                    <span className="text-lg font-semibold text-rose-300">{stats.modules}</span>
                                    <span className="text-xs text-rose-300/70">módulos</span>
                                </div>
                            )}
                            {stats.lessons > 0 && (
                                <div className="flex flex-col items-center p-3 rounded-lg bg-rose-950/20 border border-rose-500/10">
                                    <BookOpen className="h-5 w-5 text-rose-400/70 mb-1" strokeWidth={1.5} />
                                    <span className="text-lg font-semibold text-rose-300">{stats.lessons}</span>
                                    <span className="text-xs text-rose-300/70">aulas</span>
                                </div>
                            )}
                            {stats.contents > 0 && (
                                <div className="flex flex-col items-center p-3 rounded-lg bg-rose-950/20 border border-rose-500/10">
                                    <FileText className="h-5 w-5 text-rose-400/70 mb-1" strokeWidth={1.5} />
                                    <span className="text-lg font-semibold text-rose-300">{stats.contents}</span>
                                    <span className="text-xs text-rose-300/70">blocos</span>
                                </div>
                            )}
                            {stats.enrollments > 0 && (
                                <div className="flex flex-col items-center p-3 rounded-lg bg-rose-950/20 border border-rose-500/10">
                                    <Users className="h-5 w-5 text-rose-400/70 mb-1" strokeWidth={1.5} />
                                    <span className="text-lg font-semibold text-rose-300">{stats.enrollments}</span>
                                    <span className="text-xs text-rose-300/70">matrículas</span>
                                </div>
                            )}
                        </div>
                        {stats.enrollments > 0 && (
                            <div className="mt-3 p-2 rounded-lg bg-amber-950/30 border border-amber-500/20">
                                <p className="text-xs text-amber-300 text-center">
                                    ⚠️ Existem alunos matriculados neste curso!
                                </p>
                            </div>
                        )}
                    </div>
                ) : stats && !hasContent ? (
                    <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                        <p className="text-sm text-gray-400 text-center">
                            Este curso está vazio (sem módulos ou matrículas).
                        </p>
                    </div>
                ) : null}

                {/* Campo de confirmação */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Digite <span className="font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">EXCLUIR</span> para confirmar:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            placeholder="Digite EXCLUIR"
                            disabled={isLoading}
                            className={`w-full rounded-lg border bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                                error
                                    ? 'border-rose-500 focus:border-rose-500'
                                    : isConfirmValid
                                        ? 'border-emerald-500 focus:border-emerald-500'
                                        : 'border-gray-800 focus:border-rose-500'
                            }`}
                            autoComplete="off"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-1.5 text-xs text-rose-400">{error}</p>
                        )}
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !isConfirmValid}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                                isConfirmValid
                                    ? 'bg-rose-600 text-white hover:bg-rose-500'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                    Excluir Curso
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}