// app/(dashboard)/admin/pagamentos/page.tsx
'use client';

import { useState, useMemo } from 'react';
import {
    CreditCard,
    Plus,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Calendar,
    DollarSign,
    User,
    Edit,
    Trash2,
    Ban,
    RefreshCw,
    ChevronDown,
} from 'lucide-react';
import { usePayments, PaymentWithStudent, PaymentStatus, PaymentMethod } from '@/hooks/usePayments';
import { useStudents } from '@/hooks/useStudents';
import PaymentForm from '@/components/admin/PaymentForm';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';

// Helpers para formatação
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
};

// Configuração de status
const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
    PENDING: {
        label: 'Pendente',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/30',
        icon: Clock,
    },
    PAID: {
        label: 'Pago',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/30',
        icon: CheckCircle,
    },
    OVERDUE: {
        label: 'Atrasado',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10 border-rose-500/30',
        icon: AlertTriangle,
    },
    CANCELLED: {
        label: 'Cancelado',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10 border-gray-500/30',
        icon: XCircle,
    },
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    PIX: 'PIX',
    CASH: 'Dinheiro',
    TRANSFER: 'Transferência',
    CREDIT_CARD: 'Cartão de Crédito',
    DEBIT_CARD: 'Cartão de Débito',
    OTHER: 'Outro',
};

export default function PaymentsPage() {
    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
    const [studentFilter, setStudentFilter] = useState<string>('ALL');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<PaymentWithStudent | null>(null);
    const [deletePayment, setDeletePayment] = useState<PaymentWithStudent | null>(null);
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
    const [markPaidPayment, setMarkPaidPayment] = useState<PaymentWithStudent | null>(null);
    const [cancelPaymentId, setCancelPaymentId] = useState<PaymentWithStudent | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Hooks
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

    // Filtrar apenas alunos ativos para o select
    const activeStudents = useMemo(() => {
        return students.filter((s) => s.role === 'student' && s.status === 'active');
    }, [students]);

    // Lista de alunos únicos que têm pagamentos (para o filtro)
    const studentsWithPayments = useMemo(() => {
        const uniqueStudents = new Map<string, { id: string; name: string }>();
        payments.forEach((p) => {
            if (p.student) {
                uniqueStudents.set(p.student.id, { id: p.student.id, name: p.student.name });
            }
        });
        return Array.from(uniqueStudents.values());
    }, [payments]);

    // Filtrar pagamentos
    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                payment.description.toLowerCase().includes(searchLower) ||
                payment.student?.name.toLowerCase().includes(searchLower) ||
                payment.student?.email.toLowerCase().includes(searchLower);

            const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
            const matchesStudent = studentFilter === 'ALL' || payment.student_id === studentFilter;

            return matchesSearch && matchesStatus && matchesStudent;
        });
    }, [payments, searchTerm, statusFilter, studentFilter]);

    // Handlers
    const handleCreate = () => {
        setEditingPayment(null);
        setIsFormOpen(true);
    };

    const handleEdit = (payment: PaymentWithStudent) => {
        setEditingPayment(payment);
        setIsFormOpen(true);
        setActionMenuOpen(null);
    };

    const handleDelete = async () => {
        if (!deletePayment) return;
        await removePayment(deletePayment.id);
        setDeletePayment(null);
    };

    const handleMarkAsPaid = async () => {
        if (!markPaidPayment) return;
        await markAsPaid(markPaidPayment.id, 'PIX');
        setMarkPaidPayment(null);
    };

    const handleCancelPayment = async () => {
        if (!cancelPaymentId) return;
        await cancelPayment(cancelPaymentId.id);
        setCancelPaymentId(null);
    };

    const handleSubmit = async (data: Parameters<typeof createPayment>[0]) => {
        if (editingPayment) {
            return await updatePayment(editingPayment.id, data);
        }
        return await createPayment(data);
    };

    const handleClickOutside = () => {
        setActionMenuOpen(null);
    };

    // Componente de Card para Mobile
    const PaymentCard = ({ payment }: { payment: PaymentWithStudent }) => {
        const statusConfig = STATUS_CONFIG[payment.status];
        const StatusIcon = statusConfig.icon;

        return (
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">
                            {payment.student?.name || 'Aluno removido'}
                        </p>
                        <p className="text-sm text-gray-400 truncate">{payment.description}</p>
                    </div>
                    <span
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0",
                            statusConfig.bgColor,
                            statusConfig.color
                        )}
                    >
                        <StatusIcon className="h-3 w-3" strokeWidth={2} />
                        {statusConfig.label}
                    </span>
                </div>

                {/* Informações */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-xs text-gray-500">Valor</p>
                        <p className="font-semibold text-white">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Vencimento</p>
                        <p className="text-gray-300">{formatDate(payment.due_date)}</p>
                    </div>
                </div>

                {payment.paid_date && (
                    <p className="mt-2 text-xs text-emerald-400">
                        Pago em {formatDate(payment.paid_date)}
                        {payment.payment_method && ` via ${PAYMENT_METHOD_LABELS[payment.payment_method]}`}
                    </p>
                )}

                {/* Ações */}
                <div className="mt-4 flex items-center gap-2 border-t border-gray-800/50 pt-4">
                    {(payment.status === 'PENDING' || payment.status === 'OVERDUE') && (
                        <button
                            onClick={() => setMarkPaidPayment(payment)}
                            className="flex-1 rounded-lg bg-emerald-600/20 px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/30"
                        >
                            Marcar Pago
                        </button>
                    )}
                    <button
                        onClick={() => handleEdit(payment)}
                        className="rounded-lg bg-gray-800 p-2 text-gray-400 hover:text-white"
                    >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    {payment.status !== 'CANCELLED' && payment.status !== 'PAID' && (
                        <button
                            onClick={() => setCancelPaymentId(payment)}
                            className="rounded-lg bg-gray-800 p-2 text-amber-400 hover:text-amber-300"
                        >
                            <Ban className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                    )}
                    <button
                        onClick={() => setDeletePayment(payment)}
                        className="rounded-lg bg-gray-800 p-2 text-rose-400 hover:text-rose-300"
                    >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" onClick={handleClickOutside}>
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pagamentos</h1>
                    <p className="text-gray-400">Gerencie as cobranças e pagamentos dos alunos</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-sky-500"
                >
                    <Plus className="h-5 w-5" strokeWidth={1.5} />
                    <span className="sm:inline">Novo Pagamento</span>
                </button>
            </div>

            {/* Cards de Estatísticas - Responsivo */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {/* Total a Receber */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">A Receber</p>
                            <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-white truncate">
                                {formatCurrency(stats.total_pending + stats.total_overdue)}
                            </p>
                            <p className="mt-0.5 sm:mt-1 text-xs text-gray-500">
                                {stats.count_pending + stats.count_overdue} pgtos
                            </p>
                        </div>
                        <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/10">
                            <DollarSign className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Pendentes */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Pendentes</p>
                            <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-amber-400 truncate">
                                {formatCurrency(stats.total_pending)}
                            </p>
                            <p className="mt-0.5 sm:mt-1 text-xs text-gray-500">{stats.count_pending} pgtos</p>
                        </div>
                        <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10">
                            <Clock className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Atrasados */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Atrasados</p>
                            <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-rose-400 truncate">
                                {formatCurrency(stats.total_overdue)}
                            </p>
                            <p className="mt-0.5 sm:mt-1 text-xs text-gray-500">{stats.count_overdue} pgtos</p>
                        </div>
                        <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-lg bg-rose-500/10">
                            <AlertTriangle className="h-5 w-5 text-rose-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Recebidos */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-400">Recebidos</p>
                            <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-emerald-400 truncate">
                                {formatCurrency(stats.total_paid)}
                            </p>
                            <p className="mt-0.5 sm:mt-1 text-xs text-gray-500">{stats.count_paid} pgtos</p>
                        </div>
                        <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
                            <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros - Responsivo */}
            <div className="space-y-3">
                {/* Busca + Botão Filtros (Mobile) */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                        />
                    </div>

                    {/* Botão toggle filtros (mobile) */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
                    >
                        <Filter className="h-5 w-5" strokeWidth={1.5} />
                        <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
                    </button>

                    {/* Botão Atualizar */}
                    <button
                        onClick={() => refetch()}
                        className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 px-3 py-2.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                        <RefreshCw className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Filtros expandíveis (mobile) / sempre visíveis (desktop) */}
                <div className={cn(
                    "flex flex-col gap-2 sm:flex-row",
                    !showFilters && "hidden lg:flex"
                )}>
                    {/* Filtro Status */}
                    <div className="relative flex-1 lg:flex-none">
                        <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" strokeWidth={1.5} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'ALL')}
                            className="w-full appearance-none rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-10 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 lg:w-auto"
                        >
                            <option value="ALL">Todos os status</option>
                            <option value="PENDING">Pendentes</option>
                            <option value="PAID">Pagos</option>
                            <option value="OVERDUE">Atrasados</option>
                            <option value="CANCELLED">Cancelados</option>
                        </select>
                    </div>

                    {/* Filtro Aluno */}
                    <div className="relative flex-1 lg:flex-none">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" strokeWidth={1.5} />
                        <select
                            value={studentFilter}
                            onChange={(e) => setStudentFilter(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-10 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 lg:w-auto"
                        >
                            <option value="ALL">Todos os alunos</option>
                            {studentsWithPayments.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Pagamentos */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                </div>
            ) : filteredPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <CreditCard className="h-12 w-12 text-gray-600" strokeWidth={1.5} />
                    <h3 className="mt-4 text-lg font-medium text-white">Nenhum pagamento encontrado</h3>
                    <p className="mt-1 text-gray-400">
                        {searchTerm || statusFilter !== 'ALL' || studentFilter !== 'ALL'
                            ? 'Tente ajustar os filtros'
                            : 'Clique em "Novo Pagamento" para começar'}
                    </p>
                </div>
            ) : (
                <>
                    {/* View Mobile - Cards */}
                    <div className="grid gap-3 lg:hidden">
                        {filteredPayments.map((payment) => (
                            <PaymentCard key={payment.id} payment={payment} />
                        ))}
                    </div>

                    {/* View Desktop - Tabela */}
                    <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-800/50 bg-gray-900/30">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-800 bg-gray-900/50">
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                                        Aluno
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                                        Descrição
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                                        Valor
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                                        Vencimento
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                                        Ações
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                {filteredPayments.map((payment) => {
                                    const statusConfig = STATUS_CONFIG[payment.status];
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <tr
                                            key={payment.id}
                                            className="transition-colors hover:bg-gray-900/50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {payment.student?.name || 'Aluno removido'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {payment.student?.email}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-white">{payment.description}</p>
                                                {payment.payment_method && payment.status === 'PAID' && (
                                                    <p className="text-xs text-gray-500">
                                                        via {PAYMENT_METHOD_LABELS[payment.payment_method]}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <p className="font-semibold text-white">
                                                    {formatCurrency(payment.amount)}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                                    <span className="text-gray-300">{formatDate(payment.due_date)}</span>
                                                </div>
                                                {payment.paid_date && (
                                                    <p className="mt-0.5 text-xs text-emerald-400">
                                                        Pago em {formatDate(payment.paid_date)}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                                                        statusConfig.bgColor,
                                                        statusConfig.color
                                                    )}
                                                >
                                                    <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />
                                                    {statusConfig.label}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActionMenuOpen(actionMenuOpen === payment.id ? null : payment.id);
                                                        }}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                                                    >
                                                        <MoreVertical className="h-5 w-5" strokeWidth={1.5} />
                                                    </button>

                                                    {actionMenuOpen === payment.id && (
                                                        <div
                                                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg border border-gray-800 bg-gray-900 shadow-xl"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className="py-1">
                                                                {(payment.status === 'PENDING' || payment.status === 'OVERDUE') && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setMarkPaidPayment(payment);
                                                                            setActionMenuOpen(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-emerald-400 hover:bg-gray-800"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                                                        Marcar como Pago
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => handleEdit(payment)}
                                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800"
                                                                >
                                                                    <Edit className="h-4 w-4" strokeWidth={1.5} />
                                                                    Editar
                                                                </button>

                                                                {payment.status !== 'CANCELLED' && payment.status !== 'PAID' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setCancelPaymentId(payment);
                                                                            setActionMenuOpen(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-amber-400 hover:bg-gray-800"
                                                                    >
                                                                        <Ban className="h-4 w-4" strokeWidth={1.5} />
                                                                        Cancelar
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => {
                                                                        setDeletePayment(payment);
                                                                        setActionMenuOpen(null);
                                                                    }}
                                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-rose-400 hover:bg-gray-800"
                                                                >
                                                                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                                                    Excluir
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Formulário Modal */}
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

            {/* Diálogos de Confirmação */}
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
                message={`Confirmar recebimento de ${markPaidPayment ? formatCurrency(markPaidPayment.amount) : ''} referente a "${markPaidPayment?.description}"?`}
                confirmText="Confirmar Pagamento"
                variant="success"
            />

            <ConfirmDialog
                isOpen={!!cancelPaymentId}
                onClose={() => setCancelPaymentId(null)}
                onConfirm={handleCancelPayment}
                title="Cancelar Pagamento"
                message={`Tem certeza que deseja cancelar o pagamento "${cancelPaymentId?.description}"?`}
                confirmText="Cancelar Pagamento"
                variant="warning"
            />
        </div>
    );
}