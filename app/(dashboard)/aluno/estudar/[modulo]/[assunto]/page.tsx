// app/(dashboard)/aluno/estudar/[modulo]/[assunto]/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { studyModules, getQuizFeedback } from "@/utils/mock/studyMock";

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
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Assunto não encontrado
                </h1>
                <Link href="/aluno/estudar" className="text-violet-400 hover:text-violet-300">
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
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <Link
                    href={`/aluno/estudar/${moduloId}`}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm text-violet-400 hover:text-violet-300 mb-2 sm:mb-4"
                >
                    ← Voltar para {module.name}
                </Link>
                <h1 className="font-nacelle text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    {topic.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-400">{topic.description}</p>
            </div>

            {/* Tabs - Scrollable no mobile */}
            <div className="flex gap-1 sm:gap-2 border-b border-gray-700/50 overflow-x-auto pb-px -mx-4 px-4 sm:mx-0 sm:px-0">
                {[
                    { id: "videos", label: "📹 Vídeos", mobileLabel: "📹", count: topic.videos.length },
                    { id: "material", label: "📄 Material", mobileLabel: "📄", count: topic.materials.length },
                    { id: "quiz", label: "🎯 Quiz", mobileLabel: "🎯", count: 1 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                                ? "border-b-2 border-violet-500 text-white"
                                : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        <span className="sm:hidden">{tab.mobileLabel} ({tab.count})</span>
                        <span className="hidden sm:inline">{tab.label} ({tab.count})</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-4 sm:space-y-6">
                {/* Videos Tab */}
                {activeTab === "videos" && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Video Player */}
                        {selectedVideo && (
                            <div className="rounded-lg border border-gray-700/50 bg-black overflow-hidden">
                                <div className="aspect-video bg-gray-900">
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
                                <div className="p-3 sm:p-4 bg-gray-900/50 backdrop-blur">
                                    <h3 className="font-semibold text-white text-sm sm:text-base mb-1 sm:mb-2">
                                        {selectedVideo.title}
                                    </h3>
                                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
                                        <span>👤 {selectedVideo.instructor}</span>
                                        <span>⏱️ {selectedVideo.duration}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Video List */}
                        <div className="space-y-2 sm:space-y-3">
                            <h3 className="font-semibold text-white text-sm sm:text-base">
                                Todas as videoaulas
                            </h3>
                            {topic.videos.map((video) => (
                                <button
                                    key={video.id}
                                    onClick={() => setSelectedVideo(video)}
                                    className={`w-full text-left rounded-lg border p-3 sm:p-4 backdrop-blur transition-all ${
                                        selectedVideo?.id === video.id
                                            ? "border-violet-500/50 bg-violet-600/10"
                                            : "border-gray-700/50 bg-gray-900/30 hover:border-violet-500/30"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-medium text-white text-sm sm:text-base truncate">
                                                {video.title}
                                            </p>
                                            <p className="mt-0.5 sm:mt-1 text-xs text-gray-400">
                                                {video.instructor} • {video.duration}
                                            </p>
                                        </div>
                                        {selectedVideo?.id === video.id && (
                                            <span className="text-violet-400 flex-shrink-0">▶</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Material Tab */}
                {activeTab === "material" && (
                    <div className="space-y-3 sm:space-y-4">
                        {topic.materials.map((material) => (
                            <a
                                key={material.id}
                                href={material.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 sm:gap-4 rounded-lg border border-gray-700/50 bg-gray-900/30 p-3 sm:p-4 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                            >
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <span className="text-xl sm:text-2xl flex-shrink-0">{material.icon}</span>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-white text-sm sm:text-base truncate">
                                            {material.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400">{material.type}</p>
                                    </div>
                                </div>
                                <span className="text-gray-400 flex-shrink-0">→</span>
                            </a>
                        ))}
                    </div>
                )}

                {/* Quiz Tab */}
                {activeTab === "quiz" && (
                    <div className="space-y-4 sm:space-y-6">
                        {!quizStarted && !quizSubmitted ? (
                            /* Quiz Start Screen */
                            <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 p-6 sm:p-8 text-center backdrop-blur">
                                <div className="mb-4 sm:mb-6 text-4xl sm:text-5xl">🎯</div>
                                <h3 className="mb-2 sm:mb-4 text-xl sm:text-2xl font-bold text-white">
                                    Pronto para o Quiz?
                                </h3>
                                <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-400">
                                    Teste seus conhecimentos sobre "{topic.name}"
                                </p>
                                <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400">
                                    {topic.quiz?.questions.length} questões
                                </p>
                                <button
                                    onClick={() => setQuizStarted(true)}
                                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition-all hover:from-violet-500 hover:to-purple-500"
                                >
                                    Começar Quiz
                                </button>
                            </div>
                        ) : quizSubmitted ? (
                            /* Quiz Result */
                            <div
                                className={`rounded-lg border p-6 sm:p-8 text-center backdrop-blur ${
                                    quizFeedback.color === "emerald"
                                        ? "border-emerald-500/30 bg-emerald-950/20"
                                        : quizFeedback.color === "cyan"
                                            ? "border-cyan-500/30 bg-cyan-950/20"
                                            : quizFeedback.color === "yellow"
                                                ? "border-yellow-500/30 bg-yellow-950/20"
                                                : quizFeedback.color === "orange"
                                                    ? "border-orange-500/30 bg-orange-950/20"
                                                    : "border-red-500/30 bg-red-950/20"
                                }`}
                            >
                                <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl">{quizFeedback.emoji}</div>
                                <h3 className="mb-2 text-xl sm:text-2xl font-bold text-white">
                                    {quizFeedback.message}
                                </h3>
                                <p className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold text-gray-200">
                                    {quizScore} de {topic.quiz?.questions.length} corretas
                                </p>
                                <div className="mb-4 sm:mb-6 h-2 overflow-hidden rounded-full bg-gray-700 max-w-xs mx-auto">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
                                        style={{
                                            width: `${(quizScore / (topic.quiz?.questions.length || 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                                <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-300">
                                    {quizFeedback.tip}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            setQuizStarted(false);
                                            setQuizSubmitted(false);
                                            setQuizAnswers({});
                                        }}
                                        className="rounded-lg border border-gray-700/50 px-4 sm:px-6 py-2 text-sm font-medium text-gray-200 transition-all hover:border-violet-500/50 hover:bg-gray-900/50"
                                    >
                                        Refazer Quiz
                                    </button>
                                    <Link
                                        href={`/aluno/estudar/${moduloId}`}
                                        className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 sm:px-6 py-2 text-sm font-medium text-white transition-all hover:from-violet-500 hover:to-purple-500"
                                    >
                                        Voltar aos Assuntos
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            /* Quiz Questions */
                            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                                {topic.quiz?.questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6 backdrop-blur"
                                    >
                                        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
                                            <h4 className="font-semibold text-white text-sm sm:text-base">
                                                Questão {index + 1}/{topic.quiz?.questions.length}
                                            </h4>
                                            <div className="h-1.5 sm:h-2 w-16 sm:w-24 overflow-hidden rounded-full bg-gray-700">
                                                <div
                                                    className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
                                                    style={{
                                                        width: `${((index + 1) / (topic.quiz?.questions.length || 1)) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <p className="mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg text-white">
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
                                                    className={`w-full rounded-lg border-2 p-2.5 sm:p-3 text-left transition-all text-sm sm:text-base ${
                                                        quizAnswers[question.id] === option.id
                                                            ? "border-violet-500 bg-violet-600/20"
                                                            : "border-gray-700/50 bg-gray-900/50 hover:border-gray-600"
                                                    }`}
                                                >
                                                    <span className="font-medium">{option.text}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => setQuizSubmitted(true)}
                                    disabled={Object.keys(quizAnswers).length !== topic.quiz?.questions.length}
                                    className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition-all hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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