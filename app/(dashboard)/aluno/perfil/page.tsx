// app/(dashboard)/aluno/perfil/page.tsx

import { studentData } from "@/utils/mock/studentMock";
import { badges, profileStats, modules } from "@/utils/mock/modulesMock";

export const metadata = {
    title: "Meu Perfil - Portal do Aluno",
    description: "Seus dados, badges e progresso acadêmico",
};

export default function PerfilPage() {
    const completedModules = modules.filter((m) => m.status === "Concluído");
    const inProgressModules = modules.filter((m) => m.status === "Em Progresso");

    return (
        <div className="space-y-8">
            {/* Profile Header Card */}
            <div className="rounded-xl border border-gray-700/50 bg-gray-900/30 p-8 backdrop-blur">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    {/* Avatar */}
                    <div className="flex shrink-0 flex-col items-center gap-4 sm:items-start">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                                {studentData.name.split(" ")[0][0]}
                                {studentData.name.split(" ")[1][0]}
                            </div>
                            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-900 bg-emerald-600">
                                <span className="text-sm">✓</span>
                            </div>
                        </div>
                        <button className="rounded-lg bg-violet-600/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-600/30">
                            Alterar Avatar
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="font-nacelle text-3xl font-bold text-white">{studentData.name}</h1>
                        <p className="mt-1 text-gray-400">{studentData.email}</p>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span>📚</span>
                                <span>
                  <strong>Curso:</strong> {studentData.course}
                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span>🎓</span>
                                <span>
                  <strong>Matrícula:</strong> {studentData.id}
                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span>📅</span>
                                <span>
                  <strong>Data de Inscrição:</strong>{" "}
                                    {new Date(studentData.enrollmentDate).toLocaleDateString("pt-BR")}
                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span>✨</span>
                                <span>
                  <strong>Status:</strong> Ativo
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-gray-400">Tempo Total de Estudo</p>
                    <p className="mt-2 text-2xl font-bold text-violet-400">{profileStats.totalStudyTime}</p>
                </div>
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-gray-400">Módulos Concluídos</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-400">
                        {profileStats.modulesCompleted}/{modules.length}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-gray-400">Assuntos Completados</p>
                    <p className="mt-2 text-2xl font-bold text-blue-400">{profileStats.topicCompleted}</p>
                </div>
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-gray-400">Streak Atual</p>
                    <p className="mt-2 text-2xl font-bold text-orange-400">🔥 {profileStats.streak}</p>
                </div>
            </div>

            {/* Modules Status */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Status dos Módulos</h2>

                {/* Completed */}
                {completedModules.length > 0 && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 backdrop-blur">
                        <h3 className="mb-3 font-semibold text-emerald-300">✅ Módulos Concluídos</h3>
                        <div className="space-y-2">
                            {completedModules.map((module) => (
                                <div key={module.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-emerald-200">
                    {module.icon} {module.name}
                  </span>
                                    <span className="text-xs text-emerald-300">
                    {new Date(module.completedDate!).toLocaleDateString("pt-BR")}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* In Progress */}
                {inProgressModules.length > 0 && (
                    <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 p-4 backdrop-blur">
                        <h3 className="mb-3 font-semibold text-violet-300">🚀 Em Progresso</h3>
                        <div className="space-y-3">
                            {inProgressModules.map((module) => (
                                <div key={module.id}>
                                    <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-violet-200">
                      {module.icon} {module.name}
                    </span>
                                        <span className="text-xs font-semibold text-violet-400">{module.progress}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-gray-700/50">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
                                            style={{ width: `${module.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Badges Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Seus Badges 🏅</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className={`rounded-lg border p-4 backdrop-blur transition-all ${
                                badge.unlockedDate
                                    ? "border-yellow-500/30 bg-yellow-950/20"
                                    : "border-gray-700/50 bg-gray-900/30 opacity-50"
                            }`}
                        >
                            <div className="text-3xl">{badge.icon}</div>
                            <h3 className="mt-2 font-semibold text-white">{badge.name}</h3>
                            <p className="mt-1 text-xs text-gray-400">{badge.description}</p>
                            {badge.unlockedDate && (
                                <p className="mt-2 text-xs text-yellow-400">
                                    🔓 Desbloqueado em {new Date(badge.unlockedDate).toLocaleDateString("pt-BR")}
                                </p>
                            )}
                            {!badge.unlockedDate && (
                                <p className="mt-2 text-xs text-gray-500">🔒 Bloqueado</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Settings Button */}
            <button className="w-full rounded-lg border border-gray-700/50 bg-gray-900/30 px-6 py-3 font-medium text-gray-200 transition-all hover:bg-gray-900/60 hover:border-violet-500/50">
                ⚙️ Configurações da Conta
            </button>
        </div>
    );
}