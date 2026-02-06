// app/(dashboard)/aluno/modulos/page.tsx
'use client';

import Link from 'next/link';
import {
    Layers,
    BookOpen,
    CheckCircle,
    Clock,
    PlayCircle,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCourses } from '@/hooks/useStudentCourses';
import { useStudentModules } from '@/hooks/useStudentModules';

export default function ModulosPage() {
    const { user } = useAuth();
    const { courses, isLoading: loadingCourses } = useStudentCourses(user?.id || null);

    // Pegar o primeiro curso (ou null se não tiver)
    const firstCourseId = courses.length > 0 ? courses[0].id : null;
    const { modules, isLoading: loadingModules } = useStudentModules(firstCourseId, user?.id || null);

    const isLoading = loadingCourses || loadingModules;

    // Estatísticas
    const completedModules = modules.filter(m => m.progress_percentage === 100).length;
    const inProgressModules = modules.filter(m => (m.progress_percentage || 0) > 0 && (m.progress_percentage || 0) < 100).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-sky-400 animate-spin" strokeWidth={1.5} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                    Módulos de Aprendizado
                </h1>
                <p className="text-sm text-gray-500">
                    Acompanhe seu progresso em cada módulo
                </p>
            </div>

            {/* Modules Grid */}
            {modules.length === 0 ? (
                <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <Layers className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400 mb-4">Nenhum módulo disponível ainda</p>
                    <Link
                        href="/aluno/estudar"
                        className="text-sky-400 hover:text-sky-300 text-sm"
                    >
                        Ir para área de estudos →
                    </Link>
                </div>
            ) : (
                <div className="grid gap-5 lg:grid-cols-3 md:grid-cols-2">
                    {modules.map((module, index) => {
                        const status = module.progress_percentage === 100
                            ? 'Concluído'
                            : (module.progress_percentage || 0) > 0
                                ? 'Em Progresso'
                                : 'Não Iniciado';

                        return (
                            <div
                                key={module.id}
                                className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/10 text-lg font-semibold text-sky-400">
                                        {index + 1}
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                            status === 'Concluído'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : status === 'Em Progresso'
                                                    ? 'bg-sky-500/10 text-sky-400'
                                                    : 'bg-gray-800 text-gray-400'
                                        }`}
                                    >
                                        {status}
                                    </span>
                                </div>

                                {/* Title and description */}
                                <h3 className="text-base font-semibold text-white mb-2">
                                    {module.name}
                                </h3>
                                {module.description && (
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {module.description}
                                    </p>
                                )}

                                {/* Stats */}
                                <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        {module.lessons_count} aulas
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        {module.completed_lessons} concluídas
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="mb-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Progresso</span>
                                        <span className="text-xs font-medium text-sky-400">
                                            {module.progress_percentage}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                                        <div
                                            className={`h-full transition-all duration-500 ${
                                                module.progress_percentage === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                                            }`}
                                            style={{ width: `${module.progress_percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <Link
                                    href={`/aluno/estudar/${module.id}`}
                                    className="block w-full rounded-lg bg-sky-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-sky-500"
                                >
                                    {status === 'Concluído' ? 'Revisar' : 'Continuar'}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-5">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                    <h3 className="font-medium text-emerald-300 text-sm">Resumo</h3>
                </div>
                <p className="text-sm text-emerald-200/80">
                    Você completou <span className="font-semibold">{completedModules} de {modules.length}</span> módulos.
                    {inProgressModules > 0 && (
                        <> {inProgressModules} em progresso.</>
                    )}
                </p>
            </div>
        </div>
    );
}