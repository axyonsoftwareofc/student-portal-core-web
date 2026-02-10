// app/(dashboard)/admin/pagamentos/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { usePayments, type PaymentWithStudent, type PaymentStatus } from "@/hooks/usePayments";
import { useStudents } from "@/hooks/useStudents";
import { PageHeader } from "@/components/common";
import { PaymentStats, PaymentFilters, PaymentList } from "@/components/admin/payments";
import PaymentForm from "@/components/admin/PaymentForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
    const [studentFilter, setStudentFilter] = useState("ALL");
    const [showFilters, setShowFilters] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
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
        return students.filter((s) => s.role === "student" && s.status === "active");
    }, [students]);

    const studentsWithPayments = useMemo(() => {
        const uniqueStudents = new Map<string, { id: string; name: string }>();
        payments.forEach((p) => {
            if (p.student) {
                uniqueStudents.set(p.student.id, { id: p.student.id, name: p.student.name });
            }
        });
        return Array.from(uniqueStudents.values());
    }, [payments]);

    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                payment.description.toLowerCase().includes(searchLower) ||
                payment.student?.name.toLowerCase().includes(searchLower) ||
                payment.student?.email.toLowerCase().includes(searchLower);

            const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter;
            const matchesStudent = studentFilter === "ALL" || payment.student_id === studentFilter;

            return matchesSearch && matchesStatus && matchesStudent;
        });
    }, [payments, searchTerm, statusFilter, studentFilter]);

    const hasFilters = searchTerm !== "" || statusFilter !== "ALL" || studentFilter !== "ALL";

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

    const handleMarkAsPaid = async () => {
        if (!markPaidPayment) return;
        await markAsPaid(markPaidPayment.id, "PIX");
        setMarkPaidPayment(null);
    };

    const handleCancelPayment = async () => {
        if (!cancelPaymentData) return;
        await cancelPayment(cancelPaymentData.id);
        setCancelPaymentData(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pagamentos"
                description="Gerencie as cobranças e pagamentos dos alunos"
                actions={[
                    {
                        label: "Novo Pagamento",
                        onClick: handleCreate,
                        icon: Plus,
                        variant: "primary",
                    },
                ]}
            />

            <PaymentStats stats={stats} />

            <PaymentFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                studentFilter={studentFilter}
                onStudentChange={setStudentFilter}
                students={studentsWithPayments}
                onRefresh={refetch}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
            />

            <PaymentList
                payments={filteredPayments}
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
                isOpen={!!markPaidPayment}
                onClose={() => setMarkPaidPayment(null)}
                onConfirm={handleMarkAsPaid}
                title="Confirmar Pagamento"
                message={`Confirmar recebimento de ${markPaidPayment ? formatCurrency(markPaidPayment.amount) : ""} referente a "${markPaidPayment?.description}"?`}
                confirmText="Confirmar Pagamento"
                variant="success"
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