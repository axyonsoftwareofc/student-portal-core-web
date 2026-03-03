// components/admin/DeleteStudentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Trash2,
    X,
    Loader2,
    BookOpen,
    BarChart3,
    History,
    MessageSquare,
    UserX,
    Info
} from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface DeleteStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    student: {
        id: string;
        name: string;
        email: string;
        status?: string;
    } | null;
    isLoading?: boolean;
}

export default function DeleteStudentModal({
                                               isOpen,
                                               onClose,
                                               onConfirm,
                                               student,
                                               isLoading = false
                                           }: DeleteStudentModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    // Reset ao abrir/fechar
    useEffect(() => {
        if (isOpen) {
            setConfirmText('');
            setError('');
        }
    }, [isOpen]);

    const isConfirmValid = confirmText.trim().toUpperCase() === 'EXCLUIR';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConfirmValid) {
            setError('Digite "EXCLUIR" para confirmar');
            return;
        }

        await onConfirm();
    };

    const handleClose = () => {
        if (!isLoading) {
            setConfirmText('');
            setError('');
            onClose();
        }
    };

    if (!student) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title=""
            size="md"
        >
            <div className="space-y-5">
                {/* Header com ícone de alerta */}
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 mb-4">
                        <AlertTriangle className="h-7 w-7 text-rose-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                        Excluir Aluno Permanentemente
                    </h2>
                    <p className="text-gray-400 mt-1">
                        Esta ação é <span className="text-rose-400 font-medium">irreversível</span>
                    </p>
                </div>

                {/* Dados do aluno */}
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white font-medium">
                            {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-white truncate">{student.name}</p>
                            <p className="text-sm text-gray-400 truncate">{student.email}</p>
                        </div>
                    </div>
                </div>

                {/* O que será perdido */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-rose-400 flex items-center gap-2">
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        Todos os dados serão perdidos:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/20 border border-rose-500/10">
                            <BookOpen className="h-4 w-4 text-rose-400/70" strokeWidth={1.5} />
                            <span className="text-xs text-rose-300/80">Progresso de aulas</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/20 border border-rose-500/10">
                            <MessageSquare className="h-4 w-4 text-rose-400/70" strokeWidth={1.5} />
                            <span className="text-xs text-rose-300/80">Respostas de exercícios</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/20 border border-rose-500/10">
                            <BarChart3 className="h-4 w-4 text-rose-400/70" strokeWidth={1.5} />
                            <span className="text-xs text-rose-300/80">Estatísticas e relatórios</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/20 border border-rose-500/10">
                            <History className="h-4 w-4 text-rose-400/70" strokeWidth={1.5} />
                            <span className="text-xs text-rose-300/80">Histórico de atividades</span>
                        </div>
                    </div>
                </div>

                {/* Sugestão de suspensão */}
                {student.status !== 'suspended' && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-950/30 border border-amber-500/20">
                        <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                            <p className="text-sm font-medium text-amber-300">
                                Quer apenas impedir o acesso?
                            </p>
                            <p className="text-xs text-amber-300/70 mt-0.5">
                                Use a opção <strong>"Suspender"</strong> para bloquear o acesso temporariamente.
                                Os dados do aluno serão preservados e você poderá reativá-lo depois.
                            </p>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                            >
                                <UserX className="h-3.5 w-3.5" strokeWidth={1.5} />
                                Cancelar e usar Suspender
                            </button>
                        </div>
                    </div>
                )}

                {/* Campo de confirmação */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Digite <span className="font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">EXCLUIR</span> para confirmar:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            placeholder="Digite EXCLUIR"
                            disabled={isLoading}
                            className={`w-full rounded-lg border bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                                error
                                    ? 'border-rose-500 focus:border-rose-500'
                                    : isConfirmValid
                                        ? 'border-emerald-500 focus:border-emerald-500'
                                        : 'border-gray-800 focus:border-rose-500'
                            }`}
                            autoComplete="off"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-1.5 text-xs text-rose-400">{error}</p>
                        )}
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !isConfirmValid}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                                isConfirmValid
                                    ? 'bg-rose-600 text-white hover:bg-rose-500'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                    Excluir Permanentemente
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}