// components/admin/featured/FeaturedItemCard.tsx
'use client';

import { ClipboardCheck, ClipboardList, Clock, Pencil, Trash2, Power, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TARGET_LABELS } from '@/lib/types/announcements';
import type { FeaturedItemWithLesson } from '@/lib/types/featured-items';
import { formatDeadline, getDeadlineState } from '@/lib/featured-items';

interface FeaturedItemCardProps {
    item: FeaturedItemWithLesson;
    targetName: string | null;
    onEdit: (item: FeaturedItemWithLesson) => void;
    onDelete: (id: string) => void;
    onToggleActive: (id: string, isActive: boolean) => void;
    onOpenSubmissions: (item: FeaturedItemWithLesson) => void;
}

export function FeaturedItemCard({
                                     item,
                                     targetName,
                                     onEdit,
                                     onDelete,
                                     onToggleActive,
                                     onOpenSubmissions,
                                 }: FeaturedItemCardProps) {
    const isTask = item.kind === 'task';
    const Icon = isTask ? ClipboardList : ClipboardCheck;
    const title = isTask ? item.title : item.lesson?.title ?? 'Aula removida';
    const deadlineState = getDeadlineState(item.deadline);
    const expired = !!item.expires_at && new Date(item.expires_at) < new Date();

    return (
        <div
            className={cn(
                'rounded-xl border p-4 bg-gray-900/50',
                item.is_active && !expired ? 'border-gray-800' : 'border-gray-800/60 opacity-70'
            )}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-sky-500/10 flex-shrink-0">
                        <Icon className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-white truncate">{title}</h3>
                            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                                {isTask ? 'Tarefa avulsa' : 'Exercício'}
                            </span>
                            {expired && (
                                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                                    Expirado
                                </span>
                            )}
                        </div>
                        {isTask && item.description && (
                            <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>
                                Para:{' '}
                                {item.target === 'all'
                                    ? TARGET_LABELS.all
                                    : targetName ?? 'alvo removido'}
                            </span>
                            {item.deadline && (
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-1',
                                        deadlineState === 'overdue' && 'text-rose-400',
                                        deadlineState === 'soon' && 'text-amber-400'
                                    )}
                                >
                                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                                    {formatDeadline(item.deadline)}
                                </span>
                            )}
                            {item.expires_at && (
                                <span>Expira em {formatDeadline(item.expires_at)}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                    {isTask && (
                        <Button variant="outline" onClick={() => onOpenSubmissions(item)}>
                            <Inbox className="h-4 w-4 mr-2" />
                            Entregas
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => onToggleActive(item.id, !item.is_active)}
                        title={item.is_active ? 'Desativar' : 'Ativar'}
                    >
                        <Power className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => onEdit(item)} title="Editar">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => onDelete(item.id)} title="Excluir">
                        <Trash2 className="h-4 w-4 text-rose-400" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
