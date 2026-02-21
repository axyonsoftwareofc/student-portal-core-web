// components/admin/payments/mark-paid-dialog.tsx
'use client';

import { useState } from 'react';
import { CheckCircle, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type PaymentMethod } from '@/hooks/usePayments';

interface MarkPaidDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: PaymentMethod) => void;
    paymentDescription: string;
    paymentAmount: number;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'PIX', label: 'PIX', icon: '⚡' },
    { value: 'CASH', label: 'Dinheiro', icon: '💵' },
    { value: 'TRANSFER', label: 'Transferência', icon: '🏦' },
    { value: 'CREDIT_CARD', label: 'Crédito', icon: '💳' },
    { value: 'DEBIT_CARD', label: 'Débito', icon: '💳' },
    { value: 'OTHER', label: 'Outro', icon: '📝' },
];

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function MarkPaidDialog({
                                   isOpen,
                                   onClose,
                                   onConfirm,
                                   paymentDescription,
                                   paymentAmount,
                               }: MarkPaidDialogProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('PIX');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
                {/* Header */}
                <div className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                        <CheckCircle className="h-7 w-7 text-emerald-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Confirmar Pagamento</h2>
                    <p className="mt-2 text-sm text-gray-400">{paymentDescription}</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-400">{formatCurrency(paymentAmount)}</p>
                </div>

                {/* Método de Pagamento */}
                <div className="border-t border-gray-800 px-6 py-4">
                    <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <CreditCard className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                        Forma de Pagamento
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map((method) => (
                            <button
                                key={method.value}
                                onClick={() => setSelectedMethod(method.value)}
                                className={cn(
                                    'flex flex-col items-center gap-1 rounded-lg border px-3 py-3 text-sm transition-colors',
                                    selectedMethod === method.value
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                )}
                            >
                                <span className="text-lg">{method.icon}</span>
                                <span className="text-xs font-medium">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 border-t border-gray-800 p-6">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg bg-gray-800 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(selectedMethod)}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-500"
                    >
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        </div>
    );
}