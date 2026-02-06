// hooks/usePayments.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// Tipos
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'PIX' | 'CASH' | 'TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'OTHER';

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

export interface PaymentWithStudent extends Payment {
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
    status: PaymentStatus;
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

export function usePayments(studentId?: string) {
    const [payments, setPayments] = useState<PaymentWithStudent[]>([]);
    const [stats, setStats] = useState<PaymentStats>({
        total_pending: 0,
        total_paid: 0,
        total_overdue: 0,
        count_pending: 0,
        count_paid: 0,
        count_overdue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    // Buscar pagamentos
    const fetchPayments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('payments')
                .select(`
          *,
          student:users!student_id (
            id,
            name,
            email
          )
        `)
                .order('due_date', { ascending: false });

            if (studentId) {
                query = query.eq('student_id', studentId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            // Atualizar status de pagamentos atrasados automaticamente
            const today = new Date().toISOString().split('T')[0];
            const updatedPayments = (data || []).map((payment: PaymentWithStudent) => {
                if (payment.status === 'PENDING' && payment.due_date < today) {
                    return { ...payment, status: 'OVERDUE' as PaymentStatus };
                }
                return payment;
            });

            setPayments(updatedPayments);

            // Calcular estatísticas
            const newStats: PaymentStats = {
                total_pending: 0,
                total_paid: 0,
                total_overdue: 0,
                count_pending: 0,
                count_paid: 0,
                count_overdue: 0,
            };

            updatedPayments.forEach((payment: PaymentWithStudent) => {
                const amount = Number(payment.amount) || 0;
                switch (payment.status) {
                    case 'PENDING':
                        newStats.total_pending += amount;
                        newStats.count_pending++;
                        break;
                    case 'PAID':
                        newStats.total_paid += amount;
                        newStats.count_paid++;
                        break;
                    case 'OVERDUE':
                        newStats.total_overdue += amount;
                        newStats.count_overdue++;
                        break;
                }
            });

            setStats(newStats);

        } catch (err) {
            console.error('Erro ao buscar pagamentos:', err);
            setError('Erro ao carregar pagamentos');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, studentId]);

    // Criar pagamento
    const createPayment = async (formData: PaymentFormData): Promise<boolean> => {
        try {
            const { error: insertError } = await supabase
                .from('payments')
                .insert({
                    student_id: formData.student_id,
                    description: formData.description.trim(),
                    amount: formData.amount,
                    due_date: formData.due_date,
                    paid_date: formData.paid_date || null,
                    status: formData.status,
                    payment_method: formData.payment_method || null,
                    notes: formData.notes?.trim() || null,
                });

            if (insertError) throw insertError;

            await fetchPayments();
            return true;
        } catch (err) {
            console.error('Erro ao criar pagamento:', err);
            setError('Erro ao criar pagamento');
            return false;
        }
    };

    // Atualizar pagamento
    const updatePayment = async (id: string, formData: Partial<PaymentFormData>): Promise<boolean> => {
        try {
            const updateData: Record<string, unknown> = {};

            if (formData.student_id !== undefined) updateData.student_id = formData.student_id;
            if (formData.description !== undefined) updateData.description = formData.description.trim();
            if (formData.amount !== undefined) updateData.amount = formData.amount;
            if (formData.due_date !== undefined) updateData.due_date = formData.due_date;
            if (formData.paid_date !== undefined) updateData.paid_date = formData.paid_date || null;
            if (formData.status !== undefined) updateData.status = formData.status;
            if (formData.payment_method !== undefined) updateData.payment_method = formData.payment_method || null;
            if (formData.notes !== undefined) updateData.notes = formData.notes?.trim() || null;

            const { error: updateError } = await supabase
                .from('payments')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchPayments();
            return true;
        } catch (err) {
            console.error('Erro ao atualizar pagamento:', err);
            setError('Erro ao atualizar pagamento');
            return false;
        }
    };

    // Excluir pagamento
    const deletePayment = async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('payments')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await fetchPayments();
            return true;
        } catch (err) {
            console.error('Erro ao excluir pagamento:', err);
            setError('Erro ao excluir pagamento');
            return false;
        }
    };

    // Marcar como pago (ação rápida)
    const markAsPaid = async (id: string, paymentMethod?: PaymentMethod): Promise<boolean> => {
        const today = new Date().toISOString().split('T')[0];
        return updatePayment(id, {
            status: 'PAID',
            paid_date: today,
            payment_method: paymentMethod || 'PIX',
        });
    };

    // Cancelar pagamento
    const cancelPayment = async (id: string): Promise<boolean> => {
        return updatePayment(id, { status: 'CANCELLED' });
    };

    // Carregar ao montar
    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    return {
        payments,
        stats,
        isLoading,
        error,
        createPayment,
        updatePayment,
        deletePayment,
        markAsPaid,
        cancelPayment,
        refetch: fetchPayments,
    };
}