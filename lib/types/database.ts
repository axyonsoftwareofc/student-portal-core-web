// lib/types/database.ts

// ============================================
// ENUMS / UNION TYPES
// ============================================

export type UserRole = 'admin' | 'student';
export type UserStatus = 'pending' | 'active';

export type CourseStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED';

export type PaymentStatus = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO' | 'REEMBOLSADO';
export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_SLIP' | 'BANK_TRANSFER';

export type MaterialCategory = 'PDF' | 'VIDEO' | 'ARTICLE' | 'PRESENTATION' | 'DOCUMENT' | 'SPREADSHEET' | 'IMAGE' | 'AUDIO' | 'COMPRESSED' | 'OTHER';

export type TaskStatus = 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED' | 'RETURNED';
export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'RETURNED';

// ============================================
// INTERFACES DAS TABELAS
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

export interface Course {
    id: string;
    name: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    status: CourseStatus;
    created_at: string;
    updated_at: string;
}

export interface Enrollment {
    id: string;
    student_id: string;
    course_id: string;
    enrollment_date: string;
    status: EnrollmentStatus;
    grade?: number | null;
    completed_at?: string | null;
    created_at: string;
    updated_at: string;
    // Relacionamentos (quando usar JOIN)
    student?: User;
    course?: Course;
}

export interface Payment {
    id: string;
    student_id: string;
    amount: number;
    payment_date?: string | null;
    due_date: string;
    status: PaymentStatus;
    payment_method?: PaymentMethod | null;
    transaction_id?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    // Relacionamentos
    student?: User;
}

export interface Material {
    id: string;
    name: string;
    description: string;
    category: MaterialCategory;
    filename: string;
    file_size?: number | null;
    content_type?: string | null;
    user_id: string;
    course_id?: string | null;
    upload_date: string;
    downloads: number;
    created_at: string;
    updated_at: string;
    // Relacionamentos
    uploaded_by?: User;
    course?: Course;
}

export interface Task {
    id: string;
    title: string;
    name: string;
    description: string;
    deadline: string;
    status: TaskStatus;
    course_id: string;
    created_by?: string | null;
    created_at: string;
    updated_at: string;
    // Relacionamentos
    course?: Course;
    creator?: User;
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
    // Relacionamentos
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
    // Relacionamentos
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
    // Relacionamentos
    author?: User;
    question?: Question;
}

// ============================================
// TIPOS PARA FORMULÁRIOS (sem campos auto-gerados)
// ============================================

export interface UserFormData {
    name: string;
    email: string;
    phone?: string;
}

export interface CourseFormData {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    status?: CourseStatus;
}

export interface PaymentFormData {
    student_id: string;
    amount: number;
    due_date: string;
    status?: PaymentStatus;
    payment_method?: PaymentMethod;
    notes?: string;
}

export interface TaskFormData {
    title: string;
    name: string;
    description: string;
    deadline: string;
    course_id: string;
}

// ============================================
// MÓDULOS
// ============================================

export type ModuleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Module {
    id: string;
    course_id: string;
    name: string;
    description?: string | null;
    order_index: number;
    status: ModuleStatus;
    created_at: string;
    updated_at: string;
    // Relacionamentos (quando usar JOIN)
    course?: Course;
    // Campos calculados
    _count?: {
        materials?: number;
        enrollments?: number;
    };
}

export interface ModuleFormData {
    course_id: string;
    name: string;
    description?: string;
    order_index?: number;
    status?: ModuleStatus;
}

// ============================================
// AULAS (LESSONS)
// ============================================

export type LessonType = 'VIDEO' | 'ARTICLE' | 'EXERCISE' | 'QUIZ';
export type LessonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

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
    created_at: string;
    updated_at: string;
    // Relacionamentos (quando usar JOIN)
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
            courses: {
                Row: Course;
                Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Course, 'id'>>;
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
        };
    };
};