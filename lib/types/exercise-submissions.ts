// lib/types/exercise-submissions.ts

export type SubmissionStatus = 'pending' | 'reviewed' | 'approved' | 'needs_revision';

export interface ExerciseSubmission {
    id: string;
    content_id: string;
    student_id: string;
    answer_text: string | null;
    answer_code: string | null;
    answer_url: string | null;
    file_url: string | null;
    file_name: string | null;
    status: SubmissionStatus;
    grade: number | null;
    feedback: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ExerciseSubmissionWithDetails extends ExerciseSubmission {
    student?: {
        id: string;
        name: string;
        email: string;
    };
    content?: {
        id: string;
        title: string;
        lesson_id: string;
        lesson?: {
            id: string;
            title: string;
            module?: {
                id: string;
                name: string;
                course?: {
                    id: string;
                    name: string;
                };
            };
        };
    };
    reviewer?: {
        id: string;
        name: string;
    };
}

export interface SubmitExerciseDTO {
    content_id: string;
    student_id: string;
    answer_text?: string;
    answer_code?: string;
    answer_url?: string;
    file_url?: string;
    file_name?: string;
}

export interface ReviewExerciseDTO {
    grade?: number;
    feedback?: string;
    status: SubmissionStatus;
    reviewed_by: string;
}

export interface UseExerciseSubmissionsReturn {
    submissions: ExerciseSubmissionWithDetails[];
    isLoading: boolean;
    error: string | null;
    submitExercise: (data: SubmitExerciseDTO) => Promise<{ success: boolean; error?: string }>;
    updateSubmission: (id: string, data: Partial<SubmitExerciseDTO>) => Promise<{ success: boolean; error?: string }>;
    reviewSubmission: (id: string, data: ReviewExerciseDTO) => Promise<{ success: boolean; error?: string }>;
    getSubmissionByContent: (contentId: string, studentId: string) => Promise<ExerciseSubmission | null>;
    refetch: () => Promise<void>;
}