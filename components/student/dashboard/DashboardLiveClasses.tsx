// components/student/dashboard/DashboardLiveClasses.tsx
'use client';

import { useStudentLiveClasses } from '@/hooks/useStudentLiveClasses';
import { LiveClassDashboardCard } from '@/components/student/live-classes/LiveClassDashboardCard';

interface DashboardLiveClassesProps {
    userId: string | null;
}

export function DashboardLiveClasses({ userId }: DashboardLiveClassesProps) {
    const {
        nextClass,
        recentRecordings,
        unwatchedCount,
        isLoading,
    } = useStudentLiveClasses(userId);

    if (isLoading) {
        return null;
    }

    return (
        <LiveClassDashboardCard
            nextClass={nextClass}
            recentCount={recentRecordings.length}
            unwatchedCount={unwatchedCount}
        />
    );
}