'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pin, ClipboardCheck, ClipboardList, Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStudentFeaturedItems } from '@/hooks/useStudentFeaturedItems';
import { formatDeadline, getDeadlineState } from '@/lib/featured-items';
import type { StudentFeaturedItem } from '@/lib/types/featured-items';
import { FeaturedTaskSubmitDialog } from './FeaturedTaskSubmitDialog';

const VISIBLE_LIMIT = 3;

interface DashboardFeaturedProps {
    userId: string | null;
}

export function DashboardFeatured({ userId }: DashboardFeaturedProps) {
    const { items, isLoading, submitTask } = useStudentFeaturedItems(userId);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [submittingItem, setSubmittingItem] = useState<StudentFeaturedItem | null>(null);

    if (isLoading || items.length === 0) {
        return null;
    }

    const shown = expanded ? items : items.slice(0, VISIBLE_LIMIT);
    const hiddenCount = items.length - VISIBLE_LIMIT;

    return (
        <section className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-sky-300">
                <Pin className="h-4 w-4" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold uppercase tracking-wide">Em destaque</h2>
            </div>

            <div className="space-y-3">
                {shown.map((item: StudentFeaturedItem) => (
                    <FeaturedCard key={item.id} item={item} onSubmit={() => setSubmittingItem(item)} />
                ))}
            </div>

            {hiddenCount > 0 && (
                <button
                    type="button"
                    onClick={() => setExpanded((prev: boolean) => !prev)}
                    className="inline-flex items-center gap-1 text-sm text-sky-300 hover:text-sky-200 transition-colors"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-4 w-4" /> Mostrar menos
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4" /> Ver todos ({items.length})
                        </>
                    )}
                </button>
            )}

            <FeaturedTaskSubmitDialog
                item={submittingItem}
                onClose={() => setSubmittingItem(null)}
                onSubmit={submitTask}
            />
        </section>
    );
}

interface FeaturedCardProps {
    item: StudentFeaturedItem;
    onSubmit: () => void;
}

function FeaturedCard({ item, onSubmit }: FeaturedCardProps) {
    const isTask = item.kind === 'task';
    const Icon = isTask ? ClipboardList : ClipboardCheck;
    const deadlineState = getDeadlineState(item.deadline);

    return (
        <div className="rounded-lg bg-gray-900/60 border border-gray-800 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 flex-shrink-0">
                        <Icon className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <p className="font-medium text-white break-words">{item.title}</p>
                        {item.description && (
                            <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                        )}
                        {item.deadline && (
                            <p
                                className={cn(
                                    'inline-flex items-center gap-1 text-xs',
                                    deadlineState === 'overdue' && 'text-rose-400',
                                    deadlineState === 'soon' && 'text-amber-400',
                                    (deadlineState === 'ok' || deadlineState === 'none') && 'text-gray-500'
                                )}
                            >
                                <Clock className="h-3 w-3" strokeWidth={1.5} />
                                {deadlineState === 'overdue' ? 'Atrasado — era para ' : 'Até '}
                                {formatDeadline(item.deadline)}
                            </p>
                        )}
                        {item.needsRevision && (
                            <p className="inline-flex items-start gap-1 text-xs text-amber-400">
                                <RotateCcw className="h-3 w-3 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                                <span>
                                    Revisão solicitada{item.feedback ? `: ${item.feedback}` : ''}
                                </span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="sm:flex-shrink-0">
                    {isTask ? (
                        <Button onClick={onSubmit} className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500">
                            {item.needsRevision ? 'Reenviar' : 'Entregar'}
                        </Button>
                    ) : (
                        item.href && (
                            <Link
                                href={item.href}
                                className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                            >
                                Ir para o exercício
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
