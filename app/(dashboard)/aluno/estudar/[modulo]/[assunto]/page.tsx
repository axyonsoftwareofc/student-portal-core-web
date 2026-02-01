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

    const [activeTab, setActiveTab] = useState<"videos" | "material" | "quiz">(
        "videos"
    );
    const [selectedVideo, setSelectedVideo] = useState(topic?.videos[0]);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    if (!module || !topic) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-white mb-2">Assunto não encontrado</h1>
                <Link href="/aluno/estudar" className="text-violet-400 hover:text-violet-300">
                    ← Voltar
                </Link>
            </div>
        );
    }

    // Calcula score do quiz
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
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <Link
                    href={`/aluno/estudar/${moduloId}`}
                    className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 mb-4"
                >
                    ← Voltar para {module.name}
                </Link>
                <h1 className="font-nacelle text-3xl font-bold text-white">
                    {topic.name}
                </h1>
                <p className="text-gray-400">{topic.description}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-700/50">
                {[
                    { id: "videos", label: "📹 Videoaulas", count: topic.videos.length },
                    {
                        id: "material",
                        label: "📄 Material",
                        count: topic.materials.length,
                    },
                    { id: "quiz", label: "🎯 Quiz", count: 1 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-3 font-medium text-sm transition-colors ${
                            activeTab === tab.id
                                ? "border-b-2 border-violet-500 text-white"
                                : "text-gray-400 hover:text-gray-200"
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
                            <div className="rounded-lg border border-gray-700/50 bg-black overflow-hidden">
                                <div className="aspect-video bg-gray-900 flex items-center justify-center">
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
                                <div className="p-4 bg-gray-900/50 backdrop-blur">
                                    <h3 className="font-semibold text-white mb-2">
                                        {selectedVideo.title}
                                    </h3>
                                    <div className="flex items-center justify-between text-sm text-gray-400">
                                        <span>👤 {selectedVideo.instructor}</span>
                                        <span>⏱️ {selectedVideo.duration}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Video List */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-white">Todas as videoaulas</h3>
                            {topic.videos.map((video) => (
                                <button
                                    key={video.id}
                                    onClick={() => setSelectedVideo(video)}
                                    className={`w-full text-left rounded-lg border p-4 backdrop-blur transition-all ${
                                        selectedVideo?.id === video.id
                                            ? "border-violet-500/50 bg-violet-600/10"
                                            : "border-gray-700/50 bg-gray-900/30 hover:border-violet-500/30"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-white">{video.title}</p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {video.instructor} • {video.duration}
                                            </p>
                                        </div>
                                        {selectedVideo?.id === video.id && (
                                            <span className="text-violet-400">▶</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Material Tab */}
                {activeTab === "material" && (
                    <div className="space-y-4">
                        {topic.materials.map((material) => (
                            <a
                                key={material.id}
                                href={material.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{material.icon}</span>
                                        <div>
                                            <p className="font-semibold text-white">{material.title}</p>
                                            <p className="mt-1 text-xs text-gray-400">{material.type}</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {/* Quiz Tab */}
                {activeTab === "quiz" && (
                    <div className="space-y-6">
                        {!quizStarted && !quizSubmitted ? (
                            <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 p-8 text-center backdrop-blur">
                                <h3 className="mb-4 text-2xl font-bold text-white">
                                    Pronto para o Quiz?
                                </h3>
                                <p className="mb-6 text-gray-400">
                                    Teste seus conhecimentos sobre "{topic.name}"
                                </p>
                                <div className="mb-6 text-4xl">🎯</div>
                                <p className="mb-6 text-sm text-gray-400">
                                    {topic.quiz?.questions.length} questões de múltipla escolha
                                </p>
                                <button
                                    onClick={() => setQuizStarted(true)}
                                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-3 font-semibold text-white transition-all hover:from-violet-500 hover:to-purple-500"
                                >
                                    Começar Quiz
                                </button>
                            </div>
                        ) : quizSubmitted ? (
                            // Resultado
                            <div
                                className={`rounded-lg border p-8 text-center backdrop-blur ${
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
                                <div className="mb-4 text-5xl">{quizFeedback.emoji}</div>
                                <h3 className="mb-2 text-2xl font-bold text-white">
                                    {quizFeedback.message}
                                </h3>
                                <p className="mb-6 text-lg font-semibold text-gray-200">
                                    {quizScore} de {topic.quiz?.questions.length} corretas
                                </p>
                                <div className="mb-6 h-2 overflow-hidden rounded-full bg-gray-700">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
                                        style={{
                                            width: `${(quizScore / (topic.quiz?.questions.length || 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                                <p className="mb-6 text-gray-300">{quizFeedback.tip}</p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            setQuizStarted(false);
                                            setQuizSubmitted(false);
                                            setQuizAnswers({});
                                        }}
                                        className="rounded-lg border border-gray-700/50 px-6 py-2 font-medium text-gray-200 transition-all hover:border-violet-500/50 hover:bg-gray-900/50"
                                    >
                                        Refazer Quiz
                                    </button>
                                    <Link
                                        href={`/aluno/estudar/${moduloId}`}
                                        className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2 font-medium text-white transition-all hover:from-violet-500 hover:to-purple-500"
                                    >
                                        Voltar aos Assuntos
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            // Quiz em progresso
                            <div className="space-y-8">
                                {topic.quiz?.questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6 backdrop-blur"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="font-semibold text-white">
                                                Questão {index + 1} de {topic.quiz?.questions.length}
                                            </h4>
                                            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-700">
                                                <div
                                                    className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
                                                    style={{
                                                        width: `${((index + 1) / (topic.quiz?.questions.length || 1)) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <p className="mb-4 text-lg text-white">{question.question}</p>

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
                                                    className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
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
                                    className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-3 font-semibold text-white transition-all hover:from-violet-500 hover:to-purple-500"
                                >
                                    Enviar Quiz
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}