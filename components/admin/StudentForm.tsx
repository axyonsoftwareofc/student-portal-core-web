// components/admin/StudentForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Student, StudentFormData } from '@/hooks/useStudents';
import { Loader2, AlertTriangle } from 'lucide-react';

interface StudentFormProps {
    student?: Student | null;
    onSubmit: (data: StudentFormData, currentEmail?: string) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function StudentForm({ student, onSubmit, onCancel, isLoading }: StudentFormProps) {
    const [formData, setFormData] = useState<StudentFormData>({
        name: '',
        email: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [showEmailWarning, setShowEmailWarning] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                email: student.email,
                phone: student.phone || '',
            });
        }
    }, [student]);

    // Verificar se o email mudou
    useEffect(() => {
        if (student && formData.email.toLowerCase().trim() !== student.email.toLowerCase().trim()) {
            setShowEmailWarning(true);
        } else {
            setShowEmailWarning(false);
        }
    }, [formData.email, student]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        if (!formData.email.trim()) {
            setError('E-mail é obrigatório');
            return;
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError('Formato de e-mail inválido');
            return;
        }

        const result = await onSubmit(formData, student?.email);
        if (!result.success && result.error) {
            setError(result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Nome completo <span className="text-rose-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    placeholder="Nome do aluno"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    E-mail <span className="text-rose-400">*</span>
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    placeholder="email@exemplo.com"
                    disabled={isLoading}
                />
                {showEmailWarning && (
                    <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-amber-950/30 border border-amber-500/20">
                        <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <p className="text-xs text-amber-300">
                            {student?.status === 'active'
                                ? 'Alterar o email de um aluno ativo afetará o login dele. O aluno precisará usar o novo email para acessar a plataforma.'
                                : 'O email será atualizado. Um novo convite precisará ser enviado.'}
                        </p>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Telefone
                </label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    placeholder="(00) 00000-0000"
                    disabled={isLoading}
                />
            </div>

            <div className="flex gap-3 justify-end pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {student ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                </button>
            </div>
        </form>
    );
}