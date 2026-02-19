// app/(dashboard)/aluno/estudar/[modulo]/[aula]/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Video,
    FileText,
    PenTool,
    HelpCircle,
    CheckCircle,
    Circle,
    Loader2,
    AlertCircle,
    RotateCcw,
    BookOpen,
    Clock,
    ChevronLeft,
    ChevronRight,
    Paperclip,
    StickyNote,
    ArrowLeft,
    X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLessons } from '@/hooks/useStudentLessons';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { useLessonMaterials } from '@/hooks/useLessonMaterials';
import { useLessonNote } from '@/hooks/useLessonNote';
import { NoteSidePanel } from '@/components/student/notes/NoteSidePanel';
import MaterialsList from '@/components/aluno/MaterialsList';
import type { StudentLesson, QuizQuestion } from '@/lib/types/database';

interface ColorClasses {
    border: string;
    bg: string;
    icon: string;
    text: string;
    bar: string;
}

const quizColorClasses: Record<string, ColorClasses> = {
    emerald: {
        border: "border-emerald-500/20",
        bg: "bg-emerald-950/20",
        icon: "bg-emerald-500/10",
        text: "text-emerald-400",
        bar: "bg-emerald-500",
    },
    sky: {
        border: "border-sky-500/20",
        bg: "bg-sky-950/20",
        icon: "bg-sky-500/10",
        text: "text-sky-400",
        bar: "bg-sky-500",
    },
    amber: {
        border: "border-amber-500/20",
        bg: "bg-amber-950/20",
        icon: "bg-amber-500/10",
        text: "text-amber-400",
        bar: "bg-amber-500",
    },
    rose: {
        border: "border-rose-500/20",
        bg: "bg-rose-950/20",
        icon: "bg-rose-500/10",
        text: "text-rose-400",
        bar: "bg-rose-500",
    },
};

export default function AulaPage() {
    const params = useParams();
    const moduloId = params?.modulo as string;
    const aulaId = params?.aula as string;
    const { user } = useAuth();

    const { lessons, module, isLoading, error, refetch } = useStudentLessons(moduloId, user?.id || null);
    const { markAsComplete, saveQuizResult, isLoading: savingProgress } = useStudentProgress();
    const { materials, isLoading: loadingMaterials, incrementDownload } = useLessonMaterials(aulaId);

    const [activeTab, setActiveTab] = useState<'content' | 'materials'>('content');
    const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);

    const currentIndex = lessons.findIndex((l: StudentLesson) => l.id === aulaId);
    const lesson = lessons[currentIndex];
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

    const {
        note,
        isLoading: isLoadingNote,
        isSaving: isSavingNote,
        lastSavedAt,
        saveNote,
        deleteNote: deleteNoteAction,
    } = useLessonNote({
        studentId: user?.id || '',
        lessonId: aulaId,
        moduleId: moduloId,
        courseId: module?.course_id || '',
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400 text-sm">Carregando aula...</p>
                </div>
            </div>
        );
    }

    if (error || !lesson || !module) {
        return (
            <div className="space-y-4">
                <Link
                    href={`/aluno/estudar/${moduloId}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar
                </Link>
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-300 font-medium mb-1">Aula não encontrada</p>
                        <p className="text-gray-500 text-sm">{error || 'Verifique se o link está correto'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleMarkComplete = async () => {
        if (!user?.id) return;
        const result = await markAsComplete({ lessonId: lesson.id, studentId: user.id });
        if (result.success) refetch();
    };

    const handleQuizComplete = async (score: number, total: number, answers: Record<string, string>) => {
        if (!user?.id) return;
        const result = await saveQuizResult({ lessonId: lesson.id, studentId: user.id, score, total, answers });
        if (result.success) refetch();
    };

    const hasMaterials = materials.length > 0 || loadingMaterials;

    return (
        <div className="relative">
            <div className={`transition-all duration-300 ${isNotesOpen ? 'lg:mr-96' : ''}`}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm overflow-x-auto pb-2 flex-1 min-w-0">
                            <Link
                                href="/aluno/estudar"
                                className="text-gray-500 hover:text-sky-400 transition-colors flex-shrink-0"
                            >
                                Estudar
                            </Link>
                            <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0" strokeWidth={1.5} />
                            <Link
                                href={`/aluno/estudar/${moduloId}`}
                                className="text-gray-500 hover:text-sky-400 transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                            >
                                {module.name}
                            </Link>
                            <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0" strokeWidth={1.5} />
                            <span className="text-gray-300 truncate max-w-[120px] sm:max-w-[250px]">{lesson.title}</span>
                        </div>

                        <button
                            onClick={() => setIsNotesOpen((prev) => !prev)}
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-sm font-medium"
                        >
                            {isNotesOpen ? (
                                <X className="h-4 w-4" strokeWidth={1.5} />
                            ) : (
                                <StickyNote className="h-4 w-4" strokeWidth={1.5} />
                            )}

                            <span className="hidden sm:inline">
        {isNotesOpen ? 'Fechar' : 'Anotações'}
    </span>
                        </button>
                    </div>

                    {hasMaterials && (
                        <div className="flex gap-1 border-b border-gray-800/50 overflow-x-auto pb-px -mx-4 px-4 sm:mx-0 sm:px-0">
                            <button
                                onClick={() => setActiveTab('content')}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                                    activeTab === 'content'
                                        ? "border-b-2 border-sky-500 text-white"
                                        : "text-gray-500 hover:text-gray-300"
                                }`}
                            >
                                {lesson.type === 'VIDEO' && <Video className="h-4 w-4" strokeWidth={1.5} />}
                                {lesson.type === 'ARTICLE' && <FileText className="h-4 w-4" strokeWidth={1.5} />}
                                {lesson.type === 'EXERCISE' && <PenTool className="h-4 w-4" strokeWidth={1.5} />}
                                {lesson.type === 'QUIZ' && <HelpCircle className="h-4 w-4" strokeWidth={1.5} />}
                                Conteúdo
                            </button>
                            <button
                                onClick={() => setActiveTab('materials')}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                                    activeTab === 'materials'
                                        ? "border-b-2 border-sky-500 text-white"
                                        : "text-gray-500 hover:text-gray-300"
                                }`}
                            >
                                <Paperclip className="h-4 w-4" strokeWidth={1.5} />
                                Materiais
                                {materials.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-sky-500/10 text-sky-400">
                                        {materials.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    {activeTab === 'content' ? (
                        <>
                            {lesson.type === 'VIDEO' && (
                                <VideoContent
                                    lesson={lesson}
                                    onComplete={handleMarkComplete}
                                    isCompleted={lesson.is_completed || false}
                                    isSaving={savingProgress}
                                />
                            )}
                            {lesson.type === 'ARTICLE' && (
                                <ArticleContent
                                    lesson={lesson}
                                    onComplete={handleMarkComplete}
                                    isCompleted={lesson.is_completed || false}
                                    isSaving={savingProgress}
                                />
                            )}
                            {lesson.type === 'EXERCISE' && (
                                <ExerciseContent
                                    lesson={lesson}
                                    onComplete={handleMarkComplete}
                                    isCompleted={lesson.is_completed || false}
                                    isSaving={savingProgress}
                                />
                            )}
                            {lesson.type === 'QUIZ' && (
                                <QuizContent
                                    lesson={lesson}
                                    onComplete={handleQuizComplete}
                                    isCompleted={lesson.is_completed || false}
                                    isSaving={savingProgress}
                                />
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Paperclip className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                                Materiais da Aula
                            </h2>
                            <MaterialsList
                                materials={materials}
                                isLoading={loadingMaterials}
                                onDownload={incrementDownload}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                        {prevLesson ? (
                            <Link
                                href={`/aluno/estudar/${moduloId}/${prevLesson.id}`}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                                <span className="hidden sm:inline">Anterior:</span>
                                <span className="truncate max-w-[100px] sm:max-w-[150px]">{prevLesson.title}</span>
                            </Link>
                        ) : (
                            <div />
                        )}
                        {nextLesson ? (
                            <Link
                                href={`/aluno/estudar/${moduloId}/${nextLesson.id}`}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                            >
                                <span className="hidden sm:inline">Próxima:</span>
                                <span className="truncate max-w-[100px] sm:max-w-[150px]">{nextLesson.title}</span>
                                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                            </Link>
                        ) : (
                            <Link
                                href={`/aluno/estudar/${moduloId}`}
                                className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                Voltar ao módulo
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <NoteSidePanel
                isOpen={isNotesOpen}
                lessonTitle={lesson.title}
                noteContent={note?.content || ''}
                isSaving={isSavingNote}
                isLoading={isLoadingNote}
                lastSavedAt={lastSavedAt}
                onContentChange={saveNote}
                onDelete={deleteNoteAction}
                onClose={() => setIsNotesOpen(false)}
            />
        </div>
    );
}

function VideoContent({
                          lesson,
                          onComplete,
                          isCompleted,
                          isSaving,
                      }: {
    lesson: StudentLesson;
    onComplete: () => void;
    isCompleted: boolean;
    isSaving: boolean;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 flex-shrink-0">
                    <Video className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                            Vídeo
                        </span>
                        {lesson.duration && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" strokeWidth={1.5} />
                                {lesson.duration}
                            </span>
                        )}
                        {isCompleted && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                                Concluído
                            </span>
                        )}
                    </div>
                    <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                        {lesson.title}
                    </h1>
                    {lesson.description && (
                        <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                    )}
                </div>
            </div>

            {lesson.youtube_id ? (
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 overflow-hidden">
                    <div className="aspect-video bg-black">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${lesson.youtube_id}`}
                            title={lesson.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-12 text-center">
                    <Video className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Vídeo não disponível</p>
                </div>
            )}

            {!isCompleted && (
                <button
                    onClick={onComplete}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    ) : (
                        <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    )}
                    Marcar como concluído
                </button>
            )}
        </div>
    );
}

function ArticleContent({
                            lesson,
                            onComplete,
                            isCompleted,
                            isSaving,
                        }: {
    lesson: StudentLesson;
    onComplete: () => void;
    isCompleted: boolean;
    isSaving: boolean;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 flex-shrink-0">
                    <FileText className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-sky-500/10 text-sky-400">
                            Artigo
                        </span>
                        {isCompleted && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                                Concluído
                            </span>
                        )}
                    </div>
                    <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                        {lesson.title}
                    </h1>
                    {lesson.description && (
                        <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 lg:p-8">
                {lesson.content ? (
                    <div className="prose prose-invert prose-sky max-w-none">
                        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm sm:text-base">
                            {lesson.content}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-400">Conteúdo não disponível</p>
                    </div>
                )}
            </div>

            {!isCompleted && (
                <button
                    onClick={onComplete}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    ) : (
                        <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    )}
                    Marcar como concluído
                </button>
            )}
        </div>
    );
}

function ExerciseContent({
                             lesson,
                             onComplete,
                             isCompleted,
                             isSaving,
                         }: {
    lesson: StudentLesson;
    onComplete: () => void;
    isCompleted: boolean;
    isSaving: boolean;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 flex-shrink-0">
                    <PenTool className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400">
                            Exercício
                        </span>
                        {isCompleted && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                                Concluído
                            </span>
                        )}
                    </div>
                    <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                        {lesson.title}
                    </h1>
                    {lesson.description && (
                        <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4 sm:p-6 lg:p-8">
                <h3 className="font-semibold text-amber-300 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" strokeWidth={1.5} />
                    Instruções do Exercício
                </h3>
                {lesson.content ? (
                    <div className="whitespace-pre-wrap text-amber-100/80 leading-relaxed text-sm sm:text-base">
                        {lesson.content}
                    </div>
                ) : (
                    <p className="text-amber-100/60">Nenhuma instrução disponível</p>
                )}
            </div>

            {!isCompleted && (
                <button
                    onClick={onComplete}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    ) : (
                        <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    )}
                    Marcar como concluído
                </button>
            )}
        </div>
    );
}

function QuizContent({
                         lesson,
                         onComplete,
                         isCompleted,
                         isSaving,
                     }: {
    lesson: StudentLesson;
    onComplete: (score: number, total: number, answers: Record<string, string>) => void;
    isCompleted: boolean;
    isSaving: boolean;
}) {
    const [quizStarted, setQuizStarted] = useState<boolean>(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

    const questions = (lesson.quiz_data as QuizQuestion[]) || [];
    const totalQuestions = questions.length;

    const previousScore = lesson.progress?.quiz_score;
    const previousTotal = lesson.progress?.quiz_total;

    const calculateScore = (): number => {
        return questions.filter((q: QuizQuestion) => {
            const correctOption = q.options.find((o) => o.correct);
            return quizAnswers[q.id] === correctOption?.id;
        }).length;
    };

    const currentScore = calculateScore();

    const getFeedback = (score: number, total: number) => {
        const percentage = (score / total) * 100;
        if (percentage === 100) return { message: "Perfeito! Você dominou esse assunto!", color: "emerald", tip: "Continue assim!" };
        if (percentage >= 80) return { message: "Excelente desempenho!", color: "sky", tip: "Revise apenas os pontos que errou." };
        if (percentage >= 60) return { message: "Bom trabalho!", color: "amber", tip: "Revise o material e tente novamente." };
        if (percentage >= 40) return { message: "Continue estudando!", color: "amber", tip: "Estude o assunto novamente." };
        return { message: "Precisa de mais prática.", color: "rose", tip: "Revise completamente o material." };
    };

    const getColorClasses = (color: string): ColorClasses => {
        return quizColorClasses[color] || quizColorClasses.sky;
    };

    const handleSubmit = () => {
        setQuizSubmitted(true);
        onComplete(currentScore, totalQuestions, quizAnswers);
    };

    const handleRetry = () => {
        setQuizStarted(false);
        setQuizSubmitted(false);
        setQuizAnswers({});
    };

    if (questions.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 flex-shrink-0">
                        <HelpCircle className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                            {lesson.title}
                        </h1>
                    </div>
                </div>
                <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <HelpCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhuma pergunta configurada para este quiz</p>
                </div>
            </div>
        );
    }

    if (isCompleted && !quizStarted && previousScore !== null && previousScore !== undefined) {
        const feedback = getFeedback(previousScore, previousTotal || totalQuestions);
        const colors = getColorClasses(feedback.color);

        return (
            <div className="space-y-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 flex-shrink-0">
                        <HelpCircle className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400">
                                Quiz
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                                Concluído
                            </span>
                        </div>
                        <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                            {lesson.title}
                        </h1>
                    </div>
                </div>

                <div className={`rounded-lg border ${colors.border} ${colors.bg} p-6 sm:p-8 text-center`}>
                    <div className="mb-6 flex justify-center">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${colors.icon}`}>
                            <CheckCircle className={`h-8 w-8 ${colors.text}`} strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-white">Sua última pontuação</h3>
                    <p className="mb-4 text-3xl font-bold text-gray-100">
                        {previousScore} de {previousTotal || totalQuestions}
                    </p>
                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-800 max-w-xs mx-auto">
                        <div
                            className={`h-full ${colors.bar}`}
                            style={{ width: `${(previousScore / (previousTotal || totalQuestions)) * 100}%` }}
                        />
                    </div>
                    <p className="mb-6 text-sm text-gray-400">{feedback.message}</p>
                    <button
                        onClick={() => setQuizStarted(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
                    >
                        <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                        Refazer Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (!quizStarted && !quizSubmitted) {
        return (
            <div className="space-y-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 flex-shrink-0">
                        <HelpCircle className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400">
                                Quiz
                            </span>
                        </div>
                        <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                            {lesson.title}
                        </h1>
                        {lesson.description && (
                            <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-violet-500/20 bg-violet-950/20 p-6 sm:p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                            <HelpCircle className="h-8 w-8 text-violet-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-white">Pronto para o Quiz?</h3>
                    <p className="mb-2 text-sm text-gray-400">Teste seus conhecimentos</p>
                    <p className="mb-6 text-xs text-gray-500">
                        {totalQuestions} {totalQuestions === 1 ? 'questão' : 'questões'}
                    </p>
                    <button
                        onClick={() => setQuizStarted(true)}
                        className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
                    >
                        Começar Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (quizSubmitted) {
        const feedback = getFeedback(currentScore, totalQuestions);
        const colors = getColorClasses(feedback.color);

        return (
            <div className="space-y-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 flex-shrink-0">
                        <HelpCircle className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                            {lesson.title}
                        </h1>
                    </div>
                </div>

                <div className={`rounded-lg border ${colors.border} ${colors.bg} p-6 sm:p-8 text-center`}>
                    <div className="mb-6 flex justify-center">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${colors.icon}`}>
                            <CheckCircle className={`h-8 w-8 ${colors.text}`} strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-white">{feedback.message}</h3>
                    <p className="mb-4 text-3xl font-bold text-gray-100">
                        {currentScore} de {totalQuestions}
                    </p>
                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-800 max-w-xs mx-auto">
                        <div
                            className={`h-full ${colors.bar}`}
                            style={{ width: `${(currentScore / totalQuestions) * 100}%` }}
                        />
                    </div>
                    <p className="mb-6 text-sm text-gray-400">{feedback.tip}</p>
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
                    >
                        <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                        Refazer Quiz
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 flex-shrink-0">
                    <HelpCircle className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400">
                            Quiz
                        </span>
                        <span className="text-xs text-gray-500">
                            {Object.keys(quizAnswers).length}/{totalQuestions} respondidas
                        </span>
                    </div>
                    <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                        {lesson.title}
                    </h1>
                </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
                {questions.map((question: QuizQuestion, index: number) => (
                    <div
                        key={question.id}
                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-5"
                    >
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <h4 className="font-medium text-gray-300 text-sm">
                                Questão {index + 1} de {totalQuestions}
                            </h4>
                            <div className="h-1.5 w-16 sm:w-20 overflow-hidden rounded-full bg-gray-800">
                                <div
                                    className="h-full bg-violet-500"
                                    style={{ width: `${((index + 1) / totalQuestions) * 100}%` }}
                                />
                            </div>
                        </div>

                        <p className="mb-4 text-white text-sm sm:text-base">{question.question}</p>

                        <div className="space-y-2">
                            {question.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() =>
                                        setQuizAnswers({
                                            ...quizAnswers,
                                            [question.id]: option.id,
                                        })
                                    }
                                    className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all text-sm ${
                                        quizAnswers[question.id] === option.id
                                            ? "border-violet-500 bg-violet-500/10"
                                            : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
                                    }`}
                                >
                                    {quizAnswers[question.id] === option.id ? (
                                        <CheckCircle className="h-4 w-4 text-violet-400 flex-shrink-0" strokeWidth={1.5} />
                                    ) : (
                                        <Circle className="h-4 w-4 text-gray-600 flex-shrink-0" strokeWidth={1.5} />
                                    )}
                                    <span className="text-gray-200">{option.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                disabled={Object.keys(quizAnswers).length !== totalQuestions || isSaving}
                className="w-full rounded-lg bg-violet-600 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
                Enviar Quiz ({Object.keys(quizAnswers).length}/{totalQuestions} respondidas)
            </button>
        </div>
    );
}