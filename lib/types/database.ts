// lib/types/database.ts

// ============================================
// ENUMS / UNION TYPES
// ============================================

export type UserRole = 'admin' | 'student';
export type UserStatus = 'pending' | 'active' | 'suspended';

export type ModuleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type LessonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type LessonType = 'VIDEO' | 'ARTICLE' | 'EXERCISE' | 'QUIZ';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'PIX' | 'CASH' | 'TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'OTHER';

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

export type TaskStatus = 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED' | 'RETURNED';
export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'RETURNED';

// ============================================
// USUÁRIOS
// ============================================

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar_url?: string | null;
    phone?: string | null;
    status: UserStatus;
    invite_token?: string | null;
    invite_expires_at?: string | null;
    created_at: string;
    updated_at?: string | null;
}

export interface UserFormData {
    name: string;
    email: string;
    phone?: string;
}

// ============================================
// 🆕 TRILHAS (v20.0)
// ============================================

export interface Track {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    color: string;
    icon: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TrackWithStats extends Track {
    phases_count: number;
    modules_count: number;
    lessons_count: number;
    total_hours: number;
}

// 🆕 Para área do aluno
export interface StudentTrack extends Track {
    phases_count?: number;
    modules_count?: number;
    lessons_count?: number;
    completed_lessons?: number;
    progress_percentage?: number;
    phases?: StudentPhase[];
}

// ============================================
// 🆕 FASES (v20.0)
// ============================================

export interface Phase {
    id: string;
    track_id: string;
    name: string;
    number: number;
    description?: string | null;
    objectives?: string[] | null;
    estimated_hours?: number | null;
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Relacionamentos
    track?: Track;
}

export interface PhaseWithStats extends Phase {
    modules_count: number;
    lessons_count: number;
    contents_count: number;
}

export interface PhaseWithTrack extends Phase {
    track: Track;
}

export interface PhaseFormData {
    track_id: string;
    name: string;
    number: number;
    description?: string;
    objectives?: string[];
    estimated_hours?: number;
    order_index?: number;
    is_active?: boolean;
}

// 🆕 Para área do aluno
export interface StudentPhase extends Phase {
    modules_count?: number;
    lessons_count?: number;
    completed_lessons?: number;
    progress_percentage?: number;
    is_locked?: boolean; // 🆕 Para progressão linear
    modules?: StudentModule[];
}

// ============================================
// MÓDULOS (ATUALIZADO v20.0)
// ============================================

export interface Module {
    id: string;
    phase_id: string | null;           // 🆕 v20.0 - Referência à fase
    course_id?: string | null;         // ⚠️ DEPRECATED - manter temporariamente
    name: string;
    description?: string | null;
    order_index: number;
    status: ModuleStatus;
    created_at: string;
    updated_at: string;
    // Relacionamentos
    phase?: Phase;
    // Campos calculados
    _count?: {
        lessons?: number;
        materials?: number;
    };
}

export interface ModuleWithPhase extends Module {
    phase: Phase & {
        track: Track;
    };
}

export interface ModuleFormData {
    phase_id: string;                  // 🆕 v20.0 - Obrigatório
    name: string;
    description?: string;
    order_index?: number;
    status?: ModuleStatus;
}

// 🆕 Para área do aluno
export interface StudentModule extends Module {
    lessons_count?: number;
    completed_lessons?: number;
    progress_percentage?: number;
    is_locked?: boolean;              // 🆕 Para progressão linear
    lessons?: StudentLesson[];
}

// ============================================
// AULAS (LESSONS)
// ============================================

export interface QuizQuestion {
    id: string;
    question: string;
    options: {
        id: string;
        text: string;
        correct: boolean;
    }[];
}

export interface Lesson {
    id: string;
    module_id: string;
    title: string;
    description?: string | null;
    type: LessonType;
    youtube_id?: string | null;
    duration?: string | null;
    content?: string | null;
    quiz_data?: QuizQuestion[] | null;
    order_index: number;
    status: LessonStatus;
    views_count: number;
    total_contents?: number;
    created_at: string;
    updated_at: string;
    // Relacionamentos
    module?: Module;
}

export interface LessonFormData {
    module_id: string;
    title: string;
    description?: string;
    type: LessonType;
    youtube_id?: string;
    duration?: string;
    content?: string;
    quiz_data?: QuizQuestion[];
    order_index?: number;
    status?: LessonStatus;
}

export interface StudentLesson extends Lesson {
    progress?: LessonProgress | null;
    is_completed?: boolean;
}

// ============================================
// PROGRESSO DO ALUNO
// ============================================

export interface LessonProgress {
    id: string;
    student_id: string;
    lesson_id: string;
    completed: boolean;
    completed_at?: string | null;
    quiz_score?: number | null;
    quiz_total?: number | null;
    quiz_answers?: Record<string, string> | null;
    quiz_completed_at?: string | null;
    created_at: string;
    updated_at: string;
    lesson?: Lesson;
    student?: User;
}

export interface LessonProgressFormData {
    student_id: string;
    lesson_id: string;
    completed?: boolean;
    quiz_score?: number;
    quiz_total?: number;
    quiz_answers?: Record<string, string>;
}

// ============================================
// 🆕 MATRÍCULAS (ATUALIZADO v20.0)
// ============================================

export interface Enrollment {
    id: string;
    student_id: string;
    track_id: string;                  // 🆕 v20.0 - Era course_id
    enrollment_date: string;
    status: EnrollmentStatus;
    grade?: number | null;
    completed_at?: string | null;
    created_at: string;
    updated_at: string;
    // Relacionamentos
    student?: User;
    track?: Track;                     // 🆕 v20.0 - Era course
}

// ============================================
// PAGAMENTOS
// ============================================

export interface Payment {
    id: string;
    student_id: string;
    description: string;
    amount: number;
    due_date: string;
    paid_date: string | null;
    status: PaymentStatus;
    payment_method: PaymentMethod | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaymentWithStudent extends Omit<Payment, 'student'> {
    student: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export interface PaymentFormData {
    student_id: string;
    description: string;
    amount: number;
    due_date: string;
    paid_date?: string | null;
    status?: PaymentStatus;
    payment_method?: PaymentMethod | null;
    notes?: string | null;
}

export interface PaymentStats {
    total_pending: number;
    total_paid: number;
    total_overdue: number;
    count_pending: number;
    count_paid: number;
    count_overdue: number;
}

// ============================================
// MATERIAIS, TAREFAS, Q&A
// ============================================

export interface Material {
    id: string;
    name: string;
    description: string;
    category: MaterialCategory;
    filename: string;
    file_size?: number | null;
    content_type?: string | null;
    user_id: string;
    lesson_id?: string | null;
    upload_date: string;
    downloads: number;
    created_at: string;
    updated_at: string;
    uploaded_by?: User;
}

export interface Task {
    id: string;
    title: string;
    name: string;
    description: string;
    deadline: string;
    status: TaskStatus;
    module_id?: string | null;         // 🆕 v20.0 - Era course_id
    created_by?: string | null;
    created_at: string;
    updated_at: string;
    creator?: User;
    module?: Module;
}

export interface TaskFormData {
    title: string;
    name: string;
    description: string;
    deadline: string;
    module_id?: string;
}

export interface TaskSubmission {
    id: string;
    task_id: string;
    student_id: string;
    content?: string | null;
    file_url?: string | null;
    submitted_at: string;
    grade?: number | null;
    feedback?: string | null;
    graded_by?: string | null;
    graded_at?: string | null;
    status: SubmissionStatus;
    created_at: string;
    updated_at: string;
    task?: Task;
    student?: User;
    grader?: User;
}

export interface Question {
    id: string;
    title: string;
    content: string;
    user_id: string;
    answer_count: number;
    created_at: string;
    updated_at: string;
    author?: User;
    answers?: Answer[];
}

export interface Answer {
    id: string;
    content: string;
    user_id: string;
    question_id: string;
    is_accepted: boolean;
    created_at: string;
    updated_at: string;
    author?: User;
    question?: Question;
}

// ============================================
// 🆕 ANOTAÇÕES DO ALUNO (ATUALIZADO v20.0)
// ============================================

export interface StudentNote {
    id: string;
    student_id: string;
    lesson_id: string;
    module_id: string;
    track_id: string;                  // 🆕 v20.0 - Era course_id
    content: string;
    created_at: string;
    updated_at: string;
}

// ============================================
// TIPO DO DATABASE (para Supabase client tipado)
// ============================================

export type Database = {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, 'created_at' | 'updated_at'> & {
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Omit<User, 'id'>>;
            };
            tracks: {
                Row: Track;
                Insert: Omit<Track, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Track, 'id'>>;
            };
            phases: {
                Row: Phase;
                Insert: Omit<Phase, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Phase, 'id'>>;
            };
            modules: {
                Row: Module;
                Insert: Omit<Module, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Module, 'id'>>;
            };
            lessons: {
                Row: Lesson;
                Insert: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Lesson, 'id'>>;
            };
            enrollments: {
                Row: Enrollment;
                Insert: Omit<Enrollment, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Enrollment, 'id'>>;
            };
            payments: {
                Row: Payment;
                Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Payment, 'id'>>;
            };
            materials: {
                Row: Material;
                Insert: Omit<Material, 'id' | 'created_at' | 'updated_at' | 'downloads'>;
                Update: Partial<Omit<Material, 'id'>>;
            };
            tasks: {
                Row: Task;
                Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Task, 'id'>>;
            };
            task_submissions: {
                Row: TaskSubmission;
                Insert: Omit<TaskSubmission, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<TaskSubmission, 'id'>>;
            };
            questions: {
                Row: Question;
                Insert: Omit<Question, 'id' | 'created_at' | 'updated_at' | 'answer_count'>;
                Update: Partial<Omit<Question, 'id'>>;
            };
            answers: {
                Row: Answer;
                Insert: Omit<Answer, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Answer, 'id'>>;
            };
            student_notes: {
                Row: StudentNote;
                Insert: Omit<StudentNote, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<StudentNote, 'id'>>;
            };
        };
    };
};