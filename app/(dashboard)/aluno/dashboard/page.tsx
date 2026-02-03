// app/(dashboard)/aluno/dashboard/page.tsx
'use client';

import StatCard from "@/components/dashboard/cards/StatCard";
import {
    dashboardStats,
    studentData,
    upcomingAssessments,
    studySequence,
    announcements,
} from "@/utils/mock/studentMock";
import Link from "next/link";
import { CheckCircle, Clock, Lock } from "lucide-react";

export default function DashboardPage() {
    const recentSequence = studySequence.slice(-3).reverse();

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Welcome section */}
            <div className="space-y-1">
                <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                    Olá, {studentData.name.split(" ")[0]}
                </h1>
                <p className="text-sm text-gray-500">
                    Acompanhe seu progresso nos módulos
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                {/* Upcoming Assessments */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">
                            Próximas Avaliações
                        </h2>
                        <Link
                            href="/aluno/modulos"
                            className="text-sm text-gray-400 hover:text-sky-400 transition-colors"
                        >
                            Ver tudo →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {upcomingAssessments.map((assessment) => {
                            const Icon = assessment.icon;
                            return (
                                <div
                                    key={assessment.id}
                                    className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10">
                                                <Icon className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-medium text-gray-200 text-sm truncate">
                                                    {assessment.title}
                                                </h3>
                                                <p className="mt-0.5 text-xs text-gray-500 truncate">
                                                    {assessment.topic}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                      <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              assessment.status === "Disponível"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-sky-500/10 text-sky-400"
                          }`}
                      >
                        {assessment.status}
                      </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(assessment.dueDate).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {assessment.difficulty}
                    </span>
                                        <button className="rounded-md px-3 py-1.5 text-xs font-medium bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors">
                                            Acessar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Announcements */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Avisos</h2>

                    <div className="space-y-3">
                        {announcements.slice(0, 4).map((announcement) => {
                            const Icon = announcement.icon;
                            return (
                                <div
                                    key={announcement.id}
                                    className={`rounded-lg border p-4 transition-all hover:scale-[1.01] cursor-pointer ${
                                        announcement.priority === "high"
                                            ? "border-rose-500/20 bg-rose-950/20"
                                            : announcement.type === "videoaula"
                                                ? "border-sky-500/20 bg-sky-950/20"
                                                : announcement.type === "material"
                                                    ? "border-emerald-500/20 bg-emerald-950/20"
                                                    : "border-gray-800/50 bg-gray-900/30"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Icon className={`h-4 w-4 mt-0.5 ${
                                            announcement.priority === "high" ? "text-rose-400" :
                                                announcement.type === "videoaula" ? "text-sky-400" :
                                                    announcement.type === "material" ? "text-emerald-400" :
                                                        "text-gray-400"
                                        }`} strokeWidth={1.5} />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-medium text-gray-200 text-sm line-clamp-1">
                                                {announcement.title}
                                            </h3>
                                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                                {announcement.content}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-600">
                                                {new Date(announcement.date).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Study Sequence */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                        Sequência de Estudo
                    </h2>
                    <Link
                        href="/aluno/desempenho"
                        className="text-sm text-gray-400 hover:text-sky-400 transition-colors"
                    >
                        Ver histórico →
                    </Link>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5">
                    <div className="space-y-4">
                        {recentSequence.map((item, index) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                            item.status === "Concluído"
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : item.status === "Em Progresso"
                                                    ? "bg-sky-500/10 text-sky-400"
                                                    : "bg-gray-800 text-gray-500"
                                        }`}
                                    >
                                        {item.status === "Concluído" ? (
                                            <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                        ) : item.status === "Em Progresso" ? (
                                            <Clock className="h-4 w-4" strokeWidth={1.5} />
                                        ) : (
                                            <Lock className="h-4 w-4" strokeWidth={1.5} />
                                        )}
                                    </div>
                                    {index < recentSequence.length - 1 && (
                                        <div className="mt-2 h-8 w-px bg-gray-800" />
                                    )}
                                </div>

                                <div className="flex-1 pb-4 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                                                {item.module}
                                            </p>
                                            <h3 className="mt-0.5 font-medium text-gray-200 text-sm truncate">
                                                {item.topic}
                                            </h3>
                                        </div>
                                        <span
                                            className={`inline-flex self-start items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${
                                                item.status === "Concluído"
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : item.status === "Em Progresso"
                                                        ? "bg-sky-500/10 text-sky-400"
                                                        : "bg-gray-800 text-gray-500"
                                            }`}
                                        >
                      {item.status}
                    </span>
                                    </div>
                                    {item.completedDate && (
                                        <p className="mt-1 text-xs text-gray-600">
                                            {new Date(item.completedDate).toLocaleDateString("pt-BR")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-800/50">
                        <Link
                            href="/aluno/desempenho"
                            className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
                        >
                            Ver sequência completa (11 de 19)
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}