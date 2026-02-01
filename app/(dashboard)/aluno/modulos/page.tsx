// app/(dashboard)/aluno/modulos/page.tsx

import { modules } from "@/utils/mock/modulesMock";

export const metadata = {
    title: "Módulos - Portal do Aluno",
    description: "Seus módulos e progresso de aprendizado",
};

export default function ModulosPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="font-nacelle text-4xl font-bold text-white">Módulos de Aprendizado</h1>
                <p className="text-gray-400">
                    Progresso através dos módulos de Java e Spring Framework
                </p>
            </div>

            {/* Modules Grid */}
            <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
                {modules.map((module) => (
                    <div
                        key={module.id}
                        className="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/30 backdrop-blur transition-all duration-300 hover:border-violet-500/50 hover:bg-gray-900/60 hover:shadow-xl hover:shadow-violet-500/10"
                    >
                        {/* Gradient background on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 to-purple-600/0 transition-all duration-300 group-hover:from-violet-600/5 group-hover:to-purple-600/5" />

                        {/* Content */}
                        <div className="relative z-10 flex h-full flex-col p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-4xl">{module.icon}</span>
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                        module.status === "Concluído"
                                            ? "bg-emerald-600/20 text-emerald-300"
                                            : module.status === "Em Progresso"
                                                ? "bg-violet-600/20 text-violet-300"
                                                : "bg-gray-700/50 text-gray-300"
                                    }`}
                                >
                  {module.status}
                </span>
                            </div>

                            {/* Title and description */}
                            <h3 className="text-lg font-bold text-white mb-2">{module.name}</h3>
                            <p className="text-sm text-gray-400 mb-4 flex-1">{module.description}</p>

                            {/* Level and duration */}
                            <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
                                <span>📚 {module.level}</span>
                                <span>⏱️ {module.duration}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-300">Progresso</span>
                                    <span className="text-xs font-bold text-violet-400">{module.progress}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-700/50">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500"
                                        style={{ width: `${module.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Topics count */}
                            <div className="mb-4 text-xs text-gray-400">
                                {module.topics.filter((t) => t.completed).length} de {module.topics.length}{" "}
                                assuntos concluídos
                            </div>

                            {/* CTA Button */}
                            <button className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-2 text-sm font-semibold text-white transition-all duration-200 hover:from-violet-500 hover:to-purple-500 active:scale-95">
                                {module.status === "Concluído" ? "Revisar" : "Continuar"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Completed modules info */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-6 backdrop-blur">
                <h3 className="mb-3 font-semibold text-emerald-300">✅ Módulos Concluídos</h3>
                <p className="text-sm text-emerald-200/80">
                    Você completou <span className="font-bold">1 de 3</span> módulos. Continue assim para
                    dominar Java e Spring Framework!
                </p>
            </div>
        </div>
    );
}