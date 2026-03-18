// components/student/dashboard/DashboardAnnouncements.tsx
'use client';

import { useStudentAnnouncements } from '@/hooks/useStudentAnnouncements';
import { AnnouncementBanner } from '@/components/student/announcements/AnnouncementBanner';

interface DashboardAnnouncementsProps {
    userId: string | null;
}

export function DashboardAnnouncements({ userId }: DashboardAnnouncementsProps) {
    const {
        announcements,
        markAsRead,
        markAllAsRead,
        isLoading,
    } = useStudentAnnouncements(userId);

    if (isLoading || announcements.length === 0) {
        return null;
    }

    return (
        <AnnouncementBanner
            announcements={announcements}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
        />
    );
}