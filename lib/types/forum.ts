// lib/types/forum.ts

// Status da pergunta
export type QuestionStatus = 'open' | 'answered' | 'closed';

// Pergunta do fórum
export interface ForumQuestion {
    id: string;
    user_id: string;
    lesson_id: string | null;
    module_id: string | null;
    title: string;
    content: string;
    status: QuestionStatus;
    is_pinned: boolean;
    views_count: number;
    answers_count: number;
    created_at: string;
    updated_at: string;
}

// Pergunta com dados extras (da view)
export interface ForumQuestionWithDetails extends ForumQuestion {
    user_name: string;
    user_avatar_url: string | null;
    lesson_title: string | null;
    module_name: string | null;
    best_answer_id: string | null;
    last_activity_at: string;
}

// Resposta do fórum
export interface ForumAnswer {
    id: string;
    question_id: string;
    user_id: string;
    content: string;
    is_best_answer: boolean;
    is_from_teacher: boolean;
    upvotes_count: number;
    created_at: string;
    updated_at: string;
}

// Resposta com dados do usuário
export interface ForumAnswerWithUser extends ForumAnswer {
    user_name: string;
    user_avatar_url: string | null;
    user_role: 'admin' | 'student';
}

// Notificação do fórum
export interface ForumNotification {
    id: string;
    user_id: string;
    question_id: string;
    answer_id: string | null;
    type: 'new_answer' | 'best_answer' | 'mention';
    message: string;
    is_read: boolean;
    created_at: string;
}

// Dados para criar pergunta
export interface CreateQuestionData {
    title: string;
    content: string;
    lesson_id?: string | null;
    module_id?: string | null;
}

// Dados para criar resposta
export interface CreateAnswerData {
    question_id: string;
    content: string;
}

// Filtros do fórum
export interface ForumFilters {
    status?: QuestionStatus | 'all';
    module_id?: string | null;
    lesson_id?: string | null;
    search?: string;
    onlyMine?: boolean;
}