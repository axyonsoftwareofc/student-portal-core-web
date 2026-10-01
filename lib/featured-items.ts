// lib/featured-items.ts
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CreateFeaturedItemData } from '@/lib/types/featured-items';

export type DeadlineState = 'none' | 'ok' | 'soon' | 'overdue';

const SOON_MS = 48 * 60 * 60 * 1000;

// Atrasado: prazo passou. Próximo: faltam 48h ou menos.
export function getDeadlineState(deadline: string | null, now: Date = new Date()): DeadlineState {
    if (!deadline) return 'none';
    const diff = new Date(deadline).getTime() - now.getTime();
    if (diff < 0) return 'overdue';
    if (diff <= SOON_MS) return 'soon';
    return 'ok';
}

export function formatDeadline(deadline: string): string {
    return format(new Date(deadline), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

// Prazo mais próximo primeiro; sem prazo vão para o fim; empate: mais recente primeiro
export function compareByDeadline(
    a: { deadline: string | null; created_at: string },
    b: { deadline: string | null; created_at: string }
): number {
    if (a.deadline && b.deadline) {
        const diff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (diff !== 0) return diff;
    } else if (a.deadline) {
        return -1;
    } else if (b.deadline) {
        return 1;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

interface DeliveryState {
    delivered: boolean;
    needsRevision: boolean;
}

// Exercício entregue = todos os conteúdos EXERCISE da aula têm submissão.
// Algum em needs_revision faz o item voltar. Aula sem conteúdos EXERCISE nunca conta como entregue.
export function isExerciseDelivered(
    contentIds: string[],
    statusByContent: Map<string, string>
): DeliveryState {
    if (contentIds.length === 0) return { delivered: false, needsRevision: false };
    if (contentIds.some((id: string) => statusByContent.get(id) === 'needs_revision')) {
        return { delivered: false, needsRevision: true };
    }
    return {
        delivered: contentIds.every((id: string) => statusByContent.has(id)),
        needsRevision: false,
    };
}

// Tarefa avulsa: qualquer entrega conta, exceto devolvida (RETURNED)
export function isTaskDelivered(status: string | undefined): DeliveryState {
    if (!status) return { delivered: false, needsRevision: false };
    if (status === 'RETURNED') return { delivered: false, needsRevision: true };
    return { delivered: true, needsRevision: false };
}

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

// ISO (UTC) -> valor de <input type="datetime-local"> no fuso local
export function toDatetimeLocal(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function datetimeLocalToIso(value: string): string {
    return new Date(value).toISOString();
}

// ISO (UTC) -> valor de <input type="date"> no fuso local
export function toDateInput(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Expiração vale até o fim do dia escolhido
export function endOfDayIso(date: string): string {
    return new Date(`${date}T23:59:59`).toISOString();
}

// Normaliza o formulário para as constraints da tabela
export function toItemPayload(data: CreateFeaturedItemData) {
    const isExercise = data.kind === 'exercise';
    return {
        kind: data.kind,
        lesson_id: isExercise ? data.lesson_id ?? null : null,
        title: isExercise ? null : data.title?.trim() ?? null,
        description: isExercise ? null : data.description?.trim() ?? '',
        deadline: data.deadline || null,
        target: data.target,
        target_id: data.target === 'all' ? null : data.target_id ?? null,
        expires_at: data.expires_at || null,
    };
}
