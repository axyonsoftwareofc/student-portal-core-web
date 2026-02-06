// app/(dashboard)/aluno/perfil/page.tsx
'use client';

import {
    User,
    Mail,
    Calendar,
    BookOpen,
    CheckCircle,
    BarChart3,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCourses } from '@/hooks/useStudentCourses';

export default function PerfilPage() {
    const { user } = useAuth();
    const { courses, isLoading } = useStudentCourses(user?.id || null);

    // Calcular estatísticas
    const totalLessons = courses.reduce((acc, c) => acc + (c.lessons_count || 0), 0);
    const completedLessons = courses.reduce((acc, c) => acc + (c.completed_lessons || 0), 0);
    const overallProgress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    const userName = user?.name || user?.email?.split('@')[0] || 'Aluno';
    const userEmail = user?.email || '';
    const createdAt = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
        : '';

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
                    Meu Perfil
                </h1>
                <p className="text-sm text-gray-500">
                    Suas informações e estatísticas
                </p>
            </div>

            {/* Profile Card */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-500/10 border-2 border-sky-500/20">
                        <User className="h-10 w-10 text-sky-400" strokeWidth={1.5} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-semibold text-white mb-1">
                            {userName}
                        </h2>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-400 flex items-center justify-center sm:justify-start gap-2">
                                <Mail className="h-4 w-4" strokeWidth={1.5} />
                                {userEmail}
                            </p>
                            {createdAt && (
                                <p className="text-sm text-gray-400 flex items-center justify-center sm:justify-start gap-2">
                                    <Calendar className="h-4 w-4" strokeWidth={1.5} />
                                    Membro desde {createdAt}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 text-center">
                    <BookOpen className="h-6 w-6 text-sky-400 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-2xl font-bold text-white">{courses.length}</p>
                    <p className="text-xs text-gray-500">Cursos</p>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-2xl font-bold text-white">{completedLessons}</p>
                    <p className="text-xs text-gray-500">Aulas Concluídas</p>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 text-center">
                    <BarChart3 className="h-6 w-6 text-amber-400 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-2xl font-bold text-white">{overallProgress}%</p>
                    <p className="text-xs text-gray-500">Progresso</p>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 text-center">
                    <User className="h-6 w-6 text-violet-400 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-2xl font-bold text-white">Ativo</p>
                    <p className="text-xs text-gray-500">Status</p>
                </div>
            </div>

            {/* Courses enrolled */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Cursos Matriculados</h3>

                {courses.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum curso matriculado</p>
                ) : (
                    <div className="space-y-3">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30"
                            >
                                <div>
                                    <p className="font-medium text-gray-200">{course.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {course.completed_lessons}/{course.lessons_count} aulas concluídas
                                    </p>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                    course.progress_percentage === 100
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-sky-500/10 text-sky-400'
                                }`}>
                                    {course.progress_percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}