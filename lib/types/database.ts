// lib/types/database.ts
export type UserRole = 'admin' | 'student'
export type PaymentStatus = 'pending' | 'paid' | 'overdue'
export type SubmissionStatus = 'pending' | 'reviewed' | 'approved' | 'rejected'

export interface User {
    id: string
    email: string
    name: string
    role: UserRole
    avatar_url?: string | null
    phone?: string | null
    created_at: string
    updated_at?: string | null
}

export interface Course {
    id: string
    title: string
    description?: string | null
    icon?: string | null
    level?: string | null
    order?: number | null
    is_published: boolean
    created_at: string
}

export interface Payment {
    id: string
    user_id: string
    amount: number
    due_date: string
    paid_at?: string | null
    status: PaymentStatus
    month_reference: string
    notes?: string | null
    created_at: string
}

// Tipo genérico para o Database - mais flexível
export type Database = {
    public: {
        Tables: {
            [key: string]: {
                Row: Record<string, unknown>
                Insert: Record<string, unknown>
                Update: Record<string, unknown>
            }
        }
    }
}