// app/(dashboard)/admin/alunos/page.tsx
'use client';

import { useState } from 'react';
import { students } from '@/utils/mock/adminMock';

export default function AlunosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-nacelle text-3xl font-bold text-white">
                        Gestão de Alunos
                    </h1>
                    <p className="mt-1 text-gray-400">
                        {students.length} alunos cadastrados
                    </p>
                </div>
                <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
                    + Novo Aluno
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
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
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                </select>
            </div>

            {/* Students Table */}
            <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 overflow-hidden">
                <table className="w-full">
                    <thead className="border-b border-gray-700/50 bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                            Aluno
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                            Curso
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                            Progresso
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                            Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                            Último Acesso
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                            Ações
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                    {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-900/50 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-medium text-white">{student.name}</p>
                                    <p className="text-sm text-gray-400">{student.email}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                                {student.course}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-24 rounded-full bg-gray-700">
                                        <div
                                            className="h-full rounded-full bg-violet-500"
                                            style={{ width: `${student.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-400">
                                            {student.progress}%
                                        </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                            student.status === 'active'
                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                : 'bg-gray-500/20 text-gray-400'
                                        }`}
                                    >
                                        {student.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                                {new Date(student.lastAccess).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-sm text-violet-400 hover:text-violet-300">
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}