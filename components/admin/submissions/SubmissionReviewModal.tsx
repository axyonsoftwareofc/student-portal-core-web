// components/admin/submissions/SubmissionReviewModal.tsx
'use client';

import { useState } from 'react';
import {
    X,
    User,
    BookOpen,
    Calendar,
    ExternalLink,
    Code,
    FileText,
    Link as LinkIcon,
    Star,
    MessageSquare,
    CheckCircle,
    RotateCcw,
    Loader2,
    Clock,
} from 'lucide-react';
import type { ExerciseSubmissionWithDetails, SubmissionStatus } from '@/lib/types/exercise-submissions';

interface SubmissionReviewModalProps {
    submission: ExerciseSubmissionWithDetails;
    isOpen: boolean;
    onClose: () => void;
    onReview: (
        submissionId: string,
        data: { grade?: number; feedback?: string; status: SubmissionStatus }
    ) => Promise<{ success: boolean; error?: string }>;
}

export default function SubmissionReviewModal({
                                                  submission,
                                                  isOpen,
                                                  onClose,
                                                  onReview,
                                              }: SubmissionReviewModalProps) {
    const [grade, setGrade] = useState<string>(
        submission.grade !== null ? submission.grade.toString() : ''
    );
    const [feedback, setFeedback] = useState<string>(submission.feedback || '');
    const [status, setStatus] = useState<SubmissionStatus>(submission.status);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    if (!isOpen) return null;

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSubmit = async (): Promise<void> => {
        setError('');
        setIsSubmitting(true);

        const gradeNumber = grade ? parseFloat(grade) : undefined;

        if (gradeNumber !== undefined && (gradeNumber < 0 || gradeNumber > 10)) {
            setError('A nota deve estar entre 0 e 10');
            setIsSubmitting(false);
            return;
        }

        const result = await onReview(submission.id, {
            grade: gradeNumber,
            feedback: feedback.trim() || undefined,
            status,
        });

        setIsSubmitting(false);

        if (!result.success) {
            setError(result.error || 'Erro ao salvar correção');
        }
    };

    const hasAnswer = submission.answer_code || submission.answer_text || submission.answer_url;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
                    <h2 className="text-lg font-bold text-white">Correção de Exercício</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Info do Aluno e Exercício */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
                                    <User className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Aluno</p>
                                    <p className="font-medium text-white">{submission.student?.name}</p>
                                    <p className="text-xs text-gray-400">{submission.student?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                                    <BookOpen className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Exercício</p>
                                    <p className="font-medium text-white">{submission.content?.title}</p>
                                    <p className="text-xs text-gray-400">
                                        {submission.content?.lesson?.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data de envio */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" strokeWidth={1.5} />
                        Enviado em {formatDate(submission.created_at)}
                        {submission.reviewed_at && (
                            <>
                                <span className="mx-2">•</span>
                                <Clock className="h-4 w-4" strokeWidth={1.5} />
                                Corrigido em {formatDate(submission.reviewed_at)}
                            </>
                        )}
                    </div>

                    {/* Resposta do Aluno */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                            Resposta do Aluno
                        </h3>

                        {!hasAnswer ? (
                            <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 p-6 text-center">
                                <p className="text-gray-500">Nenhuma resposta enviada</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Código */}
                                {submission.answer_code && (
                                    <div className="rounded-lg border border-gray-800/50 bg-gray-950 overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border-b border-gray-800/50">
                                            <Code className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                                            <span className="text-sm text-gray-400">Código</span>
                                        </div>
                                        <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto max-h-64 overflow-y-auto">
                                            {submission.answer_code}
                                        </pre>
                                    </div>
                                )}

                                {/* Texto */}
                                {submission.answer_text && (
                                    <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border-b border-gray-800/50">
                                            <FileText className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                                            <span className="text-sm text-gray-400">Texto</span>
                                        </div>
                                        <div className="p-4 text-sm text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                            {submission.answer_text}
                                        </div>
                                    </div>
                                )}

                                {/* Link */}
                                {submission.answer_url && (
                                    <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <LinkIcon className="h-4 w-4 text-violet-400" strokeWidth={1.5} />
                                            <span className="text-sm text-gray-400">Link</span>
                                        </div>
                                        <a
                                            href={submission.answer_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 hover:underline text-sm"
                                        >
                                            {submission.answer_url}
                                            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Formulário de Correção */}
                    <div className="border-t border-gray-800/50 pt-6">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                            Correção
                        </h3>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Nota */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    <Star className="h-4 w-4 inline mr-1 text-amber-400" strokeWidth={1.5} />
                                    Nota (0-10)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={grade}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGrade(e.target.value)}
                                    className="w-full sm:w-32 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none transition-colors"
                                    placeholder="Ex: 8.5"
                                />
                            </div>

                            {/* Feedback */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    <MessageSquare className="h-4 w-4 inline mr-1 text-sky-400" strokeWidth={1.5} />
                                    Feedback para o aluno
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none transition-colors resize-none"
                                    placeholder="Escreva um feedback construtivo para o aluno..."
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status da Correção
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStatus('approved')}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                            status === 'approved'
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                                : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                                        }`}
                                    >
                                        <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                        Aprovado
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('needs_revision')}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                            status === 'needs_revision'
                                                ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                                                : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                                        }`}
                                    >
                                        <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                                        Precisa Revisão
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('reviewed')}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                            status === 'reviewed'
                                                ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                                                : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                                        }`}
                                    >
                                        <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                        Corrigido
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800/50">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-500 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                        ) : (
                            <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                        )}
                        Salvar Correção
                    </button>
                </div>
            </div>
        </div>
    );
}