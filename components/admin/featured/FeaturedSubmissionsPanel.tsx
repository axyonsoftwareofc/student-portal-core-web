// components/admin/featured/FeaturedSubmissionsPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { Loader2, ExternalLink, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import { formatDeadline } from '@/lib/featured-items';
import type {
    FeaturedItemSubmissionWithStudent,
    FeaturedItemWithLesson,
    FeaturedSubmissionStatus,
    GradeSubmissionData,
} from '@/lib/types/featured-items';

interface FeaturedSubmissionsPanelProps {
    item: FeaturedItemWithLesson | null;
    onClose: () => void;
    fetchSubmissions: (itemId: string) => Promise<FeaturedItemSubmissionWithStudent[]>;
    gradeSubmission: (id: string, data: GradeSubmissionData) => Promise<{ success: boolean; error?: string }>;
}

const STATUS_LABEL: Record<FeaturedSubmissionStatus, { label: string; className: string }> = {
    SUBMITTED: { label: 'Aguardando correção', className: 'bg-amber-500/10 text-amber-400' },
    GRADED: { label: 'Corrigida', className: 'bg-emerald-500/10 text-emerald-400' },
    RETURNED: { label: 'Devolvida', className: 'bg-rose-500/10 text-rose-400' },
};

export function FeaturedSubmissionsPanel({
                                             item,
                                             onClose,
                                             fetchSubmissions,
                                             gradeSubmission,
                                         }: FeaturedSubmissionsPanelProps) {
    return (
        <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {item && (
                    <PanelContent
                        key={item.id}
                        item={item}
                        fetchSubmissions={fetchSubmissions}
                        gradeSubmission={gradeSubmission}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

interface PanelContentProps {
    item: FeaturedItemWithLesson;
    fetchSubmissions: FeaturedSubmissionsPanelProps['fetchSubmissions'];
    gradeSubmission: FeaturedSubmissionsPanelProps['gradeSubmission'];
}

function PanelContent({ item, fetchSubmissions, gradeSubmission }: PanelContentProps) {
    const [submissions, setSubmissions] = useState<FeaturedItemSubmissionWithStudent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        try {
            setError(null);
            setSubmissions(await fetchSubmissions(item.id));
        } catch (err) {
            console.error('[FeaturedSubmissionsPanel] Erro ao carregar entregas:', err);
            setError('Erro ao carregar as entregas');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id]);

    return (
        <>
            <DialogHeader>
                <DialogTitle>Entregas — {item.title}</DialogTitle>
            </DialogHeader>

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                </div>
            )}

            {error && <p className="text-center text-rose-400 py-6">{error}</p>}

            {!isLoading && !error && submissions.length === 0 && (
                <p className="text-center text-gray-400 py-10">Nenhuma entrega ainda.</p>
            )}

            <div className="space-y-4">
                {submissions.map((submission: FeaturedItemSubmissionWithStudent) => (
                    <SubmissionRow
                        key={submission.id}
                        submission={submission}
                        gradeSubmission={gradeSubmission}
                        onSaved={load}
                    />
                ))}
            </div>
        </>
    );
}

interface SubmissionRowProps {
    submission: FeaturedItemSubmissionWithStudent;
    gradeSubmission: FeaturedSubmissionsPanelProps['gradeSubmission'];
    onSaved: () => Promise<void>;
}

function SubmissionRow({ submission, gradeSubmission, onSaved }: SubmissionRowProps) {
    const [grade, setGrade] = useState<string>(submission.grade?.toString() ?? '');
    const [feedback, setFeedback] = useState<string>(submission.feedback ?? '');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const status = STATUS_LABEL[submission.status];

    const save = async (nextStatus: 'GRADED' | 'RETURNED') => {
        const parsedGrade = grade.trim() === '' ? null : Number(grade.replace(',', '.'));

        if (parsedGrade !== null && (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 10)) {
            showToast('error', 'A nota deve ser um número de 0 a 10');
            return;
        }

        if (nextStatus === 'RETURNED' && !feedback.trim()) {
            showToast('error', 'Explique no feedback o que o aluno precisa revisar');
            return;
        }

        setIsSaving(true);
        const result = await gradeSubmission(submission.id, {
            status: nextStatus,
            grade: parsedGrade,
            feedback,
        });
        setIsSaving(false);

        if (result.success) {
            showToast('success', nextStatus === 'GRADED' ? 'Correção salva!' : 'Entrega devolvida para revisão');
            await onSaved();
        } else {
            showToast('error', result.error || 'Erro ao salvar correção');
        }
    };

    return (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-medium text-white truncate">{submission.student?.name ?? 'Aluno removido'}</p>
                    <p className="text-xs text-gray-500">
                        Enviado em {formatDeadline(submission.submitted_at)}
                    </p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', status.className)}>
                    {status.label}
                </span>
            </div>

            {submission.content && (
                <p className="text-sm text-gray-300 whitespace-pre-line break-words">{submission.content}</p>
            )}

            {submission.link_url && (
                <a
                    href={submission.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 break-all"
                >
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    {submission.link_url}
                </a>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nota (0-10)</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Feedback</label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button variant="outline" disabled={isSaving} onClick={() => save('RETURNED')}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Devolver para revisão
                </Button>
                <Button disabled={isSaving} onClick={() => save('GRADED')} className="bg-emerald-600 hover:bg-emerald-500">
                    <Check className="h-4 w-4 mr-2" />
                    Salvar correção
                </Button>
            </div>
        </div>
    );
}
