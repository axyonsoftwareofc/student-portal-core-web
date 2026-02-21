// app/(dashboard)/admin/importar/page.tsx
'use client';

import { Upload, ArrowLeft, ArrowRight, Loader2, CheckCircle2, XCircle, AlertTriangle, FileJson, Eye, Rocket, RotateCcw, Video, FileText, Dumbbell, HelpCircle } from 'lucide-react';
import { useContentImport } from '@/hooks/useContentImport';
import { cn } from '@/lib/utils';
import type { ImportContent, ImportQuizContent, ImportExerciseContent } from '@/lib/types/content-import';

const STEP_LABELS = [
    { key: 'input', label: 'Colar JSON', icon: FileJson },
    { key: 'preview', label: 'Preview', icon: Eye },
    { key: 'importing', label: 'Importando', icon: Rocket },
] as const;

function StepIndicator({ currentStep }: { currentStep: string }) {
    const stepIndex = STEP_LABELS.findIndex((s) => s.key === currentStep);
    const resolvedIndex = currentStep === 'success' || currentStep === 'error' ? 2 : stepIndex;

    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {STEP_LABELS.map((s, index: number) => {
                const Icon = s.icon;
                const isActive = index === resolvedIndex;
                const isCompleted = index < resolvedIndex || currentStep === 'success';

                return (
                    <div key={s.key} className="flex items-center gap-2">
                        {index > 0 && (
                            <div className={cn(
                                "w-12 h-0.5",
                                isCompleted ? "bg-emerald-500" : "bg-gray-700"
                            )} />
                        )}
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                            isActive && "bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30",
                            isCompleted && !isActive && "bg-emerald-500/20 text-emerald-400",
                            !isActive && !isCompleted && "bg-gray-800 text-gray-500"
                        )}>
                            <Icon className="h-4 w-4" strokeWidth={1.5} />
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ContentTypeIcon({ type }: { type: string }) {
    switch (type) {
        case 'VIDEO': return <Video className="h-4 w-4 text-sky-400" strokeWidth={1.5} />;
        case 'ARTICLE': return <FileText className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />;
        case 'EXERCISE': return <Dumbbell className="h-4 w-4 text-amber-400" strokeWidth={1.5} />;
        case 'QUIZ': return <HelpCircle className="h-4 w-4 text-violet-400" strokeWidth={1.5} />;
        default: return null;
    }
}

function contentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        VIDEO: 'Roteiro de Vídeo',
        ARTICLE: 'Artigo',
        EXERCISE: 'Exercício',
        QUIZ: 'Quiz',
    };
    return labels[type] || type;
}

function difficultyLabel(difficulty: string): string {
    const labels: Record<string, string> = {
        easy: '🟢 Fácil',
        medium: '🟡 Médio',
        hard: '🔴 Difícil',
    };
    return labels[difficulty] || difficulty;
}

export default function ImportPage() {
    const {
        step,
        jsonInput,
        parseErrors,
        validationErrors,
        summary,
        payload,
        importResult,
        isValidating,
        isImporting,
        setJsonInput,
        handleValidate,
        handleImport,
        handleReset,
        goBackToInput,
    } = useContentImport();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 rounded-lg">
                    <Upload className="h-6 w-6 text-sky-400" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Importar Conteúdo</h1>
                    <p className="text-sm text-gray-400">Cole o JSON gerado pelo Claude para importar blocos de conteúdo</p>
                </div>
            </div>

            <StepIndicator currentStep={step} />

            {step === 'input' && (
                <div className="space-y-4">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">
                                JSON do Bloco de Conteúdo
                            </label>
                            {jsonInput.trim() && (
                                <span className="text-xs text-gray-500">
                  {jsonInput.length.toLocaleString()} caracteres
                </span>
                            )}
                        </div>

                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='Cole aqui o JSON gerado pelo Claude...'
                            className={cn(
                                "w-full h-96 bg-gray-950 border rounded-lg p-4 text-sm font-mono text-gray-300",
                                "placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50",
                                "resize-y min-h-[200px]",
                                parseErrors || validationErrors.length > 0
                                    ? "border-rose-500/50"
                                    : "border-gray-700"
                            )}
                            spellCheck={false}
                        />

                        {parseErrors && (
                            <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                                <div className="text-sm text-rose-300">{parseErrors}</div>
                            </div>
                        )}

                        {validationErrors.length > 0 && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg space-y-2">
                                <div className="flex items-center gap-2 text-rose-400 font-medium text-sm">
                                    <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                                    {validationErrors.length} erro(s) encontrado(s):
                                </div>
                                <ul className="space-y-1">
                                    {validationErrors.map((err, index: number) => (
                                        <li key={index} className="text-sm text-rose-300 flex items-start gap-2">
                                            <span className="text-rose-500 mt-1">•</span>
                                            <span>
                        <code className="text-rose-400 bg-rose-500/10 px-1 rounded text-xs">{err.field}</code>
                                                {' '}{err.message}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={handleValidate}
                                disabled={!jsonInput.trim() || isValidating}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    jsonInput.trim() && !isValidating
                                        ? "bg-sky-600 hover:bg-sky-500 text-white"
                                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                )}
                            >
                                {isValidating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Validando...
                                    </>
                                ) : (
                                    <>
                                        Validar e Pré-visualizar
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-5">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">💡 Como usar</h3>
                        <ol className="space-y-2 text-sm text-gray-500">
                            <li className="flex items-start gap-2">
                                <span className="bg-gray-800 text-gray-400 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                                Peça ao Claude para criar o conteúdo de um bloco
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-gray-800 text-gray-400 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                                O Claude gerará o conteúdo + um JSON estruturado no final
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-gray-800 text-gray-400 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                                Revise o conteúdo, copie o JSON e cole aqui
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-gray-800 text-gray-400 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                                Clique em &quot;Validar&quot;, confira o preview e importe!
                            </li>
                        </ol>
                    </div>
                </div>
            )}

            {step === 'preview' && summary && payload && (
                <div className="space-y-4">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
                        <h2 className="text-lg font-semibold text-white">Preview da Importação</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-1">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Módulo</p>
                                <p className="text-sm font-medium text-white">{summary.moduleName}</p>
                                {summary.moduleExists ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Já existe
                  </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="h-3 w-3" /> Será criado
                  </span>
                                )}
                            </div>

                            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-1">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Aula</p>
                                <p className="text-sm font-medium text-white">{summary.lessonTitle}</p>
                                {summary.lessonExists ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Já existe
                  </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="h-3 w-3" /> Será criada
                  </span>
                                )}
                            </div>

                            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-1">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Bloco</p>
                                <p className="text-sm font-medium text-white">{summary.blockTitle}</p>
                                <span className="text-xs text-gray-400">Ordem: #{summary.blockOrder}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { label: 'Vídeos', count: summary.counts.video, color: 'sky' },
                                { label: 'Artigos', count: summary.counts.article, color: 'emerald' },
                                { label: 'Exercícios', count: summary.counts.exercise, color: 'amber' },
                                { label: 'Quizzes', count: summary.counts.quiz, color: 'violet' },
                                { label: 'Perguntas', count: summary.counts.totalQuizQuestions, color: 'violet' },
                            ].map(({ label, count, color }) => (
                                <div key={label} className="bg-gray-800/30 rounded-lg p-3 text-center">
                                    <p className={cn("text-2xl font-bold", `text-${color}-400`)}>{count}</p>
                                    <p className="text-xs text-gray-500">{label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-300">Conteúdos a importar</h3>
                            <div className="divide-y divide-gray-800">
                                {payload.contents.map((content: ImportContent, index: number) => (
                                    <div key={index} className="flex items-center gap-3 py-3">
                                        <span className="text-xs text-gray-600 w-6 text-right">{content.order}</span>
                                        <ContentTypeIcon type={content.type} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{content.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {contentTypeLabel(content.type)}
                                                {content.type === 'EXERCISE' && ` • ${difficultyLabel((content as ImportExerciseContent).difficulty)}`}
                                                {content.type === 'QUIZ' && ` • ${(content as ImportQuizContent).questions.length} perguntas`}
                                            </p>
                                        </div>
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                            <button
                                onClick={goBackToInput}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Voltar e Editar
                            </button>

                            <button
                                onClick={handleImport}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all"
                            >
                                <Rocket className="h-4 w-4" />
                                Importar Tudo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'importing' && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 text-sky-400 animate-spin" strokeWidth={1.5} />
                    <h2 className="text-lg font-semibold text-white">Importando conteúdo...</h2>
                    <p className="text-sm text-gray-400">Criando módulo, aula e conteúdos no banco de dados</p>
                </div>
            )}

            {step === 'success' && importResult && (
                <div className="bg-gray-900/50 border border-emerald-500/20 rounded-xl p-8 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-emerald-500/10 rounded-full">
                            <CheckCircle2 className="h-10 w-10 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Importação Concluída!</h2>
                        <p className="text-sm text-gray-400">Todos os conteúdos foram inseridos com sucesso</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-400">{importResult.contentsCreated}</p>
                            <p className="text-xs text-gray-500">Conteúdos Criados</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-sky-400">{importResult.moduleCreated ? 'Novo' : 'Existente'}</p>
                            <p className="text-xs text-gray-500">Módulo</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-sky-400">{importResult.lessonCreated ? 'Nova' : 'Existente'}</p>
                            <p className="text-xs text-gray-500">Aula</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-400">✓</p>
                            <p className="text-xs text-gray-500">Status</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-all"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Importar Outro Bloco
                        </button>
                        <a
                            href="/admin/aulas"
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all"
                        >
                            <Eye className="h-4 w-4" />
                            Ver Aulas
                        </a>
                    </div>
                </div>
            )}

            {step === 'error' && importResult && (
                <div className="bg-gray-900/50 border border-rose-500/20 rounded-xl p-8 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-rose-500/10 rounded-full">
                            <XCircle className="h-10 w-10 text-rose-400" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Erro na Importação</h2>
                        <p className="text-sm text-gray-400">Ocorreram erros durante o processo</p>
                    </div>

                    {importResult.errors.length > 0 && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                            <ul className="space-y-1">
                                {importResult.errors.map((err: string, index: number) => (
                                    <li key={index} className="text-sm text-rose-300 flex items-start gap-2">
                                        <span className="text-rose-500 mt-1">•</span>
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {importResult.contentsCreated > 0 && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-sm text-amber-300">
                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                {importResult.contentsCreated} conteúdo(s) foram criados antes do erro.
                                Verifique na página de Aulas e remova duplicatas se necessário.
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button
                            onClick={goBackToInput}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar e Corrigir
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-all"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Recomeçar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}