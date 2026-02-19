// components/student/performance/PerformanceTabs.tsx
'use client';

import { cn } from '@/lib/utils';
import { ClipboardCheck, BarChart3, Trophy } from 'lucide-react';

export type PerformanceTabType = 'exercises' | 'progress' | 'achievements';

interface PerformanceTabsProps {
    activeTab: PerformanceTabType;
    onTabChange: (tab: PerformanceTabType) => void;
}

export function PerformanceTabs({ activeTab, onTabChange }: PerformanceTabsProps) {
    const tabs = [
        { id: 'exercises' as const, label: 'Exercícios', icon: ClipboardCheck },
        { id: 'progress' as const, label: 'Progresso', icon: BarChart3 },
        { id: 'achievements' as const, label: 'Conquistas', icon: Trophy },
    ];

    return (
        <div className="flex gap-1 p-1 rounded-lg bg-gray-900/50 border border-gray-800/50">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
                            isActive
                                ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                        )}
                    >
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}