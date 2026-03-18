// components/admin/announcements/AnnouncementCard.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pin, Users, Eye, MoreVertical, Trash2, Edit, Power, PowerOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/common/UserAvatar';
import { AnnouncementWithDetails, ANNOUNCEMENT_CONFIG, TARGET_LABELS } from '@/lib/types/announcements';

interface AnnouncementCardProps {
    announcement: AnnouncementWithDetails;
    onEdit: (announcement: AnnouncementWithDetails) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string, isPinned: boolean) => void;
    onToggleActive: (id: string, isActive: boolean) => void;
}

export function AnnouncementCard({
                                     announcement,
                                     onEdit,
                                     onDelete,
                                     onTogglePin,
                                     onToggleActive,
                                 }: AnnouncementCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const config = ANNOUNCEMENT_CONFIG[announcement.type];
    const timeAgo = formatDistanceToNow(new Date(announcement.created_at), {
        addSuffix: true,
        locale: ptBR,
    });

    const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();

    return (
        <article
            className={cn(
                'border rounded-xl p-4 transition-all',
                config.bgColor,
                config.borderColor,
                !announcement.is_active && 'opacity-60'
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{config.icon}</span>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white">
                                {announcement.title}
                            </h3>
                            {announcement.is_pinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-400">
                                    <Pin className="h-3 w-3" />
                                    Fixado
                                </span>
                            )}
                            {!announcement.is_active && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">
                                    Inativo
                                </span>
                            )}
                            {isExpired && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-400">
                                    Expirado
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                            <span>{announcement.author_name}</span>
                            <span>•</span>
                            <span>{timeAgo}</span>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>

                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-8 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px]">
                                <button
                                    onClick={() => {
                                        onEdit(announcement);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => {
                                        onTogglePin(announcement.id, !announcement.is_pinned);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Pin className="h-4 w-4" />
                                    {announcement.is_pinned ? 'Desafixar' : 'Fixar'}
                                </button>
                                <button
                                    onClick={() => {
                                        onToggleActive(announcement.id, !announcement.is_active);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                >
                                    {announcement.is_active ? (
                                        <>
                                            <PowerOff className="h-4 w-4" />
                                            Desativar
                                        </>
                                    ) : (
                                        <>
                                            <Power className="h-4 w-4" />
                                            Ativar
                                        </>
                                    )}
                                </button>
                                <hr className="my-1 border-gray-700" />
                                <button
                                    onClick={() => {
                                        onDelete(announcement.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-rose-400 hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Excluir
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <p className="mt-3 text-gray-300 whitespace-pre-wrap">
                {announcement.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {TARGET_LABELS[announcement.target]}
                        {announcement.target_name && `: ${announcement.target_name}`}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {announcement.reads_count} leram
                    </span>
                </div>

                <span className={cn('px-2 py-1 rounded-full text-xs', config.bgColor, config.textColor)}>
                    {config.label}
                </span>
            </div>
        </article>
    );
}