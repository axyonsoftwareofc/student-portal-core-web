// app/(dashboard)/admin/alunos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Users,
    Plus,
    Search,
    Mail,
    Pencil,
    Trash2,
    Loader2,
    UserPlus,
    Copy,
    Check,
    AlertTriangle,
    X,
    GraduationCap,
    UserX,
    UserCheck,
} from 'lucide-react';
import { useStudents, Student, StudentFormData } from '@/hooks/useStudents';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import StudentForm from '@/components/admin/StudentForm';
import EnrollmentManager from '@/components/admin/EnrollmentManager';

interface PrefilledStudentData {
    name: string;
    email: string;
    phone: string;
    leadId: string;
}

export default function AlunosPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const {
        students,
        isLoading,
        error,
        createStudent,
        updateStudent,
        deleteStudent,
        suspendStudent,
        reactivateStudent,
        resendInvite
    } = useStudents();

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState<boolean>(false);
    const [isInviteLinkModalOpen, setIsInviteLinkModalOpen] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [inviteLink, setInviteLink] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState<boolean>(false);
    const [enrollmentStudent, setEnrollmentStudent] = useState<{ id: string; name: string; email: string } | null>(null);
    const [prefilledData, setPrefilledData] = useState<PrefilledStudentData | null>(null);

    useEffect(() => {
        const fromLead = searchParams.get('fromLead');
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const phone = searchParams.get('phone');
        const leadId = searchParams.get('leadId');

        if (fromLead === '1' && name && email && leadId) {
            setPrefilledData({
                name: decodeURIComponent(name),
                email: decodeURIComponent(email),
                phone: phone ? decodeURIComponent(phone) : '',
                leadId,
            });
            setIsCreateModalOpen(true);

            router.replace('/admin/alunos', { scroll: false });
        }
    }, [searchParams, router]);

    const filteredStudents = students.filter((student: Student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            student.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: students.length,
        active: students.filter((s: Student) => s.status === 'active').length,
        pending: students.filter((s: Student) => s.status === 'pending').length,
        suspended: students.filter((s: Student) => s.status === 'suspended').length,
    };

    const handleCreate = async (data: StudentFormData) => {
        setIsSubmitting(true);
        const result = await createStudent(data);
        setIsSubmitting(false);

        if (result.success && result.inviteLink) {
            setIsCreateModalOpen(false);
            setPrefilledData(null);
            setInviteLink(result.inviteLink);
            setIsInviteLinkModalOpen(true);
        }
        return result;
    };

    const handleResendInvite = async (student: Student): Promise<void> => {
        setIsSubmitting(true);
        const result = await resendInvite(student.id);
        setIsSubmitting(false);

        if (result.success && result.inviteLink) {
            setInviteLink(result.inviteLink);
            setIsInviteLinkModalOpen(true);
        }
    };

    const handleCopyLink = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
    };

    const handleEdit = async (data: StudentFormData, currentEmail?: string) => {
        if (!selectedStudent) return { success: false, error: 'Aluno não selecionado' };

        setIsSubmitting(true);
        const result = await updateStudent(selectedStudent.id, data, currentEmail);
        setIsSubmitting(false);

        if (result.success) {
            setIsEditModalOpen(false);
            setSelectedStudent(null);
        }
        return result;
    };

    const handleSuspend = async (): Promise<void> => {
        if (!selectedStudent) return;

        setIsSubmitting(true);
        const result = await suspendStudent(selectedStudent.id);
        setIsSubmitting(false);

        if (result.success) {
            setIsSuspendDialogOpen(false);
            setSelectedStudent(null);
        }
    };

    const handleReactivate = async (student: Student): Promise<void> => {
        setIsSubmitting(true);
        await reactivateStudent(student.id);
        setIsSubmitting(false);
    };

    const handleDelete = async (): Promise<void> => {
        if (!selectedStudent) return;

        setIsSubmitting(true);
        const result = await deleteStudent(selectedStudent.id);
        setIsSubmitting(false);

        if (result.success) {
            setIsDeleteDialogOpen(false);
            setSelectedStudent(null);
        }
    };

    const openEditModal = (student: Student): void => {
        setSelectedStudent(student);
        setIsEditModalOpen(true);
    };

    const openSuspendDialog = (student: Student): void => {
        setSelectedStudent(student);
        setIsSuspendDialogOpen(true);
    };

    const openDeleteDialog = (student: Student): void => {
        setSelectedStudent(student);
        setIsDeleteDialogOpen(true);
    };

    const openEnrollmentModal = (student: Student): void => {
        setEnrollmentStudent({
            id: student.id,
            name: student.name,
            email: student.email,
        });
    };

    const handleCloseCreateModal = (): void => {
        setIsCreateModalOpen(false);
        setPrefilledData(null);
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400">
                        Pendente
                    </span>
                );
            case 'suspended':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-rose-500/10 text-rose-400">
                        Suspenso
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        Ativo
                    </span>
                );
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <Users className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            Gestão de Alunos
                        </h1>
                        <p className="text-sm text-gray-500">
                            {students.length} alunos cadastrados
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    Novo Aluno
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none transition-colors"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {(['all', 'active', 'pending', 'suspended'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                statusFilter === status
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                            }`}
                        >
                            {status === 'all' && 'Todos'}
                            {status === 'active' && 'Ativos'}
                            {status === 'pending' && 'Pendentes'}
                            {status === 'suspended' && 'Suspensos'}
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                                statusFilter === status
                                    ? 'bg-sky-500/30'
                                    : 'bg-gray-700'
                            }`}>
                                {statusCounts[status]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" strokeWidth={1.5} />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && students.length === 0 && (
                <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50">
                            <Users className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhum aluno cadastrado</h3>
                    <p className="text-gray-400 mb-4">Comece adicionando seu primeiro aluno</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                    >
                        <UserPlus className="h-4 w-4" strokeWidth={1.5} />
                        Adicionar Aluno
                    </button>
                </div>
            )}

            {/* Students List - Mobile Cards */}
            {!isLoading && filteredStudents.length > 0 && (
                <>
                    <div className="block lg:hidden space-y-3">
                        {filteredStudents.map((student: Student) => (
                            <div
                                key={student.id}
                                className={`rounded-lg border bg-gray-900/30 p-4 space-y-3 ${
                                    student.status === 'suspended'
                                        ? 'border-rose-500/20 opacity-75'
                                        : 'border-gray-800/50'
                                }`}
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

                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800/50">
                                    <span className="text-xs text-gray-500">
                                        Desde {new Date(student.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                    <div className="flex-1" />

                                    {student.status === 'suspended' ? (
                                        <button
                                            onClick={() => handleReactivate(student)}
                                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                            <UserCheck className="h-3 w-3" strokeWidth={1.5} />
                                            Reativar
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => openEnrollmentModal(student)}
                                                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                                            >
                                                <GraduationCap className="h-3 w-3" strokeWidth={1.5} />
                                                Cursos
                                            </button>
                                            {student.status === 'pending' && (
                                                <button
                                                    onClick={() => handleResendInvite(student)}
                                                    className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                                                >
                                                    <Mail className="h-3 w-3" strokeWidth={1.5} />
                                                    Reenviar
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openEditModal(student)}
                                                className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                                            >
                                                <Pencil className="h-3 w-3" strokeWidth={1.5} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => openSuspendDialog(student)}
                                                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                                            >
                                                <UserX className="h-3 w-3" strokeWidth={1.5} />
                                                Suspender
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => openDeleteDialog(student)}
                                        className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
                                    >
                                        <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Students Table - Desktop */}
                    <div className="hidden lg:block rounded-lg border border-gray-800/50 bg-gray-900/30 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-800/50 bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Aluno</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Telefone</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Cadastrado em</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Ações</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                {filteredStudents.map((student: Student) => (
                                    <tr
                                        key={student.id}
                                        className={`hover:bg-gray-900/50 transition-colors ${
                                            student.status === 'suspended' ? 'opacity-60' : ''
                                        }`}
                                    >
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
                                                {student.status === 'suspended' ? (
                                                    <button
                                                        onClick={() => handleReactivate(student)}
                                                        className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                                    >
                                                        <UserCheck className="h-4 w-4" strokeWidth={1.5} />
                                                        Reativar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => openEnrollmentModal(student)}
                                                            className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                                            title="Gerenciar matrículas"
                                                        >
                                                            <GraduationCap className="h-4 w-4" strokeWidth={1.5} />
                                                            Cursos
                                                        </button>
                                                        {student.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleResendInvite(student)}
                                                                className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                                                            >
                                                                <Mail className="h-4 w-4" strokeWidth={1.5} />
                                                                Reenviar
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openEditModal(student)}
                                                            className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                                                        >
                                                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => openSuspendDialog(student)}
                                                            className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                                                        >
                                                            <UserX className="h-4 w-4" strokeWidth={1.5} />
                                                            Suspender
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => openDeleteDialog(student)}
                                                    className="inline-flex items-center gap-1 text-sm text-rose-400 hover:text-rose-300 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
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
                    <Search className="h-8 w-8 text-gray-500 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhum aluno encontrado</p>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                title={prefilledData ? "Converter Lead em Aluno" : "Novo Aluno"}
                size="md"
            >
                {prefilledData && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                        <UserCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
                        <p className="text-sm text-emerald-300">
                            Dados importados do lead. Revise e confirme para criar o aluno.
                        </p>
                    </div>
                )}
                <StudentForm
                    onSubmit={handleCreate}
                    onCancel={handleCloseCreateModal}
                    isLoading={isSubmitting}
                    initialData={prefilledData ? {
                        name: prefilledData.name,
                        email: prefilledData.email,
                        phone: prefilledData.phone,
                    } : undefined}
                />
            </Modal>

            {/* Invite Link Modal */}
            <Modal
                isOpen={isInviteLinkModalOpen}
                onClose={() => {
                    setIsInviteLinkModalOpen(false);
                    setInviteLink('');
                }}
                title="Aluno Cadastrado!"
                size="md"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                        <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
                        <p className="text-sm text-emerald-300">
                            Envie o link abaixo para o aluno criar sua senha e acessar o portal:
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inviteLink}
                            readOnly
                            className="flex-1 rounded-lg border border-gray-800/50 bg-gray-900/50 px-3 py-2 text-sm text-gray-300"
                        />
                        <button
                            onClick={handleCopyLink}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                copySuccess
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-sky-600 text-white hover:bg-sky-500'
                            }`}
                        >
                            {copySuccess ? (
                                <>
                                    <Check className="h-4 w-4" strokeWidth={1.5} />
                                    Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" strokeWidth={1.5} />
                                    Copiar
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-950/30 border border-amber-500/20">
                        <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <p className="text-xs text-amber-300">
                            O link expira em 7 dias. Após esse período, será necessário gerar um novo.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setIsInviteLinkModalOpen(false);
                            setInviteLink('');
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-800 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                        <X className="h-4 w-4" strokeWidth={1.5} />
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

            {/* Suspend Confirmation */}
            <ConfirmDialog
                isOpen={isSuspendDialogOpen}
                onClose={() => {
                    setIsSuspendDialogOpen(false);
                    setSelectedStudent(null);
                }}
                onConfirm={handleSuspend}
                title="Suspender Aluno"
                message={`Tem certeza que deseja suspender o aluno "${selectedStudent?.name}"? Ele não poderá acessar o portal, mas seus dados serão preservados.`}
                confirmText="Suspender"
                isLoading={isSubmitting}
                variant="warning"
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedStudent(null);
                }}
                onConfirm={handleDelete}
                title="Excluir Aluno Permanentemente"
                message={`Tem certeza que deseja EXCLUIR PERMANENTEMENTE o aluno "${selectedStudent?.name}"? Todo o histórico, progresso e pagamentos serão removidos. Esta ação NÃO pode ser desfeita!`}
                confirmText="Excluir Permanentemente"
                isLoading={isSubmitting}
                variant="danger"
            />

            {/* Enrollment Manager Modal */}
            {enrollmentStudent && (
                <EnrollmentManager
                    isOpen={!!enrollmentStudent}
                    onClose={() => setEnrollmentStudent(null)}
                    student={enrollmentStudent}
                />
            )}
        </div>
    );
}