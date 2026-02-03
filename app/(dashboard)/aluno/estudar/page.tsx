// app/(dashboard)/aluno/estudar/page.tsx

'use client';

import Link from "next/link";
import { ArrowRight, BookOpen, Lightbulb, PlayCircle, FileText, Target, CheckCircle } from "lucide-react";
import { studyModules } from "@/utils/mock/studyMock";

export default function EstudarPage() {
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
                            Começar a Estudar
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500">
                            Escolha um módulo para começar
                        </p>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {studyModules.map((module) => {
                    const IconComponent = module.icon;
                    return (
                        <Link
                            key={module.id}
                            href={`/aluno/estudar/${module.id}`}
                            className="group relative overflow-hidden rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/50"
                        >
                            {/* Content */}
                            <div className="relative z-10 flex h-full flex-col">
                                {/* Icon and level */}
                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10">
                                        <IconComponent className="h-6 w-6 text-sky-400" strokeWidth={1.5} />
                                    </div>
                                    <span className="inline-flex items-center rounded-full px-2 sm:px-3 py-1 text-xs font-medium bg-sky-500/10 text-sky-400">
                                        {module.level}
                                    </span>
                                </div>

                                {/* Title and description */}
                                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                                    {module.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-400 mb-4 flex-1 line-clamp-2">
                                    {module.description}
                                </p>

                                {/* Topics count */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {module.topics.length} assuntos
                                    </span>
                                    <ArrowRight
                                        className="h-4 w-4 text-sky-400 group-hover:translate-x-1 transition-transform"
                                        strokeWidth={1.5}
                                    />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Info box */}
            <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
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
                        <FileText className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                        <span>Consulte o material de estudo</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                        <span>Complete o quiz</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}