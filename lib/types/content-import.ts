// lib/types/content-import.ts

export interface ImportModule {
    name: string;
    phase?: number;
    order?: number;
    description?: string;
    create_if_not_exists: boolean;
}

export interface ImportLesson {
    title: string;
    order?: number;
    duration?: string;
    description?: string;
    create_if_not_exists: boolean;
}

export interface ImportBlock {
    title: string;
    order: number;
}

export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

export type ExerciseType =
    | 'ordering'
    | 'true_false'
    | 'fill_blank'
    | 'matching'
    | 'multiple_select'
    | 'code_completion'
    | 'drag_drop'
    | 'code'
    | 'text'
    | 'open';

export interface OrderingItem {
    id: string;
    text: string;
    correct_position: number;
}

export interface TrueFalseStatement {
    id: string;
    statement: string;
    correct: boolean;
    explanation: string;
}

export interface FillBlankItem {
    id: string;
    correct_answer: string;
    alternatives?: string[];
    hint?: string;
    case_sensitive?: boolean;
}

export interface FillBlankData {
    text_with_blanks: string;
    blanks: FillBlankItem[];
}

// NOVO: Matching
export interface MatchingPair {
    id: string;
    left: string;
    right: string;
}

export interface MatchingData {
    left_column_title?: string;
    right_column_title?: string;
    pairs: MatchingPair[];
}

// NOVO: Multiple Select
export interface MultipleSelectOption {
    id: string;
    text: string;
    correct: boolean;
    explanation?: string;
}

export interface MultipleSelectData {
    options: MultipleSelectOption[];
    min_selections?: number;
    max_selections?: number;
}

export interface ImportExerciseContent {
    type: 'EXERCISE';
    title: string;
    order: number;
    difficulty: ExerciseDifficulty;
    exercise_type: ExerciseType;
    content: string;
    answer: string;
    ordering_items?: OrderingItem[];
    true_false_statements?: TrueFalseStatement[];
    fill_blank_data?: FillBlankData;
    matching_data?: MatchingData;
    multiple_select_data?: MultipleSelectData;
    code_completion_data?: CodeCompletionData;
    drag_drop_data?: DragDropData;
}

export interface ImportQuizQuestion {
    question: string;
    options: string[];
    correct: number;
}

export interface ImportQuizContent {
    type: 'QUIZ';
    title: string;
    order: number;
    questions: ImportQuizQuestion[];
}

export interface ImportVideoContent {
    type: 'VIDEO';
    title: string;
    order: number;
    content: string;
    duration_minutes?: number;
    video_url?: string | null;
}

export interface ImportArticleContent {
    type: 'ARTICLE';
    title: string;
    order: number;
    content: string;
}

export type ImportContent =
    | ImportVideoContent
    | ImportArticleContent
    | ImportExerciseContent
    | ImportQuizContent;

export interface ImportPayload {
    module: ImportModule;
    lesson: ImportLesson;
    block: ImportBlock;
    contents: ImportContent[];
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    summary?: ImportSummary;
}

export interface ImportSummary {
    moduleName: string;
    lessonTitle: string;
    blockTitle: string;
    blockOrder: number;
    counts: {
        video: number;
        article: number;
        exercise: number;
        quiz: number;
        totalQuizQuestions: number;
    };
    moduleExists: boolean;
    lessonExists: boolean;
}

export type ImportStep = 'input' | 'preview' | 'importing' | 'success' | 'error';

export interface ImportResult {
    success: boolean;
    moduleId: string | null;
    lessonId: string | null;
    contentsCreated: number;
    moduleCreated: boolean;
    lessonCreated: boolean;
    errors: string[];
}

export interface InteractiveExerciseData {
    exercise_type: ExerciseType;
    difficulty: ExerciseDifficulty;
    instruction: string;
    answer_explanation: string;
    ordering_items?: OrderingItem[];
    true_false_statements?: TrueFalseStatement[];
    fill_blank_data?: FillBlankData;
    matching_data?: MatchingData;
    multiple_select_data?: MultipleSelectData;
    code_completion_data?: CodeCompletionData;
    drag_drop_data?: DragDropData;
}

// Code Completion (fill blank para código)
export interface CodeCompletionBlank {
    id: string;
    correct_answer: string;
    alternatives?: string[];
    hint?: string;
}

export interface CodeCompletionData {
    language: string;                    // "java", "python", etc.
    code_template: string;              // Código com {1}, {2} ou _____ para lacunas
    blanks: CodeCompletionBlank[];
}

// Drag and Drop
export interface DragDropItem {
    id: string;
    content: string;
}

export interface DragDropZone {
    id: string;
    label: string;
    correct_item_id: string;
}

export interface DragDropData {
    items: DragDropItem[];              // Itens que podem ser arrastados
    zones: DragDropZone[];              // Zonas onde soltar
    instruction_per_zone?: boolean;     // Se true, mostra label da zona
}