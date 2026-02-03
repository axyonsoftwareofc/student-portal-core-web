// app/(dashboard)/aluno/estudar/[modulo]/[assunto]/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { studyModules, getQuizFeedback } from "@/utils/mock/studyMock";
import {
    ArrowLeft,
    Play,
    FileText,
    ExternalLink,
    Code,
    File,
    User,
    Clock,
    ArrowRight,
    RotateCcw,
    CheckCircle,
    Circle
} from "lucide-react";

// Helper para ícone baseado no tipo de material
function getMaterialIcon(type: string) {
    switch (type) {
        case 'PDF':
            return FileText;
        case 'Link':
            return ExternalLink;
        case 'GitHub':
            return Code;
        default:
            return File;
    }
}

export default function AssuntoPage() {
    const params = useParams();
    const moduloId = params?.modulo as string;
    const assuntoId = params?.assunto as string;

    const module = studyModules.find((m) => m.id === moduloId);
    const topic = module?.topics.find((t) => t.id === assuntoId);

    const [activeTab, setActiveTab] = useState<"videos" | "material" | "quiz">("videos");
    const [selectedVideo, setSelectedVideo] = useState(topic?.videos[0]);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    if (!module || !topic) {
        return (
            <div className="text-center py-12">
                <h1 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                    Assunto não encontrado
                </h1>
                <Link href="/aluno/estudar" className="text-sky-400 hover:text-sky-300">
                    ← Voltar
                </Link>
            </div>
        );
    }

    const calculateQuizScore = () => {
        if (!topic.quiz) return 0;
        const correct = topic.quiz.questions.filter(
            (q) => quizAnswers[q.id] === q.options.find((o) => o.correct)?.id
        ).length;
        return correct;
    };

    const quizScore = calculateQuizScore();
    const quizFeedback = getQuizFeedback(quizScore, topic.quiz?.questions.length || 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
                <Link
                    href={`/aluno/estudar/${moduloId}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar para {module.name}
                </Link>
                <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                    {topic.name}
                </h1>
                <p className="text-sm text-gray-500">{topic.description}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-800/50 overflow-x-auto pb-px -mx-4 px-4 sm:mx-0 sm:px-0">
                {[
                    { id: "videos", label: "Vídeos", count: topic.videos.length },
                    { id: "material", label: "Material", count: topic.materials.length },
                    { id: "quiz", label: "Quiz", count: 1 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex-shrink-0 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                                ? "border-b-2 border-sky-500 text-white"
                                : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {/* Videos Tab */}
                {activeTab === "videos" && (
                    <div className="space-y-6">
                        {/* Video Player */}
                        {selectedVideo && (
                            <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 overflow-hidden">
                                <div className="aspect-video bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                                        title={selectedVideo.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                                <div className="p-4 border-t border-gray-800/50">
                                    <h3 className="font-medium text-white text-sm sm:text-base mb-2">
                                        {selectedVideo.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {selectedVideo.instructor}
                    </span>
                                        <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                                            {selectedVideo.duration}
                    </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Video List */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-300 text-sm">
                                Todas as videoaulas
                            </h3>
                            {topic.videos.map((video) => (
                                <button
                                    key={video.id}
                                    onClick={() => setSelectedVideo(video)}
                                    className={`w-full text-left rounded-lg border p-4 transition-all ${
                                        selectedVideo?.id === video.id
                                            ? "border-sky-500/50 bg-sky-500/5"
                                            : "border-gray-800/50 bg-gray-900/30 hover:border-gray-700"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                selectedVideo?.id === video.id
                                                    ? 'bg-sky-500/10 text-sky-400'
                                                    : 'bg-gray-800 text-gray-500'
                                            }`}>
                                                <Play className="h-4 w-4" strokeWidth={1.5} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-200 text-sm truncate">
                                                    {video.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {video.instructor} • {video.duration}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedVideo?.id === video.id && (
                                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-sky-400" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Material Tab */}
                {activeTab === "material" && (
                    <div className="space-y-3">
                        {topic.materials.map((material) => {
                            const Icon = getMaterialIcon(material.type);
                            return (
                                <a
                                    key={material.id}
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-4 rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                                            <Icon className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-200 text-sm truncate">
                                                {material.title}
                                            </p>
                                            <p className="text-xs text-gray-500">{material.type}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-600 flex-shrink-0" strokeWidth={1.5} />
                                </a>
                            );
                        })}
                    </div>
                )}

                {/* Quiz Tab */}
                {activeTab === "quiz" && (
                    <div className="space-y-6">
                        {!quizStarted && !quizSubmitted ? (
                            /* Quiz Start Screen */
                            <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-8 text-center">
                                <div className="mb-6 flex justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10">
                                        <CheckCircle className="h-8 w-8 text-sky-400" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-white">
                                    Pronto para o Quiz?
                                </h3>
                                <p className="mb-2 text-sm text-gray-400">
                                    Teste seus conhecimentos sobre "{topic.name}"
                                </p>
                                <p className="mb-6 text-xs text-gray-500">
                                    {topic.quiz?.questions.length} questões
                                </p>
                                <button
                                    onClick={() => setQuizStarted(true)}
                                    className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
                                >
                                    Começar Quiz
                                </button>
                            </div>
                        ) : quizSubmitted ? (
                            /* Quiz Result */
                            <div
                                className={`rounded-lg border p-8 text-center ${
                                    quizFeedback.color === "emerald"
                                        ? "border-emerald-500/20 bg-emerald-950/20"
                                        : quizFeedback.color === "sky"
                                            ? "border-sky-500/20 bg-sky-950/20"
                                            : quizFeedback.color === "amber"
                                                ? "border-amber-500/20 bg-amber-950/20"
                                                : "border-rose-500/20 bg-rose-950/20"
                                }`}
                            >
                                <div className="mb-6 flex justify-center">
                                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                                        quizFeedback.color === "emerald" ? "bg-emerald-500/10" :
                                            quizFeedback.color === "sky" ? "bg-sky-500/10" :
                                                quizFeedback.color === "amber" ? "bg-amber-500/10" :
                                                    "bg-rose-500/10"
                                    }`}>
                                        <CheckCircle className={`h-8 w-8 ${
                                            quizFeedback.color === "emerald" ? "text-emerald-400" :
                                                quizFeedback.color === "sky" ? "text-sky-400" :
                                                    quizFeedback.color === "amber" ? "text-amber-400" :
                                                        "text-rose-400"
                                        }`} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-white">
                                    {quizFeedback.message}
                                </h3>
                                <p className="mb-4 text-lg font-medium text-gray-300">
                                    {quizScore} de {topic.quiz?.questions.length} corretas
                                </p>
                                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-800 max-w-xs mx-auto">
                                    <div
                                        className={`h-full ${
                                            quizFeedback.color === "emerald" ? "bg-emerald-500" :
                                                quizFeedback.color === "sky" ? "bg-sky-500" :
                                                    quizFeedback.color === "amber" ? "bg-amber-500" :
                                                        "bg-rose-500"
                                        }`}
                                        style={{
                                            width: `${(quizScore / (topic.quiz?.questions.length || 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                                <p className="mb-6 text-sm text-gray-400">
                                    {quizFeedback.tip}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => {
                                            setQuizStarted(false);
                                            setQuizSubmitted(false);
                                            setQuizAnswers({});
                                        }}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
                                    >
                                        <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                                        Refazer Quiz
                                    </button>
                                    <Link
                                        href={`/aluno/estudar/${moduloId}`}
                                        className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
                                    >
                                        Voltar aos Assuntos
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            /* Quiz Questions */
                            <div className="space-y-6">
                                {topic.quiz?.questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5"
                                    >
                                        <div className="mb-4 flex items-center justify-between gap-2">
                                            <h4 className="font-medium text-gray-300 text-sm">
                                                Questão {index + 1} de {topic.quiz?.questions.length}
                                            </h4>
                                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-800">
                                                <div
                                                    className="h-full bg-sky-500"
                                                    style={{
                                                        width: `${((index + 1) / (topic.quiz?.questions.length || 1)) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <p className="mb-4 text-white">
                                            {question.question}
                                        </p>

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
                                                            ? "border-sky-500 bg-sky-500/10"
                                                            : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
                                                    }`}
                                                >
                                                    {quizAnswers[question.id] === option.id ? (
                                                        <CheckCircle className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                                                    ) : (
                                                        <Circle className="h-4 w-4 text-gray-600 flex-shrink-0" strokeWidth={1.5} />
                                                    )}
                                                    <span className="text-gray-200">{option.text}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => setQuizSubmitted(true)}
                                    disabled={Object.keys(quizAnswers).length !== topic.quiz?.questions.length}
                                    className="w-full rounded-lg bg-sky-600 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Enviar Quiz ({Object.keys(quizAnswers).length}/{topic.quiz?.questions.length} respondidas)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}