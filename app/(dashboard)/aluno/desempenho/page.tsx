// app/(dashboard)/aluno/desempenho/page.tsx

"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { performanceData, studyTimeData } from "@/utils/mock/modulesMock";

export default function DesempenhoPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="font-nacelle text-4xl font-bold text-white">Seu Desempenho</h1>
                <p className="text-gray-400">Acompanhe seu progresso e tempo de estudo</p>
            </div>

            {/* Progress by Module */}
            <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6 backdrop-blur">
                <h2 className="mb-6 text-xl font-bold text-white">Progresso por Módulo</h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#111827",
                                    border: "1px solid #374151",
                                    borderRadius: "8px",
                                }}
                                labelStyle={{ color: "#fff" }}
                            />
                            <Bar dataKey="progress" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Study Time Chart */}
            <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6 backdrop-blur">
                <h2 className="mb-6 text-xl font-bold text-white">Horas de Estudo por Semana</h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={studyTimeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="week" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#111827",
                                    border: "1px solid #374151",
                                    borderRadius: "8px",
                                }}
                                labelStyle={{ color: "#fff" }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="hours"
                                stroke="#7c3aed"
                                strokeWidth={3}
                                dot={{ fill: "#7c3aed", r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total de Horas", value: "37h", icon: "⏱️" },
                    { label: "Semana Atual", value: "10h", icon: "📊" },
                    { label: "Streak", value: "5 dias", icon: "🔥" },
                    { label: "Média por Semana", value: "7.4h", icon: "📈" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400">{stat.label}</p>
                                <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                            <span className="text-3xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recommendations */}
            <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 p-6 backdrop-blur">
                <h3 className="mb-3 font-semibold text-violet-300">💡 Recomendações</h3>
                <ul className="space-y-2 text-sm text-violet-200/80">
                    <li>✨ Seu streak de 5 dias é excelente! Continue estudando regularmente.</li>
                    <li>🎯 Você está 75% próximo de completar o módulo de POO.</li>
                    <li>🚀 Continue com Spring Boot para destravar o módulo Avançado.</li>
                </ul>
            </div>
        </div>
    );
}