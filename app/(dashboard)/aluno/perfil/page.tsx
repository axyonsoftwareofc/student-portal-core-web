// app/(dashboard)/aluno/perfil/page.tsx
'use client';

import { useAuth } from "@/contexts/AuthContext";
import { badges, profileStats, modules } from "@/utils/mock/modulesMock";
import { Clock, BookOpen, CheckCircle, Flame, Award, Lock, Settings } from "lucide-react";

export default function PerfilPage() {
    const { user } = useAuth();

    const completedModules = modules.filter((m) => m.status === "Concluído");
    const inProgressModules = modules.filter((m) => m.status === "Em Progresso");

    if (!user) return null;

    return (
        <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5">
                <div className="flex flex-col sm:flex-row gap-5">
                    {/* Avatar */}
                    <div className="flex flex-col items-center sm:items-start gap-3">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-2xl font-bold text-white">
                                {user.name.split(" ")[0][0]}
                                {user.name.split(" ")[1]?.[0] || ''}
                            </div>
                            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900 bg-emerald-500">
                                <CheckCircle className="h-3 w-3 text-white" strokeWidth={2} />
                            </div>
                        </div>
                        <button className="rounded-lg bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/20">
                            Alterar Avatar
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="font-nacelle text-xl font-semibold text-white">
                            {user.name}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">{user.email}</p>

                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400">
                                <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                                <span>Full Stack Developer</span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400">
                                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                <span>Ativo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Tempo Total</p>
                    <p className="mt-2 text-xl font-bold text-sky-400">
                        {profileStats.totalStudyTime}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Módulos</p>
                    <p className="mt-2 text-xl font-bold text-emerald-400">
                        {profileStats.modulesCompleted}/{modules.length}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Assuntos</p>
                    <p className="mt-2 text-xl font-bold text-sky-400">
                        {profileStats.topicCompleted}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Streak</p>
                    <p className="mt-2 text-xl font-bold text-amber-400 flex items-center gap-1">
                        <Flame className="h-5 w-5" strokeWidth={1.5} />
                        {profileStats.streak}
                    </p>
                </div>
            </div>

            {/* Modules Status */}
            <div className="space-y-4">
                <h2 className="text-base font-semibold text-white">Status dos Módulos</h2>

                {completedModules.length > 0 && (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                            <h3 className="font-medium text-emerald-300 text-sm">Concluídos</h3>
                        </div>
                        <div className="space-y-2">
                            {completedModules.map((module) => {
                                const Icon = module.icon;
                                return (
                                    <div key={module.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-emerald-200">
                      <Icon className={`h-4 w-4 ${module.iconColor}`} strokeWidth={1.5} />
                        {module.name}
                    </span>
                                        <span className="text-xs text-emerald-400">
                      {new Date(module.completedDate!).toLocaleDateString("pt-BR")}
                    </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {inProgressModules.length > 0 && (
                    <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                            <h3 className="font-medium text-sky-300 text-sm">Em Progresso</h3>
                        </div>
                        <div className="space-y-3">
                            {inProgressModules.map((module) => {
                                const Icon = module.icon;
                                return (
                                    <div key={module.id}>
                                        <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-sky-200">
                        <Icon className={`h-4 w-4 ${module.iconColor}`} strokeWidth={1.5} />
                          {module.name}
                      </span>
                                            <span className="text-xs font-medium text-sky-400">
                        {module.progress}%
                      </span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                                            <div
                                                className="h-full bg-sky-500"
                                                style={{ width: `${module.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Badges Section */}
            <div className="space-y-4">
                <h2 className="text-base font-semibold text-white">Badges</h2>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    {badges.map((badge) => {
                        const Icon = badge.icon;
                        return (
                            <div
                                key={badge.id}
                                className={`rounded-lg border p-4 transition-all ${
                                    badge.unlockedDate
                                        ? "border-amber-500/20 bg-amber-950/20"
                                        : "border-gray-800/50 bg-gray-900/30 opacity-60"
                                }`}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                    badge.unlockedDate ? 'bg-amber-500/10' : 'bg-gray-800'
                                }`}>
                                    <Icon className={`h-5 w-5 ${badge.unlockedDate ? 'text-amber-400' : 'text-gray-500'}`} strokeWidth={1.5} />
                                </div>
                                <h3 className="mt-3 font-medium text-white text-sm">
                                    {badge.name}
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">{badge.description}</p>
                                {badge.unlockedDate ? (
                                    <p className="mt-2 text-xs text-amber-400">
                                        {new Date(badge.unlockedDate).toLocaleDateString("pt-BR")}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                                        <Lock className="h-3 w-3" strokeWidth={1.5} />
                                        Bloqueado
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Settings Button */}
            <button className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 px-5 py-3 font-medium text-gray-300 transition-all hover:bg-gray-900/50 hover:border-gray-700 text-sm flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" strokeWidth={1.5} />
                Configurações da Conta
            </button>
        </div>
    );
}