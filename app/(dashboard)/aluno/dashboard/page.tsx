// app/(dashboard)/aluno/dashboard/page.tsx

import StatCard from "@/components/dashboard/cards/StatCard";
import {
    dashboardStats,
    studentData,
    upcomingAssessments,
    studySequence,
    announcements,
} from "@/utils/mock/studentMock";

export default function DashboardPage() {
    // Pega apenas os últimos 3 itens da sequência
    const recentSequence = studySequence.slice(-3).reverse();

    return (
        <div className="space-y-8">
            {/* Welcome section */}
            <div className="space-y-2">
                <h1 className="font-nacelle text-4xl font-bold text-white">
                    Bem-vindo de volta, {studentData.name.split(" ")[0]}! 👋
                </h1>
                <p className="text-gray-400">
                    Acompanhe seu progresso nos módulos de Java e Spring Framework
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {dashboardStats.map((stat) => (
                    <StatCard
                        key={stat.id}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        trend={stat.trend}
                        description={stat.description}
                    />
                ))}
            </div>

            {/* Main content grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Upcoming Assessments */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Próximas Avaliações</h2>
                        <a
                            href="/aluno/modulos"
                            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Ver tudo →
                        </a>
                    </div>

                    <div className="space-y-3">
                        {upcomingAssessments.map((assessment) => (
                            <div
                                key={assessment.id}
                                className="group rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{assessment.icon}</span>
                                            <h3 className="font-semibold text-white">
                                                {assessment.title}
                                            </h3>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-400">
                                            {assessment.topic}
                                        </p>
                                    </div>

                                    <div className="text-right">
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium mb-2 ${
                            assessment.status === "Disponível"
                                ? "bg-emerald-600/20 text-emerald-300"
                                : "bg-violet-600/20 text-violet-300"
                        }`}
                    >
                      {assessment.status}
                    </span>
                                        <p className="text-xs text-gray-400">
                                            {new Date(assessment.dueDate).toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>
                                </div>

                                {/* Difficulty indicator */}
                                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Dificuldade: {assessment.difficulty}
                  </span>
                                    <button className="rounded px-3 py-1 text-xs font-medium bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 transition-colors">
                                        Acessar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Announcements */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Avisos</h2>

                    <div className="space-y-3">
                        {announcements.slice(0, 4).map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`rounded-lg border p-4 backdrop-blur transition-all hover:scale-105 cursor-pointer ${
                                    announcement.priority === "high"
                                        ? "border-red-500/30 bg-red-950/20"
                                        : announcement.type === "videoaula"
                                            ? "border-blue-500/30 bg-blue-950/20"
                                            : announcement.type === "material"
                                                ? "border-emerald-500/30 bg-emerald-950/20"
                                                : "border-gray-700/50 bg-gray-900/30"
                                }`}
                            >
                                <h3 className="font-semibold text-white text-sm">
                                    {announcement.title}
                                </h3>
                                <p className="mt-1 text-xs text-gray-400">
                                    {announcement.content}
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    {new Date(announcement.date).toLocaleDateString("pt-BR")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Study Sequence */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Sua Sequência de Estudo</h2>
                    <a
                        href="/aluno/desempenho"
                        className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        Ver histórico →
                    </a>
                </div>

                {/* Timeline/Sequence */}
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6 backdrop-blur">
                    <div className="space-y-4">
                        {recentSequence.map((item, index) => (
                            <div key={item.id} className="flex gap-4">
                                {/* Timeline dot */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                            item.status === "Concluído"
                                                ? "border-emerald-500 bg-emerald-500/20"
                                                : item.status === "Em Progresso"
                                                    ? "border-violet-500 bg-violet-500/20"
                                                    : "border-gray-600 bg-gray-900/50"
                                        }`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                    </div>
                                    {index < recentSequence.length - 1 && (
                                        <div className="mt-2 h-8 w-0.5 bg-gradient-to-b from-gray-600 to-gray-800" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">
                                                {item.module}
                                            </p>
                                            <h3 className="mt-1 font-semibold text-white">
                                                {item.topic}
                                            </h3>
                                        </div>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                item.status === "Concluído"
                                                    ? "bg-emerald-600/20 text-emerald-300"
                                                    : item.status === "Em Progresso"
                                                        ? "bg-violet-600/20 text-violet-300"
                                                        : "bg-gray-700/50 text-gray-400"
                                            }`}
                                        >
                      {item.status}
                    </span>
                                    </div>
                                    {item.completedDate && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Concluído em{" "}
                                            {new Date(item.completedDate).toLocaleDateString("pt-BR")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA to see full sequence */}
                    <div className="mt-6 border-t border-gray-700/50 pt-4">
                        <a
                            href="/aluno/desempenho"
                            className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Ver sequência completa (11 de 19 assuntos)
                            <span>→</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}