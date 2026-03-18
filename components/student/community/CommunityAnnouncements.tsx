// components/student/community/CommunityAnnouncements.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pin, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnouncementWithDetails, ANNOUNCEMENT_CONFIG } from '@/lib/types/announcements';

interface CommunityAnnouncementsProps {
    announcements: AnnouncementWithDetails[];
    onMarkAsRead: (id: string) => void;
}

export function CommunityAnnouncements({ announcements, onMarkAsRead }: CommunityAnnouncementsProps) {
    if (announcements.length === 0) return null;

    return (
        <div className="space-y-3 mb-6">
            {announcements.map((announcement: AnnouncementWithDetails) => {
                const config = ANNOUNCEMENT_CONFIG[announcement.type];
                const timeAgo = formatDistanceToNow(new Date(announcement.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                });

                return (
                    <article
                        key={announcement.id}
                        onClick={() => onMarkAsRead(announcement.id)}
                        className={cn(
                            'border rounded-xl p-4 cursor-pointer transition-all',
                            config.bgColor,
                            config.borderColor,
                            !announcement.is_read && 'ring-2 ring-offset-2 ring-offset-gray-950 ring-sky-500/50'
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">{config.icon}</span>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        <Crown className="h-3 w-3" />
                                        Professor
                                    </span>
                                    {announcement.is_pinned && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-400">
                                            <Pin className="h-3 w-3" />
                                            Fixado
                                        </span>
                                    )}
                                    {!announcement.is_read && (
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-sky-500/20 text-sky-400">
                                            Novo
                                        </span>
                                    )}
                                </div>

                                <h3 className={cn('font-semibold mt-1', config.textColor)}>
                                    {announcement.title}
                                </h3>

                                <p className="text-gray-300 text-sm mt-1 line-clamp-3">
                                    {announcement.content}
                                </p>

                                <p className="text-gray-500 text-xs mt-2">
                                    {announcement.author_name} • {timeAgo}
                                </p>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}