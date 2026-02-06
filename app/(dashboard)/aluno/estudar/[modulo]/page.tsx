// app/(dashboard)/aluno/estudar/[modulo]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Video,
    FileText,
    PenTool,
    HelpCircle,
    CheckCircle,
    Clock,
    Play,
    Loader2,
    AlertCircle,
    Layers
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLessons } from '@/hooks/useStudentLessons';
import type { StudentLesson, LessonType } from '@/lib/types/database';

// Ícone por tipo de aula
function getLessonIcon(type: LessonType) {
    switch (type) {
        case 'VIDEO': return Video;
        case 'ARTICLE': return FileText;
        case 'EXERCISE': return PenTool;
        case 'QUIZ': return HelpCircle;
        default: return FileText;
    }
}

// Label por tipo de aula
function getLessonTypeLabel(type: LessonType) {
    switch (type) {
        case 'VIDEO': return 'Vídeo';
        case 'ARTICLE': return 'Artigo';
        case 'EXERCISE': return 'Exercício';
        case 'QUIZ': return 'Quiz';
        default: return type;
    }
}

export default function ModuloPage() {
    const params = useParams();
    const moduloId = params?.modulo as string;
    const { user } = useAuth();

    const { lessons, module, isLoading, error } = useStudentLessons(moduloId, user?.id || null);

    // Estatísticas do módulo
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(l => l.is_completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Contagem por tipo
    const lessonsByType = {
        VIDEO: lessons.filter(l => l.type === 'VIDEO').length,
        ARTICLE: lessons.filter(l => l.type === 'ARTICLE').length,
        EXERCISE: lessons.filter(l => l.type === 'EXERCISE').length,
        QUIZ: lessons.filter(l => l.type === 'QUIZ').length,
    };

    // Loading
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400 text-sm">Carregando módulo...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error || !module) {
        return (
            <div className="space-y-4">
                <Link
                    href="/aluno/estudar"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar
                </Link>
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-300 font-medium mb-1">Módulo não encontrado</p>
                        <p className="text-gray-500 text-sm">{error || 'Verifique se o link está correto'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
                <Link
                    href="/aluno/estudar"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    {module.course?.name || 'Voltar'}
                </Link>
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <Layers className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                            {module.name}
                        </h1>
                        {module.description && (
                            <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Progresso</p>
                    <p className="mt-2 text-2xl font-semibold text-sky-400">
                        {progressPercentage}%
                    </p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Aulas</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                        {completedLessons}/{totalLessons}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Vídeos</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-400">
                        {lessonsByType.VIDEO}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Quizzes</p>
                    <p className="mt-2 text-2xl font-semibold text-violet-400">
                        {lessonsByType.QUIZ}
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progresso do módulo</span>
                    <span className="text-sm font-medium text-sky-400">{progressPercentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                    <div
                        className={`h-full transition-all duration-500 ${
                            progressPercentage === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Lessons list */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Conteúdo do módulo</h2>

                {lessons.length === 0 ? (
                    <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-400">Nenhuma aula disponível ainda</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lessons.map((lesson, index) => (
                            <LessonCard
                                key={lesson.id}
                                lesson={lesson}
                                index={index}
                                moduloId={moduloId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE DE CARD DA AULA
// ============================================

function LessonCard({
                        lesson,
                        index,
                        moduloId
                    }: {
    lesson: StudentLesson;
    index: number;
    moduloId: string;
}) {
    const Icon = getLessonIcon(lesson.type);
    const typeLabel = getLessonTypeLabel(lesson.type);

    // Cor do ícone por tipo
    const iconColorClass = {
        VIDEO: 'bg-emerald-500/10 text-emerald-400',
        ARTICLE: 'bg-sky-500/10 text-sky-400',
        EXERCISE: 'bg-amber-500/10 text-amber-400',
        QUIZ: 'bg-violet-500/10 text-violet-400',
    }[lesson.type];

    // Badge de tipo
    const typeBadgeClass = {
        VIDEO: 'bg-emerald-500/10 text-emerald-400',
        ARTICLE: 'bg-sky-500/10 text-sky-400',
        EXERCISE: 'bg-amber-500/10 text-amber-400',
        QUIZ: 'bg-violet-500/10 text-violet-400',
    }[lesson.type];

    return (
        <Link
            href={`/aluno/estudar/${moduloId}/${lesson.id}`}
            className="group block rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50 hover:border-gray-700"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Order number or checkmark */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                        lesson.is_completed
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : iconColorClass
                    }`}>
                        {lesson.is_completed ? (
                            <CheckCircle className="h-5 w-5" strokeWidth={1.5} />
                        ) : (
                            <Icon className="h-5 w-5" strokeWidth={1.5} />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass}`}>
                                {typeLabel}
                            </span>
                            {lesson.duration && lesson.type === 'VIDEO' && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                                    {lesson.duration}
                                </span>
                            )}
                        </div>
                        <h3 className="font-medium text-gray-200 text-sm sm:text-base">
                            {lesson.title}
                        </h3>
                        {lesson.description && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                                {lesson.description}
                            </p>
                        )}

                        {/* Quiz score if completed */}
                        {lesson.type === 'QUIZ' && lesson.progress?.quiz_score !== null && lesson.progress?.quiz_score !== undefined && (
                            <p className="mt-1 text-xs text-violet-400">
                                Nota: {lesson.progress.quiz_score}/{lesson.progress.quiz_total}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status icon */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {lesson.is_completed ? (
                        <span className="text-xs text-emerald-400">Concluído</span>
                    ) : (
                        <Play className="h-4 w-4 text-gray-500 group-hover:text-sky-400 transition-colors" strokeWidth={1.5} />
                    )}
                </div>
            </div>
        </Link>
    );
}