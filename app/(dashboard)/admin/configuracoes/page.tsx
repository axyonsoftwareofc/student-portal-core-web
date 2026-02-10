// app/(dashboard)/admin/configuracoes/page.tsx
'use client';

import { useState } from 'react';
import {
    Settings,
    Shield,
    Users,
    Building2,
    Info,
    Crown,
    UserMinus,
    UserPlus,
    Loader2,
    AlertTriangle,
    CheckCircle,
    Save,
    RotateCcw,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useAdmins } from '@/hooks/useAdmins';
import { useSchoolSettings } from '@/hooks/useSchoolSettings';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function ConfiguracoesPage() {
    const { user } = useAuth();
    const { admins, students, isLoading: loadingAdmins, promoteToAdmin, demoteAdmin } = useAdmins();
    const { settings, saveSettings, resetSettings, isLoading: loadingSettings } = useSchoolSettings();
    const { stats } = useAdminDashboard();

    // Estados do formulário
    const [schoolName, setSchoolName] = useState(settings.name);
    const [schoolDescription, setSchoolDescription] = useState(settings.description);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Estados dos modais
    const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
    const [isDemoteDialogOpen, setIsDemoteDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Estados de expansão das seções
    const [expandedSections, setExpandedSections] = useState({
        admins: true,
        school: true,
        system: true,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Atualizar estados quando settings carregar
    useState(() => {
        if (!loadingSettings) {
            setSchoolName(settings.name);
            setSchoolDescription(settings.description);
        }
    });

    // Handlers
    const handleSaveSchoolSettings = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        saveSettings({
            name: schoolName.trim() || 'Code Plus',
            description: schoolDescription.trim(),
        });

        // Simular delay para feedback visual
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsSaving(false);
        setSaveSuccess(true);

        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleResetSettings = () => {
        resetSettings();
        setSchoolName('Code Plus');
        setSchoolDescription('Escola de programação focada em Java e Spring Framework');
    };

    const openPromoteDialog = (userId: string, userName: string) => {
        setSelectedUserId(userId);
        setSelectedUserName(userName);
        setIsPromoteDialogOpen(true);
    };

    const openDemoteDialog = (userId: string, userName: string) => {
        setSelectedUserId(userId);
        setSelectedUserName(userName);
        setIsDemoteDialogOpen(true);
    };

    const handlePromote = async () => {
        if (!selectedUserId) return;

        setIsProcessing(true);
        const result = await promoteToAdmin(selectedUserId);
        setIsProcessing(false);

        if (result.success) {
            setIsPromoteDialogOpen(false);
            setSelectedUserId(null);
            setSelectedUserName('');
        }
    };

    const handleDemote = async () => {
        if (!selectedUserId) return;

        setIsProcessing(true);
        const result = await demoteAdmin(selectedUserId);
        setIsProcessing(false);

        if (result.success) {
            setIsDemoteDialogOpen(false);
            setSelectedUserId(null);
            setSelectedUserName('');
        }
    };

    const isCurrentUser = (userId: string) => user?.id === userId;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                    <Settings className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                        Configurações
                    </h1>
                    <p className="text-sm text-gray-500">
                        Gerencie administradores e configurações do sistema
                    </p>
                </div>
            </div>

            {/* Seção: Administradores */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 overflow-hidden">
                <button
                    onClick={() => toggleSection('admins')}
                    className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-900/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <Shield className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                            <h2 className="text-lg font-semibold text-white">Administradores</h2>
                            <p className="text-sm text-gray-500">{admins.length} admin(s) no sistema</p>
                        </div>
                    </div>
                    {expandedSections.admins ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                    )}
                </button>

                {expandedSections.admins && (
                    <div className="border-t border-gray-800/50 p-4 sm:p-6 space-y-6">
                        {/* Lista de Admins */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-300">Administradores atuais</h3>

                            {loadingAdmins ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 text-sky-400 animate-spin" strokeWidth={1.5} />
                                </div>
                            ) : admins.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Nenhum administrador encontrado
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {admins.map((admin) => (
                                        <div
                                            key={admin.id}
                                            className="flex items-center justify-between rounded-lg border border-gray-800/50 bg-gray-900/50 p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                                                    <Crown className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {admin.name}
                                                        {isCurrentUser(admin.id) && (
                                                            <span className="ml-2 text-xs text-sky-400">(você)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{admin.email}</p>
                                                </div>
                                            </div>

                                            {!isCurrentUser(admin.id) && admins.length > 1 && (
                                                <button
                                                    onClick={() => openDemoteDialog(admin.id, admin.name)}
                                                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                >
                                                    <UserMinus className="h-4 w-4" strokeWidth={1.5} />
                                                    <span className="hidden sm:inline">Remover</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Promover Aluno */}
                        {students.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-gray-800/50">
                                <h3 className="text-sm font-medium text-gray-300">Promover aluno a administrador</h3>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {students.map((student) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between rounded-lg border border-gray-800/50 bg-gray-900/50 p-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 flex-shrink-0">
                                                    <Users className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-200 text-sm truncate">
                                                        {student.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => openPromoteDialog(student.id, student.name)}
                                                className="flex-shrink-0 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                            >
                                                <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                <span className="hidden sm:inline">Promover</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {students.length === 0 && !loadingAdmins && (
                            <div className="pt-4 border-t border-gray-800/50">
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Nenhum aluno ativo para promover. Cadastre alunos primeiro.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Seção: Dados da Escola */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 overflow-hidden">
                <button
                    onClick={() => toggleSection('school')}
                    className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-900/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <Building2 className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                            <h2 className="text-lg font-semibold text-white">Dados da Escola</h2>
                            <p className="text-sm text-gray-500">Nome e descrição do portal</p>
                        </div>
                    </div>
                    {expandedSections.school ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                    )}
                </button>

                {expandedSections.school && (
                    <div className="border-t border-gray-800/50 p-4 sm:p-6 space-y-4">
                        {/* Nome da Escola */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Nome da Escola
                            </label>
                            <input
                                type="text"
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                                placeholder="Ex: Code Plus"
                            />
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Descrição
                            </label>
                            <textarea
                                value={schoolDescription}
                                onChange={(e) => setSchoolDescription(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors resize-none"
                                placeholder="Descreva sua escola..."
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={handleResetSettings}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                                Restaurar padrão
                            </button>

                            <div className="flex items-center gap-3">
                                {saveSuccess && (
                                    <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                                        <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                        Salvo!
                                    </span>
                                )}
                                <button
                                    onClick={handleSaveSchoolSettings}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" strokeWidth={1.5} />
                                    )}
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Seção: Sobre o Sistema */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 overflow-hidden">
                <button
                    onClick={() => toggleSection('system')}
                    className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-900/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <Info className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                            <h2 className="text-lg font-semibold text-white">Sobre o Sistema</h2>
                            <p className="text-sm text-gray-500">Informações e estatísticas</p>
                        </div>
                    </div>
                    {expandedSections.system ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                    )}
                </button>

                {expandedSections.system && (
                    <div className="border-t border-gray-800/50 p-4 sm:p-6 space-y-6">
                        {/* Versão */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30">
                            <div>
                                <p className="text-sm font-medium text-gray-300">Portal do Aluno</p>
                                <p className="text-xs text-gray-500">Code Plus Edition</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-sm font-medium">
                                v8.0
                            </span>
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-4 rounded-lg bg-gray-800/30 text-center">
                                <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                                <p className="text-xs text-gray-500 mt-1">Alunos</p>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-800/30 text-center">
                                <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
                                <p className="text-xs text-gray-500 mt-1">Cursos</p>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-800/30 text-center">
                                <p className="text-2xl font-bold text-white">{stats.totalModules}</p>
                                <p className="text-xs text-gray-500 mt-1">Módulos</p>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-800/30 text-center">
                                <p className="text-2xl font-bold text-white">{stats.totalLessons}</p>
                                <p className="text-xs text-gray-500 mt-1">Aulas</p>
                            </div>
                        </div>

                        {/* Créditos */}
                        <div className="pt-4 border-t border-gray-800/50">
                            <p className="text-xs text-gray-600 text-center">
                                Desenvolvido com ❤️ para a Code Plus
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialog: Promover Admin */}
            <ConfirmDialog
                isOpen={isPromoteDialogOpen}
                onClose={() => {
                    setIsPromoteDialogOpen(false);
                    setSelectedUserId(null);
                    setSelectedUserName('');
                }}
                onConfirm={handlePromote}
                title="Promover a Administrador"
                message={`Tem certeza que deseja promover "${selectedUserName}" a administrador? Essa pessoa terá acesso total ao painel administrativo.`}
                confirmText="Promover"
                isLoading={isProcessing}
                variant="warning"
            />

            {/* Dialog: Remover Admin */}
            <ConfirmDialog
                isOpen={isDemoteDialogOpen}
                onClose={() => {
                    setIsDemoteDialogOpen(false);
                    setSelectedUserId(null);
                    setSelectedUserName('');
                }}
                onConfirm={handleDemote}
                title="Remover Administrador"
                message={`Tem certeza que deseja remover "${selectedUserName}" como administrador? Essa pessoa voltará a ser um aluno comum.`}
                confirmText="Remover"
                isLoading={isProcessing}
                variant="danger"
            />
        </div>
    );
}