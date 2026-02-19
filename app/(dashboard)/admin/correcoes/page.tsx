// app/(dashboard)/admin/correcoes/page.tsx
'use client';

import { useState } from 'react';
import {
    ClipboardCheck,
    Search,
    Clock,
    CheckCircle,
    AlertCircle,
    RotateCcw,
    Loader2,
    User,
    BookOpen,
    Calendar,
    Filter,
    Eye,
} from 'lucide-react';
import { useExerciseSubmissions } from '@/hooks/useExerciseSubmissions';
import { useAuth } from '@/contexts/AuthContext';
import type { ExerciseSubmissionWithDetails, SubmissionStatus } from '@/lib/types/exercise-submissions';
import SubmissionReviewModal from '@/components/admin/submissions/SubmissionReviewModal';

const statusConfig: Record<SubmissionStatus, { label: string; icon: typeof Clock; color: string }> = {
    pending: { label: 'Pendente', icon: Clock, color: 'amber' },
    reviewed: { label: 'Corrigido', icon: CheckCircle, color: 'sky' },
    approved: { label: 'Aprovado', icon: CheckCircle, color: 'emerald' },
    needs_revision: { label: 'Revisão Necessária', icon: RotateCcw, color: 'rose' },
};

export default function CorrecoesPage() {
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedSubmission, setSelectedSubmission] = useState<ExerciseSubmissionWithDetails | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

    const { submissions, isLoading, error, reviewSubmission, refetch } = useExerciseSubmissions(
        filterStatus === 'all' ? undefined : filterStatus
    );
    const { user } = useAuth();

    const filteredSubmissions = submissions.filter((submission: ExerciseSubmissionWithDetails) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        const studentName = submission.student?.name?.toLowerCase() || '';
        const studentEmail = submission.student?.email?.toLowerCase() || '';
        const contentTitle = submission.content?.title?.toLowerCase() || '';
        const lessonTitle = submission.content?.lesson?.title?.toLowerCase() || '';

        return (
            studentName.includes(searchLower) ||
            studentEmail.includes(searchLower) ||
            contentTitle.includes(searchLower) ||
            lessonTitle.includes(searchLower)
        );
    });

    const stats = {
        total: submissions.length,
        pending: submissions.filter((s: ExerciseSubmissionWithDetails) => s.status === 'pending').length,
        reviewed: submissions.filter((s: ExerciseSubmissionWithDetails) => s.status === 'reviewed' || s.status === 'approved').length,
        needsRevision: submissions.filter((s: ExerciseSubmissionWithDetails) => s.status === 'needs_revision').length,
    };

    const openReviewModal = (submission: ExerciseSubmissionWithDetails): void => {
        setSelectedSubmission(submission);
        setIsReviewModalOpen(true);
    };

    const handleReview = async (
        submissionId: string,
        data: { grade?: number; feedback?: string; status: SubmissionStatus }
    ): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) return { success: false, error: 'Usuário não autenticado' };

        const result = await reviewSubmission(submissionId, {
            ...data,
            reviewed_by: user.id,
        });

        if (result.success) {
            setIsReviewModalOpen(false);
            setSelectedSubmission(null);
        }

        return result;
    };

    const getStatusBadge = (status: SubmissionStatus) => {
        const config = statusConfig[status];
        const Icon = config.icon;

        const colorClasses: Record<string, string> = {
            amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
            emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };

        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${colorClasses[config.color]}`}>
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                        <ClipboardCheck className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            Correção de Exercícios
                        </h1>
                        <p className="text-sm text-gray-500">
                            {stats.pending} pendentes de {stats.total} total
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Total</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.total}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <ClipboardCheck className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Pendentes</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.pending}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <Clock className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Corrigidos</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.reviewed}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Revisão</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">{stats.needsRevision}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                            <RotateCcw className="h-5 w-5 text-rose-400" strokeWidth={1.5} />
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
                        placeholder="Buscar por aluno, exercício ou aula..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none transition-colors"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {[
                        { value: 'all', label: 'Todos' },
                        { value: 'pending', label: 'Pendentes' },
                        { value: 'approved', label: 'Aprovados' },
                        { value: 'needs_revision', label: 'Revisão' },
                    ].map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterStatus(filter.value)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                filterStatus === filter.value
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                            }`}
                        >
                            <Filter className="h-3.5 w-3.5" strokeWidth={1.5} />
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" strokeWidth={1.5} />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && submissions.length === 0 && (
                <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50">
                            <ClipboardCheck className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhum exercício para corrigir</h3>
                    <p className="text-gray-400">Os exercícios enviados pelos alunos aparecerão aqui</p>
                </div>
            )}

            {/* Submissions List */}
            {!isLoading && filteredSubmissions.length > 0 && (
                <div className="space-y-3">
                    {filteredSubmissions.map((submission: ExerciseSubmissionWithDetails) => (
                        <div
                            key={submission.id}
                            className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-5 hover:border-gray-700 transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {/* Aluno */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10">
                                            <User className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                {submission.student?.name || 'Aluno'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {submission.student?.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Exercício */}
                                    <div className="flex items-start gap-2 mb-2">
                                        <BookOpen className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                                        <div>
                                            <p className="text-sm text-gray-300">
                                                {submission.content?.title || 'Exercício'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {submission.content?.lesson?.title}
                                                {submission.content?.lesson?.module && (
                                                    <> • {submission.content.lesson.module.name}</>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Data */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        Enviado em {formatDate(submission.created_at)}
                                    </div>

                                    {/* Nota (se já corrigido) */}
                                    {submission.grade !== null && (
                                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-800 text-sm">
                                            <span className="text-gray-400">Nota:</span>
                                            <span className="font-bold text-white">{submission.grade.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    {getStatusBadge(submission.status)}
                                    <button
                                        onClick={() => openReviewModal(submission)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
                                    >
                                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                                        {submission.status === 'pending' ? 'Corrigir' : 'Ver'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {!isLoading && submissions.length > 0 && filteredSubmissions.length === 0 && (
                <div className="text-center py-12">
                    <Search className="h-8 w-8 text-gray-500 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhuma submissão encontrada com os filtros aplicados</p>
                </div>
            )}

            {/* Review Modal */}
            {selectedSubmission && (
                <SubmissionReviewModal
                    submission={selectedSubmission}
                    isOpen={isReviewModalOpen}
                    onClose={() => {
                        setIsReviewModalOpen(false);
                        setSelectedSubmission(null);
                    }}
                    onReview={handleReview}
                />
            )}
        </div>
    );
}