// app/(dashboard)/aluno/modulos/page.tsx
import { modules } from "@/utils/mock/modulesMock";
import Link from "next/link";
import { BookOpen, Clock, CheckCircle } from "lucide-react";

export const metadata = {
    title: "Módulos - Portal do Aluno",
    description: "Seus módulos e progresso de aprendizado",
};

export default function ModulosPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                    Módulos de Aprendizado
                </h1>
                <p className="text-sm text-gray-500">
                    Progresso através dos módulos de Java e Spring Framework
                </p>
            </div>

            {/* Modules Grid */}
            <div className="grid gap-5 lg:grid-cols-3 md:grid-cols-2">
                {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                        <div
                            key={module.id}
                            className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${module.iconColor} bg-current/10`}>
                                    <Icon className={`h-5 w-5 ${module.iconColor}`} strokeWidth={1.5} />
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                        module.status === "Concluído"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : module.status === "Em Progresso"
                                                ? "bg-sky-500/10 text-sky-400"
                                                : "bg-gray-800 text-gray-400"
                                    }`}
                                >
                  {module.status}
                </span>
                            </div>

                            {/* Title and description */}
                            <h3 className="text-base font-semibold text-white mb-2">{module.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{module.description}</p>

                            {/* Level and duration */}
                            <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {module.level}
                </span>
                                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    {module.duration}
                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Progresso</span>
                                    <span className="text-xs font-medium text-sky-400">{module.progress}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                                    <div
                                        className="h-full bg-sky-500 transition-all duration-500"
                                        style={{ width: `${module.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Topics count */}
                            <div className="mb-4 text-xs text-gray-500">
                                {module.topics.filter((t) => t.completed).length} de {module.topics.length} assuntos concluídos
                            </div>

                            {/* CTA Button */}
                            <Link
                                href={`/aluno/estudar/${module.id}`}
                                className="block w-full rounded-lg bg-sky-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-sky-500"
                            >
                                {module.status === "Concluído" ? "Revisar" : "Continuar"}
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Completed modules info */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-5">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                    <h3 className="font-medium text-emerald-300 text-sm">Módulos Concluídos</h3>
                </div>
                <p className="text-sm text-emerald-200/80">
                    Você completou <span className="font-semibold">1 de 3</span> módulos. Continue assim!
                </p>
            </div>
        </div>
    );
}