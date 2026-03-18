// components/student/announcements/AnnouncementBanner.tsx
'use client';

import { useState } from 'react';
import { X, ChevronRight, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnouncementWithDetails, ANNOUNCEMENT_CONFIG } from '@/lib/types/announcements';

interface AnnouncementBannerProps {
    announcements: AnnouncementWithDetails[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}

export function AnnouncementBanner({
                                       announcements,
                                       onMarkAsRead,
                                       onMarkAllAsRead,
                                   }: AnnouncementBannerProps) {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    const visibleAnnouncements = announcements.filter(
        (a: AnnouncementWithDetails) => !a.is_read && !dismissed.has(a.id)
    );

    if (visibleAnnouncements.length === 0) return null;

    const current = visibleAnnouncements[currentIndex % visibleAnnouncements.length];
    const config = ANNOUNCEMENT_CONFIG[current.type];

    const handleDismiss = () => {
        onMarkAsRead(current.id);
        setDismissed((prev: Set<string>) => new Set(prev).add(current.id));

        if (currentIndex >= visibleAnnouncements.length - 1) {
            setCurrentIndex(0);
        }
    };

    const handleNext = () => {
        setCurrentIndex((prev: number) => (prev + 1) % visibleAnnouncements.length);
    };

    return (
        <div
            className={cn(
                'rounded-xl border p-4 mb-6 transition-all',
                config.bgColor,
                config.borderColor
            )}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                    <span className="text-2xl">{config.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn('font-semibold', config.textColor)}>
                            {current.title}
                        </h3>
                        {visibleAnnouncements.length > 1 && (
                            <span className="text-xs text-gray-500">
                                ({currentIndex + 1}/{visibleAnnouncements.length})
                            </span>
                        )}
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">
                        {current.content}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {visibleAnnouncements.length > 1 && (
                        <button
                            onClick={handleNext}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                            title="Próximo aviso"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        title="Marcar como lido"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Mark all as read */}
            {visibleAnnouncements.length > 1 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Marcar todos como lidos ({visibleAnnouncements.length})
                    </button>
                </div>
            )}
        </div>
    );
}