// components/admin/payments/batch-payment-dialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Users, DollarSign, Calendar, FileText, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
    id: string;
    name: string;
    email: string;
}

interface BatchPaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (studentIds: string[], description: string, amount: number, dueDate: string) => Promise<boolean>;
    students: Student[];
}

export function BatchPaymentDialog({ isOpen, onClose, onSubmit, students }: BatchPaymentDialogProps) {
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [description, setDescription] = useState<string>('');
    const [amount, setAmount] = useState<number>(150);
    const [dueDate, setDueDate] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextMonth.setDate(10);

            const monthLabel = nextMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

            setSelectedStudents(new Set(students.map((s: Student) => s.id)));
            setDescription(`Mensalidade ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}`);
            setAmount(150);
            setDueDate(nextMonth.toISOString().split('T')[0]);
            setErrors({});
        }
    }, [isOpen, students]);

    const toggleStudent = (studentId: string) => {
        setSelectedStudents((prev) => {
            const next = new Set(prev);
            if (next.has(studentId)) {
                next.delete(studentId);
            } else {
                next.add(studentId);
            }
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedStudents.size === students.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(students.map((s: Student) => s.id)));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (selectedStudents.size === 0) newErrors.students = 'Selecione ao menos um aluno';
        if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
        if (!amount || amount <= 0) newErrors.amount = 'Valor deve ser maior que zero';
        if (!dueDate) newErrors.dueDate = 'Data de vencimento é obrigatória';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        const success = await onSubmit(
            Array.from(selectedStudents),
            description,
            amount,
            dueDate
        );
        setIsSubmitting(false);

        if (success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-gray-800 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <Users className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Gerar em Lote</h2>
                            <p className="text-sm text-gray-400">Criar pagamento para múltiplos alunos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                    {/* Descrição */}
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                            <FileText className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                            Descrição
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={cn(
                                'w-full rounded-lg border bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50',
                                errors.description ? 'border-rose-500' : 'border-gray-700 focus:border-sky-500'
                            )}
                        />
                        {errors.description && <p className="mt-1 text-sm text-rose-400">{errors.description}</p>}
                    </div>

                    {/* Valor e Vencimento */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                                <DollarSign className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                                Valor (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                className={cn(
                                    'w-full rounded-lg border bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50',
                                    errors.amount ? 'border-rose-500' : 'border-gray-700 focus:border-sky-500'
                                )}
                            />
                            {errors.amount && <p className="mt-1 text-sm text-rose-400">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                                <Calendar className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
                                Vencimento
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className={cn(
                                    'w-full rounded-lg border bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50',
                                    errors.dueDate ? 'border-rose-500' : 'border-gray-700 focus:border-sky-500'
                                )}
                            />
                            {errors.dueDate && <p className="mt-1 text-sm text-rose-400">{errors.dueDate}</p>}
                        </div>
                    </div>

                    {/* Seleção de Alunos */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">
                                Alunos ({selectedStudents.size}/{students.length})
                            </label>
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="text-xs font-medium text-sky-400 hover:text-sky-300"
                            >
                                {selectedStudents.size === students.length ? 'Desmarcar todos' : 'Selecionar todos'}
                            </button>
                        </div>
                        {errors.students && <p className="mb-2 text-sm text-rose-400">{errors.students}</p>}

                        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-800 bg-gray-800/50 p-2">
                            {students.map((student: Student) => {
                                const isSelected = selectedStudents.has(student.id);
                                return (
                                    <button
                                        key={student.id}
                                        type="button"
                                        onClick={() => toggleStudent(student.id)}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                                            isSelected ? 'bg-sky-500/10' : 'hover:bg-gray-800'
                                        )}
                                    >
                                        <div className={cn(
                                            'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                                            isSelected
                                                ? 'border-sky-500 bg-sky-500'
                                                : 'border-gray-600 bg-gray-800'
                                        )}>
                                            {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={cn('truncate text-sm font-medium', isSelected ? 'text-white' : 'text-gray-400')}>
                                                {student.name}
                                            </p>
                                            <p className="truncate text-xs text-gray-500">{student.email}</p>
                                        </div>
                                    </button>
                                );
                            })}

                            {students.length === 0 && (
                                <p className="py-4 text-center text-sm text-gray-500">Nenhum aluno ativo encontrado</p>
                            )}
                        </div>
                    </div>

                    {/* Resumo */}
                    {selectedStudents.size > 0 && amount > 0 && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4">
                            <p className="text-sm text-gray-300">
                                Serão gerados{' '}
                                <span className="font-bold text-white">{selectedStudents.size} pagamentos</span>{' '}
                                totalizando{' '}
                                <span className="font-bold text-sky-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      amount * selectedStudents.size
                  )}
                </span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex shrink-0 gap-3 border-t border-gray-800 bg-gray-900 p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg bg-gray-800 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedStudents.size === 0}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 font-medium text-white transition-colors hover:bg-sky-500 disabled:bg-sky-600/50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                Gerando...
                            </>
                        ) : (
                            `Gerar ${selectedStudents.size} Pagamentos`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}