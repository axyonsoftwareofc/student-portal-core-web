// app/(dashboard)/admin/modulos/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Module {
    id: number;
    title: string;
    description: string;
    topics: number;
    students: number;
    progress: number;
    status: 'published' | 'draft' | 'archived';
    createdAt: string;
}

const modules: Module[] = [
    {
        id: 1,
        title: 'Fundamentos de Java',
        description: 'Conceitos básicos e sintaxe da linguagem Java',
        topics: 15,
        students: 180,
        progress: 100,
        status: 'published',
        createdAt: '2024-01-10',
    },
    {
        id: 2,
        title: 'Programação Orientada a Objetos',
        description: 'POO, classes, herança, polimorfismo e encapsulamento',
        topics: 12,
        students: 165,
        progress: 100,
        status: 'published',
        createdAt: '2024-01-15',
    },
    {
        id: 3,
        title: 'Spring Framework Básico',
        description: 'Introdução ao Spring, IoC e Dependency Injection',
        topics: 18,
        students: 142,
        progress: 75,
        status: 'published',
        createdAt: '2024-02-01',
    },
    {
        id: 4,
        title: 'Spring Boot Avançado',
        description: 'APIs REST, Security, JPA e Deploy',
        topics: 20,
        students: 98,
        progress: 45,
        status: 'draft',
        createdAt: '2024-02-15',
    },
];

export default function ModulosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

    const filteredModules = modules.filter(module => {
        const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || module.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: Module['status']) => {
        switch (status) {
            case 'published':
                return 'bg-emerald-500/20 text-emerald-300';
            case 'draft':
                return 'bg-yellow-500/20 text-yellow-300';
            case 'archived':
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusLabel = (status: Module['status']) => {
        switch (status) {
            case 'published':
                return 'Publicado';
            case 'draft':
                return 'Rascunho';
            case 'archived':
                return 'Arquivado';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-nacelle text-3xl font-bold text-white">
                        Gestão de Módulos
                    </h1>
                    <p className="mt-1 text-gray-400">
                        {modules.length} módulos criados
                    </p>
                </div>
                <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
                    + Novo Módulo
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por título ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                >
                    <option value="all">Todos os status</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Rascunhos</option>
                    <option value="archived">Arquivados</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Publicados</p>
                            <p className="text-2xl font-bold text-white">
                                {modules.filter(m => m.status === 'published').length}
                            </p>
                        </div>
                        <span className="text-3xl">✅</span>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Em Desenvolvimento</p>
                            <p className="text-2xl font-bold text-white">
                                {modules.filter(m => m.status === 'draft').length}
                            </p>
                        </div>
                        <span className="text-3xl">📝</span>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Total de Tópicos</p>
                            <p className="text-2xl font-bold text-white">
                                {modules.reduce((acc, m) => acc + m.topics, 0)}
                            </p>
                        </div>
                        <span className="text-3xl">📚</span>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {filteredModules.map((module) => (
                    <div
                        key={module.id}
                        className="group rounded-lg border border-gray-700/50 bg-gray-900/30 p-6 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-white">
                                        {module.title}
                                    </h3>
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(module.status)}`}>
                                        {getStatusLabel(module.status)}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-400">
                                    {module.description}
                                </p>

                                <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                                    <span>📖 {module.topics} tópicos</span>
                                    <span>👥 {module.students} alunos</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                        <span>Conteúdo completo</span>
                                        <span>{module.progress}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-700">
                                        <div
                                            className="h-full rounded-full bg-violet-500"
                                            style={{ width: `${module.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-gray-700/50 pt-4">
                            <span className="text-xs text-gray-500">
                                Criado em {new Date(module.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <div className="flex gap-2">
                                <button className="text-sm text-violet-400 hover:text-violet-300">
                                    Editar
                                </button>
                                <button className="text-sm text-blue-400 hover:text-blue-300">
                                    Visualizar
                                </button>
                                <button className="text-sm text-red-400 hover:text-red-300">
                                    Arquivar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredModules.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400">Nenhum módulo encontrado</p>
                </div>
            )}
        </div>
    );
}