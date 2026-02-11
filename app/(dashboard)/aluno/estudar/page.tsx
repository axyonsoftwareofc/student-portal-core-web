// app/(dashboard)/aluno/estudar/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    BookOpen,
    Layers,
    PlayCircle,
    CheckCircle,
    Clock,
    ArrowRight,
    ArrowLeft,
    Loader2,
    AlertCircle,
    GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCourses } from '@/hooks/useStudentCourses';
import { useStudentModules } from '@/hooks/useStudentModules';
import type { StudentCourse, StudentModule } from '@/lib/types/database';

export default function EstudarPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();

    // Pegar curso da URL (se existir)
    const cursoIdFromUrl = searchParams.get('curso');

    const { courses, isLoading: loadingCourses, error: coursesError } = useStudentCourses(user?.id || null);

    // Determinar qual curso carregar:
    // 1. Se tem ?curso= na URL, usa esse
    // 2. Se tem apenas 1 curso, usa esse automaticamente
    // 3. Se tem múltiplos cursos e não tem ?curso=, mostra lista de cursos
    const selectedCourseId = cursoIdFromUrl || (courses.length === 1 ? courses[0].id : null);

    const { modules, course: selectedCourse, isLoading: loadingModules } = useStudentModules(
        selectedCourseId,
        user?.id || null
    );

    // Encontrar dados do curso selecionado (para exibir progresso)
    const courseData = courses.find(c => c.id === selectedCourseId) || selectedCourse;

    const isLoading = loadingCourses || (selectedCourseId && loadingModules);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400 text-sm">Carregando conteúdo...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (coursesError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-300 font-medium mb-1">Erro ao carregar</p>
                    <p className="text-gray-500 text-sm">{coursesError}</p>
                </div>
            </div>
        );
    }

    // No courses enrolled
    if (courses.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 mx-auto mb-4">
                        <GraduationCap className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Nenhum curso encontrado
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Você ainda não está matriculado em nenhum curso.
                        Entre em contato com o professor para ser adicionado.
                    </p>
                </div>
            </div>
        );
    }

    // Se tem curso selecionado (via URL ou único curso), mostra módulos
    if (selectedCourseId && courseData) {
        return (
            <div className="space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="space-y-1 sm:space-y-2">
                    {/* Botão voltar (só mostra se tem múltiplos cursos) */}
                    {courses.length > 1 && (
                        <Link
                            href="/aluno/estudar"
                            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors mb-3"
                        >
                            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                            Voltar para cursos
                        </Link>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <BookOpen className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="font-nacelle text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
                                {courseData.name}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500">
                                {(courseData as StudentCourse).progress_percentage ?? 0}% concluído • {(courseData as StudentCourse).completed_lessons ?? 0}/{(courseData as StudentCourse).lessons_count ?? 0} aulas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progresso geral</span>
                        <span className="text-sm font-medium text-sky-400">
                            {(courseData as StudentCourse).progress_percentage ?? 0}%
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                        <div
                            className="h-full bg-sky-500 transition-all duration-500"
                            style={{ width: `${(courseData as StudentCourse).progress_percentage ?? 0}%` }}
                        />
                    </div>
                </div>

                {/* Modules list */}
                {modules.length === 0 ? (
                    <div className="text-center py-12">
                        <Layers className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-400">Nenhum módulo disponível ainda</p>
                    </div>
                ) : (
                    <ModulesList modules={modules} />
                )}

                {/* Info box */}
                <InfoBox />
            </div>
        );
    }

    // Multiple courses - show course cards (sem ?curso= na URL)
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <BookOpen className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
                            Meus Cursos
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500">
                            Escolha um curso para continuar estudando
                        </p>
                    </div>
                </div>
            </div>

            {/* Courses grid */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>

            {/* Info box */}
            <InfoBox />
        </div>
    );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function CourseCard({ course }: { course: StudentCourse }) {
    return (
        <Link
            href={`/aluno/estudar?curso=${course.id}`}
            className="group relative overflow-hidden rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/50"
        >
            <div className="relative z-10 flex h-full flex-col">
                {/* Icon and status */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10">
                        <GraduationCap className="h-6 w-6 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 sm:px-3 py-1 text-xs font-medium ${
                        course.progress_percentage === 100
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : (course.progress_percentage ?? 0) > 0
                                ? 'bg-sky-500/10 text-sky-400'
                                : 'bg-gray-800 text-gray-400'
                    }`}>
                        {course.progress_percentage === 100
                            ? 'Concluído'
                            : (course.progress_percentage ?? 0) > 0
                                ? 'Em progresso'
                                : 'Não iniciado'}
                    </span>
                </div>

                {/* Title and description */}
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    {course.name}
                </h3>
                {course.description && (
                    <p className="text-xs sm:text-sm text-gray-400 mb-4 flex-1 line-clamp-2">
                        {course.description}
                    </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {course.modules_count ?? 0} módulos
                    </span>
                    <span className="flex items-center gap-1">
                        <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {course.lessons_count ?? 0} aulas
                    </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                        <div
                            className="h-full bg-sky-500 transition-all duration-500"
                            style={{ width: `${course.progress_percentage ?? 0}%` }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {course.completed_lessons ?? 0}/{course.lessons_count ?? 0} aulas concluídas
                    </span>
                    <ArrowRight
                        className="h-4 w-4 text-sky-400 group-hover:translate-x-1 transition-transform"
                        strokeWidth={1.5}
                    />
                </div>
            </div>
        </Link>
    );
}

function ModulesList({ modules }: { modules: StudentModule[] }) {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                Módulos
            </h2>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((module, index) => (
                    <Link
                        key={module.id}
                        href={`/aluno/estudar/${module.id}`}
                        className="group relative overflow-hidden rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/50"
                    >
                        <div className="relative z-10 flex h-full flex-col">
                            {/* Order and status */}
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-semibold ${
                                    module.progress_percentage === 100
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-sky-500/10 text-sky-400'
                                }`}>
                                    {index + 1}
                                </div>
                                {module.progress_percentage === 100 ? (
                                    <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                                ) : (module.progress_percentage ?? 0) > 0 ? (
                                    <Clock className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                                ) : (
                                    <Clock className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
                                )}
                            </div>

                            {/* Title and description */}
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                                {module.name}
                            </h3>
                            {module.description && (
                                <p className="text-xs sm:text-sm text-gray-400 mb-4 flex-1 line-clamp-2">
                                    {module.description}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                    <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    {module.lessons_count ?? 0} aulas
                                </span>
                                <span className="text-sky-400 font-medium">
                                    {module.progress_percentage ?? 0}%
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-3">
                                <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                                    <div
                                        className={`h-full transition-all duration-500 ${
                                            module.progress_percentage === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                                        }`}
                                        style={{ width: `${module.progress_percentage ?? 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    {module.completed_lessons ?? 0}/{module.lessons_count ?? 0} concluídas
                                </span>
                                <ArrowRight
                                    className="h-4 w-4 text-sky-400 group-hover:translate-x-1 transition-transform"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function InfoBox() {
    return (
        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                <h3 className="font-semibold text-sky-300 text-sm sm:text-base">
                    Como funciona?
                </h3>
            </div>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-sky-200/80">
                <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>Escolha um módulo para começar</span>
                </li>
                <li className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>Assista as videoaulas</span>
                </li>
                <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>Leia os artigos e materiais</span>
                </li>
                <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>Complete os quizzes para testar seu conhecimento</span>
                </li>
            </ul>
        </div>
    );
}