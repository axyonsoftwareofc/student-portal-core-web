// app/(dashboard)/admin/alunos/page.tsx
'use client';

import { useState } from 'react';
import { useStudents, Student, StudentFormData } from '@/hooks/useStudents';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StudentForm from '@/components/admin/StudentForm';

export default function AlunosPage() {
    const { students, isLoading, error, createStudent, updateStudent, deleteStudent, resendInvite } = useStudents();

    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isInviteLinkModalOpen, setIsInviteLinkModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Criar aluno
    const handleCreate = async (data: StudentFormData) => {
        setIsSubmitting(true);
        const result = await createStudent(data);
        setIsSubmitting(false);

        if (result.success && result.inviteLink) {
            setIsCreateModalOpen(false);
            setInviteLink(result.inviteLink);
            setIsInviteLinkModalOpen(true);
        }
        return result;
    };

    // Reenviar convite
    const handleResendInvite = async (student: Student) => {
        setIsSubmitting(true);
        const result = await resendInvite(student.id);
        setIsSubmitting(false);

        if (result.success && result.inviteLink) {
            setInviteLink(result.inviteLink);
            setIsInviteLinkModalOpen(true);
        }
    };

    // Copiar link
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
    };

    // Editar aluno
    const handleEdit = async (data: StudentFormData) => {
        if (!selectedStudent) return { success: false, error: 'Aluno não selecionado' };

        setIsSubmitting(true);
        const result = await updateStudent(selectedStudent.id, data);
        setIsSubmitting(false);

        if (result.success) {
            setIsEditModalOpen(false);
            setSelectedStudent(null);
        }
        return result;
    };

    // Excluir aluno
    const handleDelete = async () => {
        if (!selectedStudent) return;

        setIsSubmitting(true);
        const result = await deleteStudent(selectedStudent.id);
        setIsSubmitting(false);

        if (result.success) {
            setIsDeleteDialogOpen(false);
            setSelectedStudent(null);
        }
    };

    const openEditModal = (student: Student) => {
        setSelectedStudent(student);
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (student: Student) => {
        setSelectedStudent(student);
        setIsDeleteDialogOpen(true);
    };

    const getStatusBadge = (status?: string) => {
        if (status === 'pending') {
            return (
                <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-300">
                    Pendente
                </span>
            );
        }
        return (
            <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300">
                Ativo
            </span>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-nacelle text-2xl sm:text-3xl font-bold text-white">
                        Gestão de Alunos
                    </h1>
                    <p className="mt-1 text-sm text-gray-400">
                        {students.length} alunos cadastrados
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
                >
                    + Novo Aluno
                </button>
            </div>

            {/* Search */}
            <div>
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                />
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && students.length === 0 && (
                <div className="text-center py-12 rounded-lg border border-gray-700/50 bg-gray-900/30">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhum aluno cadastrado</h3>
                    <p className="text-gray-400 mb-4">Comece adicionando seu primeiro aluno</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
                    >
                        + Adicionar Aluno
                    </button>
                </div>
            )}

            {/* Students List - Mobile Cards */}
            {!isLoading && filteredStudents.length > 0 && (
                <>
                    <div className="block lg:hidden space-y-3">
                        {filteredStudents.map((student) => (
                            <div
                                key={student.id}
                                className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 space-y-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <p className="font-medium text-white truncate">{student.name}</p>
                                        <p className="text-sm text-gray-400 truncate">{student.email}</p>
                                        {student.phone && (
                                            <p className="text-sm text-gray-500">{student.phone}</p>
                                        )}
                                    </div>
                                    {getStatusBadge(student.status)}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-700/50">
                                    <span className="text-xs text-gray-500">
                                        Desde {new Date(student.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                    <div className="flex-1" />
                                    {student.status === 'pending' && (
                                        <button
                                            onClick={() => handleResendInvite(student)}
                                            className="text-xs text-blue-400 hover:text-blue-300"
                                        >
                                            📧 Reenviar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openEditModal(student)}
                                        className="text-xs text-violet-400 hover:text-violet-300"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openDeleteDialog(student)}
                                        className="text-xs text-red-400 hover:text-red-300"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Students Table - Desktop */}
                    <div className="hidden lg:block rounded-lg border border-gray-700/50 bg-gray-900/30 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-700/50 bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Aluno</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Telefone</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Cadastrado em</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Ações</th>
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
                                            {student.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(student.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(student.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                {student.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleResendInvite(student)}
                                                        className="text-sm text-blue-400 hover:text-blue-300"
                                                    >
                                                        📧 Reenviar
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditModal(student)}
                                                    className="text-sm text-violet-400 hover:text-violet-300"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(student)}
                                                    className="text-sm text-red-400 hover:text-red-300"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* No Results */}
            {!isLoading && students.length > 0 && filteredStudents.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400">Nenhum aluno encontrado para "{searchTerm}"</p>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Novo Aluno"
                size="md"
            >
                <StudentForm
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreateModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Invite Link Modal */}
            <Modal
                isOpen={isInviteLinkModalOpen}
                onClose={() => {
                    setIsInviteLinkModalOpen(false);
                    setInviteLink('');
                }}
                title="✅ Aluno Cadastrado!"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-gray-300 text-sm">
                        Envie o link abaixo para o aluno criar sua senha e acessar o portal:
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inviteLink}
                            readOnly
                            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300"
                        />
                        <button
                            onClick={handleCopyLink}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                copySuccess
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-violet-600 text-white hover:bg-violet-500'
                            }`}
                        >
                            {copySuccess ? '✓ Copiado!' : '📋 Copiar'}
                        </button>
                    </div>

                    <div className="p-3 rounded-lg bg-yellow-950/30 border border-yellow-500/20">
                        <p className="text-xs text-yellow-300">
                            ⚠️ O link expira em 7 dias. Após esse período, será necessário gerar um novo.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setIsInviteLinkModalOpen(false);
                            setInviteLink('');
                        }}
                        className="w-full rounded-lg bg-gray-800 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedStudent(null);
                }}
                title="Editar Aluno"
                size="md"
            >
                <StudentForm
                    student={selectedStudent}
                    onSubmit={handleEdit}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedStudent(null);
                    }}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedStudent(null);
                }}
                onConfirm={handleDelete}
                title="Excluir Aluno"
                message={`Tem certeza que deseja excluir o aluno "${selectedStudent?.name}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                isLoading={isSubmitting}
                variant="danger"
            />
        </div>
    );
}