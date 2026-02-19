// lib/types/lesson-contents.ts

export type LessonContentType = 'VIDEO' | 'ARTICLE' | 'EXERCISE' | 'QUIZ' | 'MATERIAL';

export type MaterialCategory =
    | 'PDF'
    | 'VIDEO'
    | 'ARTICLE'
    | 'PRESENTATION'
    | 'DOCUMENT'
    | 'SPREADSHEET'
    | 'IMAGE'
    | 'AUDIO'
    | 'COMPRESSED'
    | 'LINK'
    | 'GITHUB'
    | 'OTHER';

export interface QuizOption {
    id: string;
    text: string;
    correct: boolean;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: QuizOption[];
}

export interface LessonContent {
    id: string;
    lesson_id: string;
    type: LessonContentType;
    title: string;
    description: string | null;
    youtube_id: string | null;
    duration: string | null;
    content: string | null;
    quiz_data: QuizQuestion[] | null;
    material_url: string | null;
    material_category: MaterialCategory | null;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface LessonContentFormData {
    type: LessonContentType;
    title: string;
    description?: string;
    youtube_id?: string;
    duration?: string;
    content?: string;
    quiz_data?: QuizQuestion[];
    material_url?: string;
    material_category?: MaterialCategory;
    order_index?: number;
}

export interface ContentProgress {
    id: string;
    student_id: string;
    content_id: string;
    completed: boolean;
    completed_at: string | null;
    quiz_score: number | null;
    quiz_total: number | null;
    quiz_answers: Record<string, string> | null;
    quiz_completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface LessonContentWithProgress extends LessonContent {
    progress?: ContentProgress;
    is_completed?: boolean;
}

export interface UseLessonContentsReturn {
    contents: LessonContent[];
    isLoading: boolean;
    error: string | null;
    createContent: (lessonId: string, data: LessonContentFormData) => Promise<{ success: boolean; error?: string; content?: LessonContent }>;
    updateContent: (contentId: string, data: Partial<LessonContentFormData>) => Promise<{ success: boolean; error?: string }>;
    deleteContent: (contentId: string) => Promise<{ success: boolean; error?: string }>;
    reorderContents: (lessonId: string, orderedIds: string[]) => Promise<{ success: boolean; error?: string }>;
    refetch: () => Promise<void>;
}