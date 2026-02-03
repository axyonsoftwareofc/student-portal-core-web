// components/ui/ConfirmDialog.tsx
'use client';

import Modal from './Modal';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning';
}

export default function ConfirmDialog({
                                          isOpen,
                                          onClose,
                                          onConfirm,
                                          title,
                                          message,
                                          confirmText = 'Confirmar',
                                          cancelText = 'Cancelar',
                                          isLoading = false,
                                          variant = 'danger',
                                      }: ConfirmDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <p className="text-gray-400 text-sm">{message}</p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                            variant === 'danger'
                                ? 'bg-rose-600 hover:bg-rose-500'
                                : 'bg-amber-600 hover:bg-amber-500'
                        }`}
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}