// components/student/forum/EmptyForum.tsx
'use client';

import Link from 'next/link';
import { MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyForumProps {
    hasFilters?: boolean;
    onClearFilters?: () => void;
}

export function EmptyForum({ hasFilters = false, onClearFilters }: EmptyForumProps) {
    if (hasFilters) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <MessageCircle className="h-10 w-10 text-gray-600" strokeWidth={1.5} />
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhuma pergunta encontrada
                </h3>

                <p className="text-gray-400 text-center max-w-md mb-6">
                    Não encontramos perguntas com os filtros selecionados.
                    Tente ajustar os filtros ou limpar a busca.
                </p>

                {onClearFilters && (
                    <Button variant="outline" onClick={onClearFilters}>
                        Limpar filtros
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <MessageCircle className="h-10 w-10 text-gray-600" strokeWidth={1.5} />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma pergunta ainda
            </h3>

            <p className="text-gray-400 text-center max-w-md mb-6">
                Seja o primeiro a fazer uma pergunta! A comunidade está aqui para ajudar
                você a resolver suas dúvidas sobre programação.
            </p>

            <Link href="/aluno/forum/nova">
                <Button className="bg-sky-600 hover:bg-sky-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Fazer uma pergunta
                </Button>
            </Link>
        </div>
    );
}