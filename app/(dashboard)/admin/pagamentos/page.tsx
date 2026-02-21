// app/(dashboard)/admin/pagamentos/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { Plus, Users } from 'lucide-react';
import { usePayments, type PaymentWithStudent, type PaymentStatus } from '@/hooks/usePayments';
import { useStudents } from '@/hooks/useStudents';
import { PageHeader } from '@/components/common';
import {
    PaymentStats,
    PaymentFilters,
    PaymentList,
    PaymentForm,
    BatchPaymentDialog,
    MarkPaidDialog,
} from '@/components/admin/payments';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
    const [studentFilter, setStudentFilter] = useState<string>('ALL');
    const [periodFilter, setPeriodFilter] = useState<string>('ALL');
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
    const [editingPayment, setEditingPayment] = useState<PaymentWithStudent | null>(null);
    const [deletePayment, setDeletePayment] = useState<PaymentWithStudent | null>(null);
    const [markPaidPayment, setMarkPaidPayment] = useState<PaymentWithStudent | null>(null);
    const [cancelPaymentData, setCancelPaymentData] = useState<PaymentWithStudent | null>(null);

    const {
        payments,
        stats,
        isLoading,
        createPayment,
        updatePayment,
        deletePayment: removePayment,
        markAsPaid,
        cancelPayment,
        refetch,
    } = usePayments();

    const { students } = useStudents();

    const activeStudents = useMemo(() => {
        return students.filter((s) => s.role === 'student' && s.status === 'active');
    }, [students]);

    const studentsWithPayments = useMemo(() => {
        const uniqueStudents = new Map<string, { id: string; name: string }>();
        payments.forEach((p: PaymentWithStudent) => {
            if (p.student) {
                uniqueStudents.set(p.student.id, { id: p.student.id, name: p.student.name });
            }
        });
        return Array.from(uniqueStudents.values());
    }, [payments]);

    const availablePeriods = useMemo(() => {
        const periods = new Set<string>();
        payments.forEach((p: PaymentWithStudent) => {
            const date = new Date(p.due_date + 'T00:00:00');
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            periods.add(key);
        });
        return Array.from(periods)
            .sort((a, b) => b.localeCompare(a))
            .map((period) => {
                const [year, month] = period.split('-');
                const date = new Date(Number(year), Number(month) - 1);
                const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                return { value: period, label: label.charAt(0).toUpperCase() + label.slice(1) };
            });
    }, [payments]);

    const filteredPayments = useMemo(() => {
        return payments.filter((payment: PaymentWithStudent) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                payment.description.toLowerCase().includes(searchLower) ||
                payment.student?.name.toLowerCase().includes(searchLower) ||
                payment.student?.email.toLowerCase().includes(searchLower);

            const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
            const matchesStudent = studentFilter === 'ALL' || payment.student_id === studentFilter;

            let matchesPeriod = true;
            if (periodFilter !== 'ALL') {
                const date = new Date(payment.due_date + 'T00:00:00');
                const paymentPeriod = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                matchesPeriod = paymentPeriod === periodFilter;
            }

            return matchesSearch && matchesStatus && matchesStudent && matchesPeriod;
        });
    }, [payments, searchTerm, statusFilter, studentFilter, periodFilter]);

    const hasFilters = searchTerm !== '' || statusFilter !== 'ALL' || studentFilter !== 'ALL' || periodFilter !== 'ALL';

    const handleCreate = () => {
        setEditingPayment(null);
        setIsFormOpen(true);
    };

    const handleEdit = (payment: PaymentWithStudent) => {
        setEditingPayment(payment);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: Parameters<typeof createPayment>[0]) => {
        if (editingPayment) {
            return await updatePayment(editingPayment.id, data);
        }
        return await createPayment(data);
    };

    const handleDelete = async () => {
        if (!deletePayment) return;
        await removePayment(deletePayment.id);
        setDeletePayment(null);
    };

    const handleMarkAsPaid = async (method: string) => {
        if (!markPaidPayment) return;
        await markAsPaid(markPaidPayment.id, method as Parameters<typeof markAsPaid>[1]);
        setMarkPaidPayment(null);
    };

    const handleCancelPayment = async () => {
        if (!cancelPaymentData) return;
        await cancelPayment(cancelPaymentData.id);
        setCancelPaymentData(null);
    };

    const handleBatchCreate = async (
        studentIds: string[],
        description: string,
        amount: number,
        dueDate: string
    ): Promise<boolean> => {
        let allSuccess = true;
        for (const studentId of studentIds) {
            const success = await createPayment({
                student_id: studentId,
                description,
                amount,
                due_date: dueDate,
                status: 'PENDING',
            });
            if (!success) allSuccess = false;
        }
        return allSuccess;
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pagamentos"
                description="Gerencie as cobranças e pagamentos dos alunos"
                actions={[
                    {
                        label: 'Gerar em Lote',
                        onClick: () => setIsBatchOpen(true),
                        icon: Users,
                        variant: 'secondary' as const,
                    },
                    {
                        label: 'Novo Pagamento',
                        onClick: handleCreate,
                        icon: Plus,
                        variant: 'primary' as const,
                    },
                ]}
            />

            <PaymentStats stats={stats} totalPayments={payments.length} />

            <PaymentFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                studentFilter={studentFilter}
                onStudentChange={setStudentFilter}
                periodFilter={periodFilter}
                onPeriodChange={setPeriodFilter}
                students={studentsWithPayments}
                periods={availablePeriods}
                onRefresh={refetch}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
            />

            <PaymentList
                payments={filteredPayments}
                allPayments={payments}
                isLoading={isLoading}
                hasFilters={hasFilters}
                onMarkPaid={setMarkPaidPayment}
                onEdit={handleEdit}
                onCancel={setCancelPaymentData}
                onDelete={setDeletePayment}
                onCreate={handleCreate}
            />

            <PaymentForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingPayment(null);
                }}
                onSubmit={handleSubmit}
                initialData={editingPayment || undefined}
                students={activeStudents}
                isLoading={isLoading}
            />

            <BatchPaymentDialog
                isOpen={isBatchOpen}
                onClose={() => setIsBatchOpen(false)}
                onSubmit={handleBatchCreate}
                students={activeStudents}
            />

            <MarkPaidDialog
                isOpen={!!markPaidPayment}
                onClose={() => setMarkPaidPayment(null)}
                onConfirm={handleMarkAsPaid}
                paymentDescription={markPaidPayment?.description || ''}
                paymentAmount={markPaidPayment?.amount || 0}
            />

            <ConfirmDialog
                isOpen={!!deletePayment}
                onClose={() => setDeletePayment(null)}
                onConfirm={handleDelete}
                title="Excluir Pagamento"
                message={`Tem certeza que deseja excluir o pagamento "${deletePayment?.description}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                variant="danger"
            />

            <ConfirmDialog
                isOpen={!!cancelPaymentData}
                onClose={() => setCancelPaymentData(null)}
                onConfirm={handleCancelPayment}
                title="Cancelar Pagamento"
                message={`Tem certeza que deseja cancelar o pagamento "${cancelPaymentData?.description}"?`}
                confirmText="Cancelar Pagamento"
                variant="warning"
            />
        </div>
    );
}