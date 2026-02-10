// components/admin/payments/payment-table.tsx
import { useState } from "react";
import { Calendar, MoreVertical, Edit, Trash2, Ban, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type PaymentWithStudent, type PaymentStatus, type PaymentMethod } from "@/hooks/usePayments";

interface PaymentTableProps {
    payments: PaymentWithStudent[];
    onMarkPaid: (payment: PaymentWithStudent) => void;
    onEdit: (payment: PaymentWithStudent) => void;
    onCancel: (payment: PaymentWithStudent) => void;
    onDelete: (payment: PaymentWithStudent) => void;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
    PENDING: { label: "Pendente", color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/30", icon: Clock },
    PAID: { label: "Pago", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
    OVERDUE: { label: "Atrasado", color: "text-rose-400", bgColor: "bg-rose-500/10 border-rose-500/30", icon: AlertTriangle },
    CANCELLED: { label: "Cancelado", color: "text-gray-400", bgColor: "bg-gray-500/10 border-gray-500/30", icon: XCircle },
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    PIX: "PIX",
    CASH: "Dinheiro",
    TRANSFER: "Transferência",
    CREDIT_CARD: "Cartão de Crédito",
    DEBIT_CARD: "Cartão de Débito",
    OTHER: "Outro",
};

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const formatDate = (dateString: string) => new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR");

export function PaymentTable({ payments, onMarkPaid, onEdit, onCancel, onDelete }: PaymentTableProps) {
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    return (
        <div className="overflow-hidden rounded-lg border border-gray-800/50 bg-gray-900/30">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/50">
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Aluno</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Descrição</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Valor</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Vencimento</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                    {payments.map((payment) => {
                        const statusConfig = STATUS_CONFIG[payment.status];
                        const StatusIcon = statusConfig.icon;
                        const canMarkPaid = payment.status === "PENDING" || payment.status === "OVERDUE";
                        const canCancel = payment.status !== "CANCELLED" && payment.status !== "PAID";

                        return (
                            <tr key={payment.id} className="transition-colors hover:bg-gray-900/50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div>
                                        <p className="font-medium text-white">{payment.student?.name || "Aluno removido"}</p>
                                        <p className="text-sm text-gray-500">{payment.student?.email}</p>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <p className="text-white">{payment.description}</p>
                                    {payment.payment_method && payment.status === "PAID" && (
                                        <p className="text-xs text-gray-500">via {PAYMENT_METHOD_LABELS[payment.payment_method]}</p>
                                    )}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4">
                                    <p className="font-semibold text-white">{formatCurrency(payment.amount)}</p>
                                </td>

                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                        <span className="text-gray-300">{formatDate(payment.due_date)}</span>
                                    </div>
                                    {payment.paid_date && (
                                        <p className="mt-0.5 text-xs text-emerald-400">Pago em {formatDate(payment.paid_date)}</p>
                                    )}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", statusConfig.bgColor, statusConfig.color)}>
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
                                                    {canMarkPaid && (
                                                        <button
                                                            onClick={() => { onMarkPaid(payment); setActionMenuOpen(null); }}
                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-emerald-400 hover:bg-gray-800"
                                                        >
                                                            <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                                            Marcar como Pago
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { onEdit(payment); setActionMenuOpen(null); }}
                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800"
                                                    >
                                                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                                                        Editar
                                                    </button>
                                                    {canCancel && (
                                                        <button
                                                            onClick={() => { onCancel(payment); setActionMenuOpen(null); }}
                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-amber-400 hover:bg-gray-800"
                                                        >
                                                            <Ban className="h-4 w-4" strokeWidth={1.5} />
                                                            Cancelar
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { onDelete(payment); setActionMenuOpen(null); }}
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
    );
}