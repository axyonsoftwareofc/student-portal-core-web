// app/(dashboard)/admin/modulos/page.tsx

'use client';

import { useState } from 'react';
import {
    Layers,
    Plus,
    Search,
    CheckCircle,
    FileEdit,
    Archive,
    BookOpen,
    Users,
    Pencil,
    ExternalLink
} from 'lucide-react';

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

type ModuleStatus = Module['status'];

const statusConfig: Record<ModuleStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
    published: { label: 'Publicado', color: 'emerald', icon: CheckCircle },
    draft: { label: 'Rascunho', color: 'amber', icon: FileEdit },
    archived: { label: 'Arquivado', color: 'gray', icon: Archive },
};

export default function ModulosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | ModuleStatus>('all');

    const filteredModules = modules.filter(module => {
        const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || module.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusInfo = (status: ModuleStatus) => statusConfig[status];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <Layers className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            Gestão de Módulos
                        </h1>
                        <p className="text-sm text-gray-500">
                            {modules.length} módulos criados
                        </p>
                    </div>
                </div>
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors">
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    Novo Módulo
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                    <input
                        type="text"
                        placeholder="Buscar por título ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none transition-colors"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="w-full sm:w-auto rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                >
                    <option value="all">Todos os status</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Rascunhos</option>
                    <option value="archived">Arquivados</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-3">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Publicados</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">
                                {modules.filter(m => m.status === 'published').length}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Rascunhos</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">
                                {modules.filter(m => m.status === 'draft').length}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <FileEdit className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Tópicos</p>
                            <p className="text-xl sm:text-2xl font-semibold text-white">
                                {modules.reduce((acc, m) => acc + m.topics, 0)}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <BookOpen className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {filteredModules.map((module) => {
                    const statusInfo = getStatusInfo(module.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                        <div
                            key={module.id}
                            className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                        >
                            <div className="flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                    <h3 className="text-base sm:text-lg font-semibold text-white">
                                        {module.title}
                                    </h3>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-${statusInfo.color}-500/10 text-${statusInfo.color}-400`}>
                                        <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
                                        {statusInfo.label}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {module.description}
                                </p>

                                <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                                    <span className="inline-flex items-center gap-1">
                                        <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        {module.topics} tópicos
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        {module.students} alunos
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                        <span>Conteúdo completo</span>
                                        <span>{module.progress}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-800">
                                        <div
                                            className="h-full rounded-full bg-sky-500 transition-all"
                                            style={{ width: `${module.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-800/50 pt-4">
                                <span className="text-xs text-gray-500">
                                    Criado em {new Date(module.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                                <div className="flex gap-3">
                                    <button className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors">
                                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                        Editar
                                    </button>
                                    <button className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors">
                                        <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                                        Ver
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredModules.length === 0 && (
                <div className="text-center py-12">
                    <Layers className="h-8 w-8 text-gray-500 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhum módulo encontrado</p>
                </div>
            )}
        </div>
    );
}