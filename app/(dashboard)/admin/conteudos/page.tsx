// app/(dashboard)/admin/conteudos/page.tsx
'use client';

import { useState } from 'react';

interface Content {
    id: number;
    title: string;
    type: 'video' | 'article' | 'exercise' | 'quiz';
    module: string;
    duration?: string;
    status: 'published' | 'draft' | 'review';
    views: number;
    rating: number;
    createdAt: string;
}

const contents: Content[] = [
    {
        id: 1,
        title: 'Introdução ao Java',
        type: 'video',
        module: 'Fundamentos de Java',
        duration: '15:30',
        status: 'published',
        views: 245,
        rating: 4.8,
        createdAt: '2024-01-15',
    },
    {
        id: 2,
        title: 'Variáveis e Tipos de Dados',
        type: 'article',
        module: 'Fundamentos de Java',
        status: 'published',
        views: 198,
        rating: 4.6,
        createdAt: '2024-01-16',
    },
    {
        id: 3,
        title: 'Exercícios de Sintaxe',
        type: 'exercise',
        module: 'Fundamentos de Java',
        status: 'published',
        views: 156,
        rating: 4.5,
        createdAt: '2024-01-17',
    },
    {
        id: 4,
        title: 'Quiz: Fundamentos',
        type: 'quiz',
        module: 'Fundamentos de Java',
        status: 'published',
        views: 189,
        rating: 4.7,
        createdAt: '2024-01-18',
    },
    {
        id: 5,
        title: 'Herança em Java',
        type: 'video',
        module: 'POO',
        duration: '22:45',
        status: 'draft',
        views: 0,
        rating: 0,
        createdAt: '2024-02-10',
    },
];

export default function ConteudosPage() {
    const [filterType, setFilterType] = useState<'all' | Content['type']>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | Content['status']>('all');

    const filteredContents = contents.filter(content => {
        const matchesType = filterType === 'all' || content.type === filterType;
        const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
        return matchesType && matchesStatus;
    });

    const getTypeIcon = (type: Content['type']) => {
        switch (type) {
            case 'video': return '🎥';
            case 'article': return '📄';
            case 'exercise': return '✍️';
            case 'quiz': return '❓';
        }
    };

    const getTypeLabel = (type: Content['type']) => {
        switch (type) {
            case 'video': return 'Vídeo';
            case 'article': return 'Artigo';
            case 'exercise': return 'Exercício';
            case 'quiz': return 'Quiz';
        }
    };

    const getStatusColor = (status: Content['status']) => {
        switch (status) {
            case 'published': return 'bg-emerald-500/20 text-emerald-300';
            case 'draft': return 'bg-yellow-500/20 text-yellow-300';
            case 'review': return 'bg-blue-500/20 text-blue-300';
        }
    };

    const getStatusLabel = (status: Content['status']) => {
        switch (status) {
            case 'published': return 'Publicado';
            case 'draft': return 'Rascunho';
            case 'review': return 'Em Revisão';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-nacelle text-2xl sm:text-3xl font-bold text-white">
                        Gestão de Conteúdos
                    </h1>
                    <p className="mt-1 text-sm text-gray-400">
                        {contents.length} conteúdos cadastrados
                    </p>
                </div>
                <button className="w-full sm:w-auto rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
                    + Novo Conteúdo
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                    className="w-full sm:w-auto rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                >
                    <option value="all">Todos os tipos</option>
                    <option value="video">Vídeos</option>
                    <option value="article">Artigos</option>
                    <option value="exercise">Exercícios</option>
                    <option value="quiz">Quizzes</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="w-full sm:w-auto rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                >
                    <option value="all">Todos os status</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Rascunhos</option>
                    <option value="review">Em Revisão</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Vídeos</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">
                                {contents.filter(c => c.type === 'video').length}
                            </p>
                        </div>
                        <span className="text-2xl sm:text-3xl">🎥</span>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Artigos</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">
                                {contents.filter(c => c.type === 'article').length}
                            </p>
                        </div>
                        <span className="text-2xl sm:text-3xl">📄</span>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Exercícios</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">
                                {contents.filter(c => c.type === 'exercise').length}
                            </p>
                        </div>
                        <span className="text-2xl sm:text-3xl">✍️</span>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Quizzes</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">
                                {contents.filter(c => c.type === 'quiz').length}
                            </p>
                        </div>
                        <span className="text-2xl sm:text-3xl">❓</span>
                    </div>
                </div>
            </div>

            {/* Contents List */}
            <div className="space-y-3 sm:space-y-4">
                {filteredContents.map((content) => (
                    <div
                        key={content.id}
                        className="group rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-violet-500/20 flex-shrink-0">
                                    <span className="text-xl sm:text-2xl">{getTypeIcon(content.type)}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base sm:text-lg font-semibold text-white">
                                            {content.title}
                                        </h3>
                                        <span className="text-xs sm:text-sm text-gray-500">
                                            {getTypeLabel(content.type)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Módulo: {content.module}
                                    </p>

                                    <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                                        {content.duration && (
                                            <span className="text-gray-400">
                                                ⏱️ {content.duration}
                                            </span>
                                        )}
                                        <span className="text-gray-400">
                                            👁️ {content.views}
                                        </span>
                                        {content.rating > 0 && (
                                            <span className="text-gray-400">
                                                ⭐ {content.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <span className={`inline-flex self-start rounded-full px-2 sm:px-3 py-1 text-xs font-medium ${getStatusColor(content.status)}`}>
                                {getStatusLabel(content.status)}
                            </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-700/50 pt-4">
                            <span className="text-xs text-gray-500">
                                Criado em {new Date(content.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <div className="flex gap-3 sm:gap-4">
                                <button className="text-sm text-violet-400 hover:text-violet-300">
                                    Editar
                                </button>
                                <button className="text-sm text-blue-400 hover:text-blue-300">
                                    Ver
                                </button>
                                <button className="text-sm text-red-400 hover:text-red-300">
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredContents.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400">Nenhum conteúdo encontrado</p>
                </div>
            )}
        </div>
    );
}