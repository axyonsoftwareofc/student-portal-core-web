// app/(dashboard)/aluno/desempenho/page.tsx
'use client';

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { performanceData, studyTimeData } from "@/utils/mock/modulesMock";
import { Clock, BarChart3, Flame, TrendingUp, Lightbulb } from "lucide-react";

export default function DesempenhoPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                    Desempenho
                </h1>
                <p className="text-sm text-gray-500">
                    Acompanhe seu progresso e tempo de estudo
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total de Horas", value: "37h", icon: Clock, color: "sky" },
                    { label: "Semana Atual", value: "10h", icon: BarChart3, color: "emerald" },
                    { label: "Streak", value: "5 dias", icon: Flame, color: "amber" },
                    { label: "Média/Semana", value: "7.4h", icon: TrendingUp, color: "sky" },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-500">
                                        {stat.label}
                                    </p>
                                    <p className={`mt-2 text-2xl font-bold ${
                                        stat.color === 'sky' ? 'text-sky-400' :
                                            stat.color === 'emerald' ? 'text-emerald-400' :
                                                'text-amber-400'
                                    }`}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                    stat.color === 'sky' ? 'bg-sky-500/10 text-sky-400' :
                                        stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                                            'bg-amber-500/10 text-amber-400'
                                }`}>
                                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress by Module */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5">
                <h2 className="mb-5 text-base font-semibold text-white">
                    Progresso por Módulo
                </h2>
                <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                            <YAxis stroke="#6b7280" fontSize={11} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#111827",
                                    border: "1px solid #1f2937",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                                labelStyle={{ color: "#fff" }}
                            />
                            <Bar dataKey="progress" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Study Time Chart */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5">
                <h2 className="mb-5 text-base font-semibold text-white">
                    Horas de Estudo por Semana
                </h2>
                <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={studyTimeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="week" stroke="#6b7280" fontSize={11} />
                            <YAxis stroke="#6b7280" fontSize={11} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#111827",
                                    border: "1px solid #1f2937",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                                labelStyle={{ color: "#fff" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="hours"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                dot={{ fill: "#0ea5e9", r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                    <h3 className="font-medium text-sky-300 text-sm">Recomendações</h3>
                </div>
                <ul className="space-y-2 text-sm text-sky-200/80">
                    <li>• Seu streak de 5 dias é excelente!</li>
                    <li>• Você está 75% próximo de completar POO.</li>
                    <li>• Continue com Spring Boot para destravar o módulo Avançado.</li>
                </ul>
            </div>
        </div>
    );
}