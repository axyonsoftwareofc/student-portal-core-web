// components/admin/PaymentForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, User, FileText, CreditCard, StickyNote } from 'lucide-react';
import { PaymentFormData, PaymentStatus, PaymentMethod } from '@/hooks/usePayments';

interface Student {
    id: string;
    name: string;
    email: string;
}

interface PaymentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PaymentFormData) => Promise<boolean>;
    initialData?: Partial<PaymentFormData> & { id?: string };
    students: Student[];
    isLoading?: boolean;
}

const STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'PAID', label: 'Pago' },
    { value: 'OVERDUE', label: 'Atrasado' },
    { value: 'CANCELLED', label: 'Cancelado' },
];

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
    { value: 'PIX', label: 'PIX' },
    { value: 'CASH', label: 'Dinheiro' },
    { value: 'TRANSFER', label: 'Transferência' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
    { value: 'OTHER', label: 'Outro' },
];

export default function PaymentForm({
                                        isOpen,
                                        onClose,
                                        onSubmit,
                                        initialData,
                                        students,
                                        isLoading = false,
                                    }: PaymentFormProps) {
    const [formData, setFormData] = useState<PaymentFormData>({
        student_id: '',
        description: '',
        amount: 0,
        due_date: '',
        paid_date: null,
        status: 'PENDING',
        payment_method: null,
        notes: null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!initialData?.id;

    // Preencher form quando editar
    useEffect(() => {
        if (initialData) {
            setFormData({
                student_id: initialData.student_id || '',
                description: initialData.description || '',
                amount: initialData.amount || 0,
                due_date: initialData.due_date || '',
                paid_date: initialData.paid_date || null,
                status: initialData.status || 'PENDING',
                payment_method: initialData.payment_method || null,
                notes: initialData.notes || null,
            });
        } else {
            // Reset para novo pagamento
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 10);
            setFormData({
                student_id: '',
                description: `Mensalidade ${nextMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
                amount: 150,
                due_date: nextMonth.toISOString().split('T')[0],
                paid_date: null,
                status: 'PENDING',
                payment_method: null,
                notes: null,
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    // Validação
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.student_id) {
            newErrors.student_id = 'Selecione um aluno';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        }
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Valor deve ser maior que zero';
        }
        if (!formData.due_date) {
            newErrors.due_date = 'Data de vencimento é obrigatória';
        }
        if (formData.status === 'PAID' && !formData.paid_date) {
            newErrors.paid_date = 'Informe a data do pagamento';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const success = await onSubmit(formData);
        setIsSubmitting(false);

        if (success) {
            onClose();
        }
    };

    // Quando status muda para PAID, preencher data automaticamente
    const handleStatusChange = (status: PaymentStatus) => {
        setFormData((prev) => ({
            ...prev,
            status,
            paid_date: status === 'PAID' && !prev.paid_date
                ? new Date().toISOString().split('T')[0]
                : prev.paid_date,
            payment_method: status === 'PAID' && !prev.payment_method
                ? 'PIX'
                : prev.payment_method,
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header - Fixo */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
                    <h2 className="text-xl font-semibold text-white">
                        {isEditing ? 'Editar Pagamento' : 'Novo Pagamento'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Form - Com Scroll */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-5 overflow-y-auto flex-1">
                        {/* Aluno */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                <User className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                                Aluno
                            </label>
                            <select
                                value={formData.student_id}
                                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                disabled={isLoading}
                                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-colors ${
                                    errors.student_id ? 'border-rose-500' : 'border-gray-700 focus:border-sky-500'
                                }`}
                            >
                                <option value="">Selecione um aluno</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} ({student.email})
                                    </option>
                                ))}
                            </select>
                            {errors.student_id && (
                                <p className="mt-1 text-sm text-rose-400">{errors.student_id}</p>
                            )}
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                <FileText className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                                Descrição
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ex: Mensalidade Junho/2025"
                                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-colors ${
                                    errors.description ? 'border-rose-500' : 'border-gray-700 focus:border-sky-500'
                                }`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-rose-400">{errors.description}</p>
                            )}
                        </div>

                        {/* Valor e Vencimento */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Valor */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                    <DollarSign className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                                    Valor (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-colors ${
                                        errors.amount ? 'border-rose-500' : 'border-gray-700 focus:border-sky-500'
                                    }`}
                                />
                                {errors.amount && (
                                    <p className="mt-1 text-sm text-rose-400">{errors.amount}</p>
                                )}
                            </div>

                            {/* Vencimento */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                    <Calendar className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
                                    Vencimento
                                </label>
                                <input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-colors ${
                                        errors.due_date ? 'border-rose-500' : 'border-gray-700 focus:border-sky-500'
                                    }`}
                                />
                                {errors.due_date && (
                                    <p className="mt-1 text-sm text-rose-400">{errors.due_date}</p>
                                )}
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">
                                Status
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {STATUS_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleStatusChange(option.value)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                            formData.status === option.value
                                                ? option.value === 'PENDING'
                                                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                                    : option.value === 'PAID'
                                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                        : option.value === 'OVERDUE'
                                                            ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                                                            : 'bg-gray-500/20 border-gray-500 text-gray-400'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data do Pagamento e Método (só aparece se status for PAID) */}
                        {formData.status === 'PAID' && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                                {/* Data do Pagamento */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <Calendar className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                                        Data do Pagamento
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.paid_date || ''}
                                        onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
                                            errors.paid_date ? 'border-rose-500' : 'border-gray-700 focus:border-emerald-500'
                                        }`}
                                    />
                                    {errors.paid_date && (
                                        <p className="mt-1 text-sm text-rose-400">{errors.paid_date}</p>
                                    )}
                                </div>

                                {/* Método */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <CreditCard className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                                        Forma de Pagamento
                                    </label>
                                    <select
                                        value={formData.payment_method || ''}
                                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod || null })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                                    >
                                        <option value="">Selecione</option>
                                        {PAYMENT_METHOD_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Observações */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                <StickyNote className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                                Observações
                                <span className="text-gray-500 font-normal">(opcional)</span>
                            </label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Anotações sobre este pagamento..."
                                rows={2}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors resize-none"
                            />
                        </div>
                    </div>

                    {/* Botões - Fixo no rodapé */}
                    <div className="flex gap-3 p-6 border-t border-gray-800 shrink-0 bg-gray-900">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-600/50 text-white font-medium rounded-lg transition-colors"
                        >
                            {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Pagamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}