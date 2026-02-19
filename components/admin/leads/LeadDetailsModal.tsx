// components/admin/leads/LeadDetailsModal.tsx
'use client';

import { useState } from 'react';
import {
    X,
    Mail,
    Phone,
    Calendar,
    MessageSquare,
    Globe,
    StickyNote,
    PhoneCall,
    UserCheck,
    XCircle,
    Trash2,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types/leads';
import { cn } from '@/lib/utils';

interface StatusConfig {
    label: string;
    className: string;
}

const STATUS_MAP: Record<LeadStatus, StatusConfig> = {
    new: { label: 'Novo', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    contacted: { label: 'Contatado', className: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    converted: { label: 'Convertido', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    declined: { label: 'Declinado', className: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

const SOURCE_LABELS: Record<string, string> = {
    google: 'Google',
    instagram: 'Instagram',
    indicacao: 'Indicação',
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
    outro: 'Outro',
};

interface LeadDetailsModalProps {
    lead: Lead;
    isOpen: boolean;
    onClose: () => void;
    onMarkAsContacted: (leadId: string) => Promise<void>;
    onConvertToStudent: (leadId: string) => Promise<void>;
    onDecline: (leadId: string) => Promise<void>;
    onDelete: (leadId: string) => Promise<void>;
    onUpdateNotes: (leadId: string, notes: string) => Promise<void>;
}

export function LeadDetailsModal({
                                     lead,
                                     isOpen,
                                     onClose,
                                     onMarkAsContacted,
                                     onConvertToStudent,
                                     onDecline,
                                     onDelete,
                                     onUpdateNotes,
                                 }: LeadDetailsModalProps) {
    const [notes, setNotes] = useState<string>(lead.notes || '');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

    if (!isOpen) return null;

    const statusConfig = STATUS_MAP[lead.status as LeadStatus];

    const formatDateTime = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleAction = async (action: () => Promise<void>): Promise<void> => {
        try {
            setIsProcessing(true);
            await action();
            onClose();
        } catch {
            setIsProcessing(false);
        }
    };

    const handleSaveNotes = async (): Promise<void> => {
        await handleAction(() => onUpdateNotes(lead.id, notes));
    };

    const handleDelete = async (): Promise<void> => {
        await handleAction(() => onDelete(lead.id));
    };

    const sourceLabel = lead.source ? SOURCE_LABELS[lead.source] || lead.source : 'Não informado';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-900 border-b border-gray-800/50 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-white">{lead.name}</h2>
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', statusConfig.className)}>
              {statusConfig.label}
            </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Contato</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                <a href={`mailto:${lead.email}`} className="text-sky-400 hover:underline">{lead.email}</a>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                <a
                                    href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:underline"
                                >
                                    {lead.phone}
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Globe className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                <span className="text-gray-400">{sourceLabel}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                <span className="text-gray-400">{formatDateTime(lead.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {lead.message && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Mensagem</h3>
                            <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-4">
                                <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                <p className="text-sm text-gray-300 leading-relaxed">{lead.message}</p>
                            </div>
                        </div>
                    )}

                    {lead.contacted_at && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <PhoneCall className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Contatado em {formatDateTime(lead.contacted_at)}
                        </div>
                    )}

                    {lead.converted_at && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <UserCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Convertido em {formatDateTime(lead.converted_at)}
                        </div>
                    )}

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <StickyNote className="h-4 w-4" strokeWidth={1.5} />
                            Anotações
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value)}
                            placeholder="Adicione anotações sobre este lead..."
                            rows={3}
                            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                            disabled={isProcessing}
                        />
                        {notes !== (lead.notes || '') && (
                            <button
                                onClick={handleSaveNotes}
                                disabled={isProcessing}
                                className="text-sm text-sky-400 hover:text-sky-300 font-medium transition-colors"
                            >
                                Salvar anotações
                            </button>
                        )}
                    </div>

                    <div className="space-y-3 pt-2">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Ações</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {lead.status === 'new' && (
                                <button
                                    onClick={() => handleAction(() => onMarkAsContacted(lead.id))}
                                    disabled={isProcessing}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-all duration-200 disabled:opacity-50"
                                >
                                    <PhoneCall className="h-4 w-4" strokeWidth={1.5} />
                                    Marcar como Contatado
                                </button>
                            )}

                            {(lead.status === 'new' || lead.status === 'contacted') && (
                                <>
                                    <button
                                        onClick={() => handleAction(() => onConvertToStudent(lead.id))}
                                        disabled={isProcessing}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all duration-200 disabled:opacity-50"
                                    >
                                        <UserCheck className="h-4 w-4" strokeWidth={1.5} />
                                        Converter em Aluno
                                    </button>

                                    <button
                                        onClick={() => handleAction(() => onDecline(lead.id))}
                                        disabled={isProcessing}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all duration-200 disabled:opacity-50"
                                    >
                                        <XCircle className="h-4 w-4" strokeWidth={1.5} />
                                        Declinar Lead
                                    </button>
                                </>
                            )}

                            <div className="pt-2 border-t border-gray-800/50">
                                {showDeleteConfirmation ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleDelete}
                                            disabled={isProcessing}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-all duration-200 disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                            Confirmar Exclusão
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirmation(false)}
                                            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowDeleteConfirmation(true)}
                                        disabled={isProcessing}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                                    >
                                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                        Excluir Lead
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}