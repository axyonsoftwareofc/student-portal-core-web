// components/student/community/EmptyFeed.tsx
'use client';

import { Users } from 'lucide-react';

export function EmptyFeed() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-gray-600" strokeWidth={1.5} />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma conquista ainda
            </h3>

            <p className="text-gray-400 text-center max-w-md">
                As conquistas da turma aparecerão aqui! Complete aulas, exercícios
                e mantenha seu streak para aparecer no mural. 🚀
            </p>
        </div>
    );
}