// app/(dashboard)/aluno/estudar/[modulo]/page.tsx

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { studyModules } from "@/utils/mock/studyMock";

export default function ModuloPage() {
    const params = useParams();
    const moduloId = params?.modulo as string;

    const module = studyModules.find((m) => m.id === moduloId);

    if (!module) {
        return (
            <div className="space-y-8">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-white mb-2">Módulo não encontrado</h1>
                    <Link href="/aluno/estudar" className="text-violet-400 hover:text-violet-300">
                        ← Voltar para módulos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <Link
                    href="/aluno/estudar"
                    className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 mb-4"
                >
                    ← Voltar
                </Link>
                <h1 className="font-nacelle text-4xl font-bold text-white">
                    {module.icon} {module.name}
                </h1>
                <p className="text-gray-400">{module.description}</p>
            </div>

            {/* Module info */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-gray-400">Nível</p>
                    <p className="mt-2 text-xl font-bold text-violet-400">{module.level}</p>
                </div>
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-gray-400">Assuntos</p>
                    <p className="mt-2 text-xl font-bold text-emerald-400">{module.topics.length}</p>
                </div>
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-gray-400">Progresso</p>
                    <p className="mt-2 text-xl font-bold text-blue-400">
                        {Math.round((module.topics.filter((t) => t.completed).length / module.topics.length) * 100)}%
                    </p>
                </div>
            </div>

            {/* Topics */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Assuntos</h2>

                <div className="space-y-3">
                    {module.topics.map((topic, index) => (
                        <Link
                            key={topic.id}
                            href={`/aluno/estudar/${moduloId}/${topic.id}`}
                            className="group relative overflow-hidden rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    {/* Topic number and title */}
                                    <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/20 text-sm font-bold text-violet-300">
                      {index + 1}
                    </span>
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                {topic.name}
                                            </h3>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {topic.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status and complexity */}
                                <div className="flex flex-col items-end gap-2">
                  <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          topic.completed
                              ? "bg-emerald-600/20 text-emerald-300"
                              : "bg-gray-700/50 text-gray-300"
                      }`}
                  >
                    {topic.completed ? "✅ Concluído" : "🔄 Estudar"}
                  </span>
                                    <span
                                        className={`text-xs font-medium ${
                                            topic.complexity === "Fácil"
                                                ? "text-green-400"
                                                : topic.complexity === "Médio"
                                                    ? "text-yellow-400"
                                                    : "text-red-400"
                                        }`}
                                    >
                    {topic.complexity}
                  </span>
                                </div>
                            </div>

                            {/* Content preview */}
                            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                                <span>📹 {topic.videos.length} videoaulas</span>
                                <span>📄 {topic.materials.length} materiais</span>
                                <span>🎯 1 quiz</span>
                            </div>

                            {/* Arrow indicator */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                →
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}