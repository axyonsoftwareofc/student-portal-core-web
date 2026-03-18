// components/common/UserAvatar.tsx
'use client';

import { cn } from '@/lib/utils';

interface UserAvatarProps {
    name: string;
    avatarUrl?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
};

function getInitials(name: string): string {
    if (!name) return '??';

    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorFromName(name: string): string {
    const colors = [
        'bg-sky-600',
        'bg-emerald-600',
        'bg-violet-600',
        'bg-amber-600',
        'bg-rose-600',
        'bg-cyan-600',
        'bg-pink-600',
        'bg-teal-600',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export function UserAvatar({ name, avatarUrl, size = 'md', className }: UserAvatarProps) {
    const initials = getInitials(name);
    const bgColor = getColorFromName(name);

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className={cn(
                    'rounded-full object-cover',
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center font-semibold text-white',
                sizeClasses[size],
                bgColor,
                className
            )}
        >
            {initials}
        </div>
    );
}