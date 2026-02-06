// components/admin/EnrollmentManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, GraduationCap, Plus, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { useEnrollments, EnrollmentWithCourse } from '@/hooks/useEnrollments';
import { useCourses } from '@/hooks/useCourses';

interface EnrollmentManagerProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
        id: string;
        name: string;
        email: string;
    };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    COMPLETED: { label: 'Concluído', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    DROPPED: { label: 'Desistente', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    SUSPENDED: { label: 'Suspenso', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
};

export default function EnrollmentManager({ isOpen, onClose, student }: EnrollmentManagerProps) {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [isEnrolling, setIsEnrolling] = useState(false);

    const { enrollments, isLoading, enrollStudent, unenrollStudent, refetch } = useEnrollments(student.id);
    const { courses } = useCourses();

    // Filtrar cursos disponíveis (que o aluno ainda não está matriculado)
    const enrolledCourseIds = (enrollments as EnrollmentWithCourse[]).map(e => e.course_id);
    const availableCourses = courses.filter(
        c => !enrolledCourseIds.includes(c.id) && c.status === 'ACTIVE'
    );

    // Reset ao abrir
    useEffect(() => {
        if (isOpen) {
            setSelectedCourseId('');
            refetch();
        }
    }, [isOpen, refetch]);

    const handleEnroll = async () => {
        if (!selectedCourseId) return;

        setIsEnrolling(true);
        const success = await enrollStudent(student.id, selectedCourseId);
        setIsEnrolling(false);

        if (success) {
            setSelectedCourseId('');
        }
    };

    const handleUnenroll = async (enrollmentId: string) => {
        if (confirm('Tem certeza que deseja cancelar esta matrícula?')) {
            await unenrollStudent(enrollmentId);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <GraduationCap className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Matrículas</h2>
                            <p className="text-sm text-gray-400">{student.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Adicionar nova matrícula */}
                    <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg space-y-3">
                        <label className="text-sm font-medium text-gray-300">
                            Matricular em novo curso
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                            >
                                <option value="">Selecione um curso...</option>
                                {availableCourses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleEnroll}
                                disabled={!selectedCourseId || isEnrolling}
                                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                {isEnrolling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                ) : (
                                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                                )}
                                Matricular
                            </button>
                        </div>
                        {availableCourses.length === 0 && (
                            <p className="text-xs text-gray-500">
                                Não há cursos disponíveis para matrícula.
                            </p>
                        )}
                    </div>

                    {/* Lista de matrículas */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-3">
                            Cursos matriculados ({enrollments.length})
                        </h3>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                            </div>
                        ) : enrollments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-gray-700 rounded-lg">
                                <BookOpen className="h-10 w-10 text-gray-600" strokeWidth={1.5} />
                                <p className="mt-2 text-gray-400">Nenhuma matrícula encontrada</p>
                                <p className="text-sm text-gray-500">Matricule o aluno em um curso acima</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {(enrollments as EnrollmentWithCourse[]).map((enrollment) => {
                                    const statusConfig = STATUS_LABELS[enrollment.status] || STATUS_LABELS.ACTIVE;

                                    return (
                                        <div
                                            key={enrollment.id}
                                            className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-white">
                                                    {enrollment.course?.name || 'Curso removido'}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                                                    <span className="text-xs text-gray-500">
                            Desde {new Date(enrollment.enrollment_date).toLocaleDateString('pt-BR')}
                          </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUnenroll(enrollment.id)}
                                                className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                title="Cancelar matrícula"
                                            >
                                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}