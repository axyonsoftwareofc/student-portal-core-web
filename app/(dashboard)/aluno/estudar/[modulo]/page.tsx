// app/(dashboard)/aluno/estudar/[modulo]/page.tsx
'use client';

import { useParams } from "next/navigation";
import Link from "next/link";
import { studyModules } from "@/utils/mock/studyMock";
import { ArrowLeft, CheckCircle, Clock, Lock, Play, FileText, Target, ArrowRight } from "lucide-react";

export default function ModuloPage() {
    const params = useParams();
    const moduloId = params?.modulo as string;

    const module = studyModules.find((m) => m.id === moduloId);

    if (!module) {
        return (
            <div className="text-center py-12">
                <h1 className="text-xl font-semibold text-white mb-2">
                    Módulo não encontrado
                </h1>
                <Link href="/aluno/estudar" className="text-sky-400 hover:text-sky-300">
                    ← Voltar
                </Link>
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
                    Voltar
                </Link>
                <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                    {module.name}
                </h1>
                <p className="text-sm text-gray-500">{module.description}</p>
            </div>

            {/* Module info */}
            <div className="grid gap-3 grid-cols-3">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Nível</p>
                    <p className="mt-2 text-lg font-semibold text-sky-400">
                        {module.level}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Assuntos</p>
                    <p className="mt-2 text-lg font-semibold text-emerald-400">
                        {module.topics.length}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Progresso</p>
                    <p className="mt-2 text-lg font-semibold text-sky-400">
                        {Math.round((module.topics.filter((t) => t.completed).length / module.topics.length) * 100)}%
                    </p>
                </div>
            </div>

            {/* Topics */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Assuntos</h2>

                <div className="space-y-3">
                    {module.topics.map((topic, index) => (
                        <Link
                            key={topic.id}
                            href={`/aluno/estudar/${moduloId}/${topic.id}`}
                            className="group block rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${
                                        topic.completed
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-sky-500/10 text-sky-400'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-medium text-gray-200 text-sm">
                                            {topic.name}
                                        </h3>
                                        <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                                            {topic.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                    {topic.completed ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                                    ) : (
                                        <Clock className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
                                    )}
                                    <span
                                        className={`text-xs font-medium ${
                                            topic.complexity === "Fácil"
                                                ? "text-emerald-400"
                                                : topic.complexity === "Médio"
                                                    ? "text-amber-400"
                                                    : "text-rose-400"
                                        }`}
                                    >
                    {topic.complexity}
                  </span>
                                </div>
                            </div>

                            {/* Content preview */}
                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3" strokeWidth={1.5} />
                    {topic.videos.length}
                </span>
                                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" strokeWidth={1.5} />
                                    {topic.materials.length}
                </span>
                                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" strokeWidth={1.5} />
                  1 quiz
                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}