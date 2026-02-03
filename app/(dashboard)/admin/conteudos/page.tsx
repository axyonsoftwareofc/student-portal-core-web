// app/(dashboard)/admin/conteudos/page.tsx
'use client';

import { useState } from 'react';
import {
    FileText,
    Plus,
    Video,
    BookOpen,
    PenTool,
    HelpCircle,
    Clock,
    Eye,
    Star,
    Pencil,
    ExternalLink,
    Trash2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

type ContentType = Content['type'];
type ContentStatus = Content['status'];

interface TypeConfig {
    icon: LucideIcon;
    label: string;
    color: string;
}

const typeConfig: Record<ContentType, TypeConfig> = {
    video: { icon: Video, label: 'Vídeo', color: 'sky' },
    article: { icon: BookOpen, label: 'Artigo', color: 'emerald' },
    exercise: { icon: PenTool, label: 'Exercício', color: 'amber' },
    quiz: { icon: HelpCircle, label: 'Quiz', color: 'violet' },
};

const statusConfig: Record<ContentStatus, { label: string; color: string }> = {
    published: { label: 'Publicado', color: 'emerald' },
    draft: { label: 'Rascunho', color: 'amber' },
    review: { label: 'Em Revisão', color: 'sky' },
};

export default function ConteudosPage() {
    const [filterType, setFilterType] = useState<'all' | ContentType>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | ContentStatus>('all');

    const filteredContents = contents.filter(content => {
        const matchesType = filterType === 'all' || content.type === filterType;
        const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
        return matchesType && matchesStatus;
    });

    const getTypeInfo = (type: ContentType) => typeConfig[type];
    const getStatusInfo = (status: ContentStatus) => statusConfig[status];

    const getColorClasses = (color: string) => ({
        bg: `bg-${color}-500/10`,
        text: `text-${color}-400`,
        border: `border-${color}-500/20`,
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <FileText className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            Gestão de Conteúdos
                        </h1>
                        <p className="text-sm text-gray-500">
                            {contents.length} conteúdos cadastrados
                        </p>
                    </div>
                </div>
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors">
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    Novo Conteúdo
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                    className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
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
                    className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                >
                    <option value="all">Todos os status</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Rascunhos</option>
                    <option value="review">Em Revisão</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                {(Object.entries(typeConfig) as [ContentType, TypeConfig][]).map(([type, config]) => {
                    const IconComponent = config.icon;
                    const count = contents.filter(c => c.type === type).length;
                    return (
                        <div
                            key={type}
                            className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-400">{config.label}s</p>
                                    <p className="text-xl sm:text-2xl font-semibold text-white">
                                        {count}
                                    </p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${config.color}-500/10`}>
                                    <IconComponent className={`h-5 w-5 text-${config.color}-400`} strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Contents List */}
            <div className="space-y-3 sm:space-y-4">
                {filteredContents.map((content) => {
                    const typeInfo = getTypeInfo(content.type);
                    const statusInfo = getStatusInfo(content.status);
                    const TypeIcon = typeInfo.icon;

                    return (
                        <div
                            key={content.id}
                            className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                    <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-${typeInfo.color}-500/10 flex-shrink-0`}>
                                        <TypeIcon className={`h-5 w-5 sm:h-6 sm:w-6 text-${typeInfo.color}-400`} strokeWidth={1.5} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base sm:text-lg font-semibold text-white">
                                                {content.title}
                                            </h3>
                                            <span className="text-xs sm:text-sm text-gray-500">
                                                {typeInfo.label}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Módulo: {content.module}
                                        </p>

                                        <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                                            {content.duration && (
                                                <span className="inline-flex items-center gap-1 text-gray-400">
                                                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                    {content.duration}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 text-gray-400">
                                                <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                {content.views}
                                            </span>
                                            {content.rating > 0 && (
                                                <span className="inline-flex items-center gap-1 text-gray-400">
                                                    <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                    {content.rating.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <span className={`inline-flex self-start rounded-full px-2 sm:px-3 py-1 text-xs font-medium bg-${statusInfo.color}-500/10 text-${statusInfo.color}-400`}>
                                    {statusInfo.label}
                                </span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800/50 pt-4">
                                <span className="text-xs text-gray-500">
                                    Criado em {new Date(content.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                                <div className="flex gap-3 sm:gap-4">
                                    <button className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors">
                                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                        Editar
                                    </button>
                                    <button className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors">
                                        <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                                        Ver
                                    </button>
                                    <button className="inline-flex items-center gap-1 text-sm text-rose-400 hover:text-rose-300 transition-colors">
                                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredContents.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="h-8 w-8 text-gray-500 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhum conteúdo encontrado</p>
                </div>
            )}
        </div>
    );
}