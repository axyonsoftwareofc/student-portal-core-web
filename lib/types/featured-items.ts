// lib/types/featured-items.ts

import type { AnnouncementTarget } from '@/lib/types/announcements';

// Exercício existente (aula) ou tarefa avulsa
export type FeaturedKind = 'exercise' | 'task';

export type FeaturedSubmissionStatus = 'SUBMITTED' | 'GRADED' | 'RETURNED';

export interface FeaturedItem {
    id: string;
    kind: FeaturedKind;
    lesson_id: string | null;
    title: string | null;
    description: string | null;
    deadline: string | null;
    target: AnnouncementTarget;
    target_id: string | null;
    expires_at: string | null;
    is_active: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface FeaturedItemWithLesson extends FeaturedItem {
    lesson: {
        id: string;
        title: string;
        module_id: string;
    } | null;
}

export interface FeaturedItemSubmission {
    id: string;
    featured_item_id: string;
    student_id: string;
    content: string | null;
    link_url: string | null;
    submitted_at: string;
    status: FeaturedSubmissionStatus;
    grade: number | null;
    feedback: string | null;
    graded_by: string | null;
    graded_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface FeaturedItemSubmissionWithStudent extends FeaturedItemSubmission {
    student: {
        id: string;
        name: string;
        email: string;
    } | null;
}

// Dados do formulário do admin
export interface CreateFeaturedItemData {
    kind: FeaturedKind;
    lesson_id?: string | null;
    title?: string | null;
    description?: string | null;
    deadline?: string | null;
    target: AnnouncementTarget;
    target_id?: string | null;
    expires_at?: string | null;
}

export interface GradeSubmissionData {
    status: 'GRADED' | 'RETURNED';
    grade: number | null;
    feedback: string;
}

// Item já resolvido para o dashboard do aluno
export interface StudentFeaturedItem {
    id: string;
    kind: FeaturedKind;
    title: string;
    description: string | null;
    deadline: string | null;
    created_at: string;
    href: string | null;
    needsRevision: boolean;
    feedback: string | null;
}

// Opção do seletor de aulas com exercício
export interface LessonOption {
    id: string;
    label: string;
}
