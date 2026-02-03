// app/(dashboard)/aluno/estudar/page.tsx
'use client';

import Link from "next/link";
import { studyModules } from "@/utils/mock/studyMock";

export default function EstudarPage() {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-1 sm:space-y-2">
                <h1 className="font-nacelle text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    📚 Começar a Estudar
                </h1>
                <p className="text-sm sm:text-base text-gray-400">
                    Escolha um módulo para começar
                </p>
            </div>

            {/* Modules Grid */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {studyModules.map((module) => (
                    <Link
                        key={module.id}
                        href={`/aluno/estudar/${module.id}`}
                        className="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6 backdrop-blur transition-all duration-300 hover:border-violet-500/50 hover:bg-gray-900/60 hover:shadow-xl hover:shadow-violet-500/10"
                    >
                        {/* Gradient background on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 to-purple-600/0 transition-all duration-300 group-hover:from-violet-600/5 group-hover:to-purple-600/5" />

                        {/* Content */}
                        <div className="relative z-10 flex h-full flex-col">
                            {/* Icon and level */}
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <span className="text-3xl sm:text-4xl">{module.icon}</span>
                                <span className="inline-flex items-center rounded-full px-2 sm:px-3 py-1 text-xs font-semibold bg-violet-600/20 text-violet-300">
                                    {module.level}
                                </span>
                            </div>

                            {/* Title and description */}
                            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                                {module.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-400 mb-4 flex-1 line-clamp-2">
                                {module.description}
                            </p>

                            {/* Topics count */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                    {module.topics.length} assuntos
                                </span>
                                <span className="text-violet-400 group-hover:translate-x-1 transition-transform">
                                    →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Info box */}
            <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 p-4 sm:p-6 backdrop-blur">
                <h3 className="mb-2 font-semibold text-violet-300 text-sm sm:text-base">
                    💡 Como funciona?
                </h3>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-violet-200/80">
                    <li>✅ Escolha um módulo para começar</li>
                    <li>📹 Assista as videoaulas</li>
                    <li>📄 Consulte o material de estudo</li>
                    <li>🎯 Complete o quiz</li>
                </ul>
            </div>
        </div>
    );
}