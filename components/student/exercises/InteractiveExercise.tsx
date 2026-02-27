// components/student/exercises/InteractiveExercise.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import {
    CheckCircle,
    XCircle,
    ArrowUpDown,
    ToggleLeft,
    ToggleRight,
    Trophy,
    RotateCcw,
    Eye,
    Lightbulb,
    PenLine,
    Link2,
    ListChecks,
    Code2,
    Move,
    Bug,
    Terminal,
    FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import type {
    InteractiveExerciseData,
    OrderingItem,
    TrueFalseStatement,
    FillBlankData,
    MatchingData,
    MatchingPair,
    MultipleSelectData,
    MultipleSelectOption,
    DebuggingData,
    CodeOutputData,
    CategorizeData,
} from '@/lib/types/content-import';

interface InteractiveExerciseProps {
    data: InteractiveExerciseData;
}

export function InteractiveExercise({ data }: InteractiveExerciseProps) {
    switch (data.exercise_type) {
        case 'ordering':
            return <OrderingExercise data={data} />;
        case 'true_false':
            return <TrueFalseExercise data={data} />;
        case 'fill_blank':
            return <FillBlankExercise data={data} />;
        case 'matching':
            return <MatchingExercise data={data} />;
        case 'multiple_select':
            return <MultipleSelectExercise data={data} />;
        case 'code_completion':
            return <CodeCompletionExercise data={data} />;
        case 'drag_drop':
            return <DragDropExercise data={data} />;
        case 'debugging':
            return <DebuggingExercise data={data} />;
        case 'code_output':
            return <CodeOutputExercise data={data} />;
        case 'categorize':
            return <CategorizeExercise data={data} />;

        default:
            return <OpenExercise data={data} />;
    }
}

// ═══════════════════════════════════════════════════════════════
// DRAG AND DROP EXERCISE (NOVO!)
// ═══════════════════════════════════════════════════════════════

function DragDropExercise({ data }: { data: InteractiveExerciseData }) {
    const dragData = data.drag_drop_data;
    const items = dragData?.items || [];
    const zones = dragData?.zones || [];

    const [placements, setPlacements] = useState<Record<string, string>>({});  // zoneId -> itemId
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    // Itens disponíveis (não colocados em nenhuma zona)
    const availableItems = useMemo(() => {
        const placedItemIds = new Set(Object.values(placements));
        return items.filter((item) => !placedItemIds.has(item.id));
    }, [items, placements]);

    const handleDragStart = useCallback((itemId: string) => {
        if (submitted) return;
        setDraggedItemId(itemId);
    }, [submitted]);

    const handleDragEnd = useCallback(() => {
        setDraggedItemId(null);
    }, []);

    const handleDropOnZone = useCallback((zoneId: string) => {
        if (submitted || !draggedItemId) return;

        // Remove o item de qualquer zona anterior
        setPlacements((prev) => {
            const newPlacements = { ...prev };

            // Remove de zona anterior se existir
            Object.keys(newPlacements).forEach((key) => {
                if (newPlacements[key] === draggedItemId) {
                    delete newPlacements[key];
                }
            });

            // Coloca na nova zona
            newPlacements[zoneId] = draggedItemId;

            return newPlacements;
        });

        setDraggedItemId(null);
    }, [submitted, draggedItemId]);

    const handleRemoveFromZone = useCallback((zoneId: string) => {
        if (submitted) return;
        setPlacements((prev) => {
            const newPlacements = { ...prev };
            delete newPlacements[zoneId];
            return newPlacements;
        });
    }, [submitted]);

    const handleClickToPlace = useCallback((itemId: string) => {
        if (submitted) return;

        // Encontra a primeira zona vazia
        const emptyZone = zones.find((zone) => !placements[zone.id]);

        if (emptyZone) {
            setPlacements((prev) => ({
                ...prev,
                [emptyZone.id]: itemId,
            }));
        }
    }, [submitted, zones, placements]);

    const handleSubmit = useCallback((): void => {
        setSubmitted(true);
    }, []);

    const handleRetry = useCallback((): void => {
        setPlacements({});
        setSubmitted(false);
        setShowExplanation(false);
    }, []);

    const allZonesFilled = zones.every((zone) => placements[zone.id]);

    const correctCount = useMemo(() => {
        if (!submitted) return 0;
        return zones.filter((zone) => placements[zone.id] === zone.correct_item_id).length;
    }, [submitted, zones, placements]);

    const getItemById = useCallback((itemId: string) => {
        return items.find((item) => item.id === itemId);
    }, [items]);

    if (!dragData) {
        return (
            <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-300">
                Erro: Dados do exercício drag_drop não encontrados.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-300">Arraste os itens para as posições corretas</span>
                <DifficultyBadge difficulty={data.difficulty} />
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            {/* Itens disponíveis */}
            <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Itens disponíveis</p>
                <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 rounded-lg border border-dashed border-gray-700 bg-gray-900/30">
                    {availableItems.length === 0 ? (
                        <span className="text-sm text-gray-600 italic">Todos os itens foram posicionados</span>
                    ) : (
                        availableItems.map((item) => (
                            <div
                                key={item.id}
                                draggable={!submitted}
                                onDragStart={() => handleDragStart(item.id)}
                                onDragEnd={handleDragEnd}
                                onClick={() => handleClickToPlace(item.id)}
                                className={cn(
                                    "px-3 py-2 rounded-lg border text-sm font-medium transition-all select-none",
                                    !submitted && "cursor-grab active:cursor-grabbing bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20",
                                    submitted && "bg-gray-800 border-gray-700 text-gray-400 cursor-default",
                                    draggedItemId === item.id && "opacity-50 ring-2 ring-sky-500"
                                )}
                            >
                                {item.content}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Zonas de drop */}
            <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Posicione aqui</p>
                <div className="grid gap-3 sm:grid-cols-2">
                    {zones.map((zone) => {
                        const placedItemId = placements[zone.id];
                        const placedItem = placedItemId ? getItemById(placedItemId) : null;
                        const isCorrect = submitted && placedItemId === zone.correct_item_id;
                        const isWrong = submitted && placedItemId && placedItemId !== zone.correct_item_id;
                        const correctItem = submitted && isWrong ? getItemById(zone.correct_item_id) : null;

                        return (
                            <div
                                key={zone.id}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDropOnZone(zone.id)}
                                className={cn(
                                    "relative p-4 rounded-lg border-2 border-dashed transition-all min-h-[5rem]",
                                    !submitted && !placedItem && "border-gray-700 bg-gray-900/30",
                                    !submitted && placedItem && "border-sky-500/50 bg-sky-500/5",
                                    !submitted && draggedItemId && !placedItem && "border-sky-500 bg-sky-500/10",
                                    submitted && isCorrect && "border-emerald-500/50 bg-emerald-500/5",
                                    submitted && isWrong && "border-rose-500/50 bg-rose-500/5"
                                )}
                            >
                                <p className="text-xs text-gray-500 mb-2">{zone.label}</p>

                                {placedItem ? (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-lg text-sm font-medium",
                                            !submitted && "bg-sky-500/20 text-sky-300",
                                            submitted && isCorrect && "bg-emerald-500/20 text-emerald-300",
                                            submitted && isWrong && "bg-rose-500/20 text-rose-300"
                                        )}>
                                            {placedItem.content}
                                        </span>

                                        <div className="flex items-center gap-1">
                                            {submitted && isCorrect && (
                                                <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                                            )}
                                            {submitted && isWrong && (
                                                <XCircle className="h-5 w-5 text-rose-400" strokeWidth={1.5} />
                                            )}
                                            {!submitted && (
                                                <button
                                                    onClick={() => handleRemoveFromZone(zone.id)}
                                                    className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                                                >
                                                    <XCircle className="h-4 w-4" strokeWidth={1.5} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-8 text-gray-600 text-sm">
                                        {submitted ? '(vazio)' : 'Arraste um item aqui'}
                                    </div>
                                )}

                                {submitted && isWrong && correctItem && (
                                    <p className="mt-2 text-xs text-emerald-400">
                                        Correto: {correctItem.content}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!allZonesFilled}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Verificar Resposta
                </button>
            ) : (
                <div className="space-y-3">
                    <FeedbackMessage score={correctCount} total={zones.length} />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                            Tentar novamente
                        </button>
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                        </button>
                    </div>

                    {showExplanation && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                            <MarkdownRenderer content={data.answer_explanation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const config: Record<string, { label: string; className: string }> = {
        easy: { label: '🟢 Fácil', className: 'bg-emerald-500/10 text-emerald-400' },
        medium: { label: '🟡 Médio', className: 'bg-amber-500/10 text-amber-400' },
        hard: { label: '🔴 Difícil', className: 'bg-rose-500/10 text-rose-400' },
    };

    const { label, className } = config[difficulty] || config.easy;

    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
            {label}
        </span>
    );
}

function FeedbackMessage({ score, total }: { score: number; total: number }) {
    const percentage = total > 0 ? (score / total) * 100 : 0;

    let message: string;
    let colorClass: string;
    let Icon: typeof Trophy;

    if (percentage === 100) {
        message = "Perfeito! Você acertou tudo! 🎉";
        colorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
        Icon = Trophy;
    } else if (percentage >= 80) {
        message = "Excelente! Quase perfeito!";
        colorClass = "bg-sky-500/10 border-sky-500/20 text-sky-300";
        Icon = CheckCircle;
    } else if (percentage >= 60) {
        message = "Bom trabalho! Mas revise os erros.";
        colorClass = "bg-amber-500/10 border-amber-500/20 text-amber-300";
        Icon = Lightbulb;
    } else if (percentage >= 40) {
        message = "Precisa estudar mais este tema.";
        colorClass = "bg-amber-500/10 border-amber-500/20 text-amber-300";
        Icon = Lightbulb;
    } else {
        message = "Releia o conteúdo e tente novamente!";
        colorClass = "bg-rose-500/10 border-rose-500/20 text-rose-300";
        Icon = RotateCcw;
    }

    return (
        <div className={cn("flex items-center gap-3 p-4 rounded-lg border", colorClass)}>
            <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} />
            <div>
                <p className="font-semibold">
                    {score}/{total} correto(s)
                </p>
                <p className="text-sm opacity-80">{message}</p>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MULTIPLE SELECT EXERCISE
// ═══════════════════════════════════════════════════════════════

function MultipleSelectExercise({ data }: { data: InteractiveExerciseData }) {
    const selectData = data.multiple_select_data;
    const options = selectData?.options || [];

    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const handleToggleOption = useCallback((optionId: string): void => {
        if (submitted) return;
        setSelectedOptions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(optionId)) {
                newSet.delete(optionId);
            } else {
                newSet.add(optionId);
            }
            return newSet;
        });
    }, [submitted]);

    const handleSubmit = useCallback((): void => {
        setSubmitted(true);
    }, []);

    const handleRetry = useCallback((): void => {
        setSelectedOptions(new Set());
        setSubmitted(false);
        setShowExplanation(false);
    }, []);

    const correctOptions = useMemo(() => {
        return options.filter((opt) => opt.correct);
    }, [options]);

    const correctCount = useMemo(() => {
        if (!submitted) return 0;

        let correct = 0;
        let incorrect = 0;

        options.forEach((opt) => {
            const isSelected = selectedOptions.has(opt.id);
            if (opt.correct && isSelected) {
                correct++;
            } else if (!opt.correct && isSelected) {
                incorrect++;
            }
        });

        return Math.max(0, correct - incorrect);
    }, [submitted, options, selectedOptions]);

    const hasMinSelections = useMemo(() => {
        const min = selectData?.min_selections || 1;
        return selectedOptions.size >= min;
    }, [selectData, selectedOptions]);

    if (!selectData) {
        return (
            <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-300">
                Erro: Dados do exercício multiple_select não encontrados.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-300">
                    Selecione todas as opções corretas
                </span>
                <DifficultyBadge difficulty={data.difficulty} />
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            {/* Opções */}
            <div className="grid gap-2 sm:grid-cols-2">
                {options.map((option: MultipleSelectOption) => {
                    const isSelected = selectedOptions.has(option.id);
                    const isCorrect = submitted && option.correct;
                    const isWrong = submitted && isSelected && !option.correct;
                    const isMissed = submitted && option.correct && !isSelected;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleToggleOption(option.id)}
                            disabled={submitted}
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-lg border text-left transition-all",
                                submitted && isCorrect && isSelected && "border-emerald-500/30 bg-emerald-500/10",
                                submitted && isWrong && "border-rose-500/30 bg-rose-500/10",
                                submitted && isMissed && "border-amber-500/30 bg-amber-500/5",
                                !submitted && isSelected && "border-sky-500 bg-sky-500/10",
                                !submitted && !isSelected && "border-gray-800 bg-gray-900/50 hover:border-gray-700"
                            )}
                        >
                            <div className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors mt-0.5",
                                submitted && isCorrect && "border-emerald-500 bg-emerald-500",
                                submitted && isWrong && "border-rose-500 bg-rose-500",
                                submitted && isMissed && "border-amber-500",
                                !submitted && isSelected && "border-sky-500 bg-sky-500",
                                !submitted && !isSelected && "border-gray-600"
                            )}>
                                {(isSelected || (submitted && isCorrect)) && (
                                    <CheckCircle className="h-3 w-3 text-white" strokeWidth={2} />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm",
                                    submitted && isCorrect && "text-emerald-300",
                                    submitted && isWrong && "text-rose-300",
                                    submitted && isMissed && "text-amber-300",
                                    !submitted && "text-gray-200"
                                )}>
                                    {option.text}
                                </p>

                                {submitted && option.explanation && (
                                    <p className="text-xs text-gray-500 mt-1 italic">
                                        {option.explanation}
                                    </p>
                                )}
                            </div>

                            {submitted && isCorrect && isSelected && (
                                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
                            )}
                            {submitted && isWrong && (
                                <XCircle className="h-4 w-4 text-rose-400 shrink-0" strokeWidth={1.5} />
                            )}
                            {submitted && isMissed && (
                                <span className="text-xs text-amber-400 shrink-0">Faltou</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!hasMinSelections}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Verificar Respostas
                </button>
            ) : (
                <div className="space-y-3">
                    <FeedbackMessage score={correctCount} total={correctOptions.length} />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                            Tentar novamente
                        </button>
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                        </button>
                    </div>

                    {showExplanation && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                            <MarkdownRenderer content={data.answer_explanation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// CODE COMPLETION EXERCISE
// ═══════════════════════════════════════════════════════════════

function CodeCompletionExercise({ data }: { data: InteractiveExerciseData }) {
    const codeData = data.code_completion_data;
    const blanks = codeData?.blanks || [];

    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const handleAnswerChange = useCallback((blankId: string, value: string): void => {
        if (submitted) return;
        setUserAnswers((prev) => ({ ...prev, [blankId]: value }));
    }, [submitted]);

    const handleSubmit = useCallback((): void => {
        setSubmitted(true);
    }, []);

    const handleRetry = useCallback((): void => {
        setUserAnswers({});
        setSubmitted(false);
        setShowExplanation(false);
    }, []);

    const checkAnswer = useCallback((blankId: string): boolean => {
        const blank = blanks.find((b) => b.id === blankId);
        if (!blank) return false;

        const userAnswer = userAnswers[blankId]?.trim() || '';
        const correctAnswer = blank.correct_answer.trim();

        // Code completion é case-sensitive por padrão
        return userAnswer === correctAnswer;
    }, [blanks, userAnswers]);

    const allAnswered = blanks.every((blank) =>
        userAnswers[blank.id]?.trim().length > 0
    );

    const correctCount = useMemo(() => {
        if (!submitted) return 0;
        return blanks.filter((blank) => checkAnswer(blank.id)).length;
    }, [submitted, blanks, checkAnswer]);

    const renderedCode = useMemo(() => {
        if (!codeData?.code_template) return null;

        const template = codeData.code_template;
        const lines = template.split('\n');

        return lines.map((line, lineIndex) => {
            const parts: React.ReactNode[] = [];
            let lastIndex = 0;
            let blankIndex = 0;

            const regex = /\{(\d+)\}|_{3,}/g;
            let match;

            while ((match = regex.exec(line)) !== null) {
                // Texto antes da lacuna
                if (match.index > lastIndex) {
                    parts.push(
                        <span key={`${lineIndex}-text-${lastIndex}`} className="text-gray-300">
                            {line.slice(lastIndex, match.index)}
                        </span>
                    );
                }

                // Determina qual blank usar
                let currentBlankIndex: number;
                if (match[1]) {
                    currentBlankIndex = parseInt(match[1]) - 1;
                } else {
                    currentBlankIndex = blankIndex;
                    blankIndex++;
                }

                const blank = blanks[currentBlankIndex];

                if (blank) {
                    const userAnswer = userAnswers[blank.id] || '';
                    const isCorrect = submitted && checkAnswer(blank.id);
                    const isWrong = submitted && !checkAnswer(blank.id) && userAnswer.length > 0;
                    const hasAlternatives = blank.alternatives && blank.alternatives.length > 0;

                    parts.push(
                        <span key={blank.id} className="inline-flex items-center gap-1 mx-1">
                            {hasAlternatives ? (
                                <select
                                    value={userAnswer}
                                    onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                                    disabled={submitted}
                                    className={cn(
                                        "px-2 py-0.5 rounded border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50",
                                        submitted && isCorrect && "bg-emerald-500/30 border-emerald-500/50 text-emerald-300",
                                        submitted && isWrong && "bg-rose-500/30 border-rose-500/50 text-rose-300",
                                        !submitted && "bg-gray-800 border-gray-600 text-sky-300"
                                    )}
                                >
                                    <option value="">___</option>
                                    {blank.alternatives!.map((alt, i) => (
                                        <option key={i} value={alt}>{alt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                                    disabled={submitted}
                                    placeholder={blank.hint || "___"}
                                    size={Math.max(blank.correct_answer.length, 5)}
                                    className={cn(
                                        "px-2 py-0.5 rounded border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-center",
                                        submitted && isCorrect && "bg-emerald-500/30 border-emerald-500/50 text-emerald-300",
                                        submitted && isWrong && "bg-rose-500/30 border-rose-500/50 text-rose-300",
                                        !submitted && "bg-gray-800 border-gray-600 text-sky-300 placeholder:text-gray-600"
                                    )}
                                />
                            )}

                            {submitted && isCorrect && (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
                            )}
                            {submitted && isWrong && (
                                <span className="flex items-center gap-0.5">
                                    <XCircle className="h-3.5 w-3.5 text-rose-400" strokeWidth={2} />
                                    <span className="text-xs text-emerald-400 font-mono">({blank.correct_answer})</span>
                                </span>
                            )}
                        </span>
                    );
                }

                lastIndex = match.index + match[0].length;
            }

            // Texto restante na linha
            if (lastIndex < line.length) {
                parts.push(
                    <span key={`${lineIndex}-text-${lastIndex}`} className="text-gray-300">
                        {line.slice(lastIndex)}
                    </span>
                );
            }

            return (
                <div key={lineIndex} className="flex items-center min-h-[1.75rem]">
                    <span className="w-8 text-right pr-3 text-gray-600 text-xs select-none">
                        {lineIndex + 1}
                    </span>
                    <span className="flex-1 whitespace-pre">
                        {parts.length > 0 ? parts : <span>&nbsp;</span>}
                    </span>
                </div>
            );
        });
    }, [codeData, blanks, userAnswers, submitted, checkAnswer, handleAnswerChange]);

    if (!codeData) {
        return (
            <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-300">
                Erro: Dados do exercício code_completion não encontrados.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-300">Complete o código</span>
                <DifficultyBadge difficulty={data.difficulty} />
                <span className="px-2 py-0.5 rounded text-xs bg-violet-500/10 text-violet-400 font-mono">
                    {codeData.language}
                </span>
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            {/* Bloco de código */}
            <div className="rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                    <span className="text-xs text-gray-500 font-mono">{codeData.language}</span>
                    <span className="text-xs text-gray-600">
                        {blanks.length} {blanks.length === 1 ? 'lacuna' : 'lacunas'}
                    </span>
                </div>
                <div className="p-4 font-mono text-sm overflow-x-auto">
                    {renderedCode}
                </div>
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Verificar Código
                </button>
            ) : (
                <div className="space-y-3">
                    <FeedbackMessage score={correctCount} total={blanks.length} />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                            Tentar novamente
                        </button>
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                        </button>
                    </div>

                    {showExplanation && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                            <MarkdownRenderer content={data.answer_explanation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MATCHING EXERCISE
// ═══════════════════════════════════════════════════════════════

function MatchingExercise({ data }: { data: InteractiveExerciseData }) {
    const matchingData = data.matching_data;
    const pairs = matchingData?.pairs || [];

    const [userMatches, setUserMatches] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const shuffledRightItems = useMemo(() => {
        return [...pairs].sort(() => Math.random() - 0.5);
    }, [pairs]);

    const handleMatch = useCallback((pairId: string, selectedRight: string): void => {
        if (submitted) return;
        setUserMatches((prev) => ({ ...prev, [pairId]: selectedRight }));
    }, [submitted]);

    const handleSubmit = useCallback((): void => {
        setSubmitted(true);
    }, []);

    const handleRetry = useCallback((): void => {
        setUserMatches({});
        setSubmitted(false);
        setShowExplanation(false);
    }, []);

    const checkMatch = useCallback((pairId: string): boolean => {
        const pair = pairs.find((p) => p.id === pairId);
        if (!pair) return false;
        return userMatches[pairId] === pair.right;
    }, [pairs, userMatches]);

    const allAnswered = pairs.every((pair) =>
        userMatches[pair.id]?.length > 0
    );

    const correctCount = useMemo(() => {
        if (!submitted) return 0;
        return pairs.filter((pair) => checkMatch(pair.id)).length;
    }, [submitted, pairs, checkMatch]);

    if (!matchingData) {
        return (
            <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-300">
                Erro: Dados do exercício matching não encontrados.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-300">Conecte os itens correspondentes</span>
                <DifficultyBadge difficulty={data.difficulty} />
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="text-center text-sm font-medium text-gray-400">
                    {matchingData.left_column_title || 'Termo'}
                </div>
                <div className="text-center text-sm font-medium text-gray-400">
                    {matchingData.right_column_title || 'Correspondência'}
                </div>
            </div>

            <div className="space-y-3">
                {pairs.map((pair: MatchingPair) => {
                    const userMatch = userMatches[pair.id] || '';
                    const isCorrect = submitted && checkMatch(pair.id);
                    const isWrong = submitted && !checkMatch(pair.id) && userMatch.length > 0;

                    return (
                        <div
                            key={pair.id}
                            className={cn(
                                "grid grid-cols-2 gap-4 p-3 rounded-lg border transition-all",
                                submitted && isCorrect && "border-emerald-500/30 bg-emerald-500/5",
                                submitted && isWrong && "border-rose-500/30 bg-rose-500/5",
                                !submitted && "border-gray-800 bg-gray-900/50"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-200 font-medium">
                                    {pair.left}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={userMatch}
                                    onChange={(e) => handleMatch(pair.id, e.target.value)}
                                    disabled={submitted}
                                    className={cn(
                                        "flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50",
                                        submitted && isCorrect && "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
                                        submitted && isWrong && "bg-rose-500/20 border-rose-500/30 text-rose-300",
                                        !submitted && "bg-gray-800 border-gray-700 text-white"
                                    )}
                                >
                                    <option value="">Selecione...</option>
                                    {shuffledRightItems.map((item) => (
                                        <option key={item.id} value={item.right}>
                                            {item.right}
                                        </option>
                                    ))}
                                </select>

                                {submitted && isCorrect && (
                                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" strokeWidth={1.5} />
                                )}
                                {submitted && isWrong && (
                                    <XCircle className="h-5 w-5 text-rose-400 shrink-0" strokeWidth={1.5} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {submitted && correctCount < pairs.length && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-sm font-medium text-amber-300 mb-2">Respostas corretas:</p>
                    <ul className="space-y-1">
                        {pairs.filter((pair) => !checkMatch(pair.id)).map((pair) => (
                            <li key={pair.id} className="text-sm text-gray-400">
                                <span className="text-gray-200">{pair.left}</span>
                                {' → '}
                                <span className="text-emerald-400">{pair.right}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Verificar Resposta
                </button>
            ) : (
                <div className="space-y-3">
                    <FeedbackMessage score={correctCount} total={pairs.length} />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                            Tentar novamente
                        </button>
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                        </button>
                    </div>

                    {showExplanation && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                            <MarkdownRenderer content={data.answer_explanation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// FILL BLANK EXERCISE
// ═══════════════════════════════════════════════════════════════

function FillBlankExercise({ data }: { data: InteractiveExerciseData }) {
    const fillData = data.fill_blank_data;
    const blanks = fillData?.blanks || [];

    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const handleAnswerChange = useCallback((blankId: string, value: string): void => {
        if (submitted) return;
        setUserAnswers((prev) => ({ ...prev, [blankId]: value }));
    }, [submitted]);

    const handleSubmit = useCallback((): void => {
        setSubmitted(true);
    }, []);

    const handleRetry = useCallback((): void => {
        setUserAnswers({});
        setSubmitted(false);
        setShowExplanation(false);
    }, []);

    const checkAnswer = useCallback((blankId: string): boolean => {
        const blank = blanks.find((b) => b.id === blankId);
        if (!blank) return false;

        const userAnswer = userAnswers[blankId]?.trim() || '';
        const correctAnswer = blank.correct_answer.trim();

        if (blank.case_sensitive) {
            return userAnswer === correctAnswer;
        }
        return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    }, [blanks, userAnswers]);

    const allAnswered = blanks.every((blank) =>
        userAnswers[blank.id]?.trim().length > 0
    );

    const correctCount = useMemo(() => {
        if (!submitted) return 0;
        return blanks.filter((blank) => checkAnswer(blank.id)).length;
    }, [submitted, blanks, checkAnswer]);

    const renderedText = useMemo(() => {
        if (!fillData?.text_with_blanks) return null;

        const text = fillData.text_with_blanks;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let blankIndex = 0;

        const regex = /\{(\d+)\}|_{3,}/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>
                        {text.slice(lastIndex, match.index)}
                    </span>
                );
            }

            let currentBlankIndex: number;
            if (match[1]) {
                currentBlankIndex = parseInt(match[1]) - 1;
            } else {
                currentBlankIndex = blankIndex;
                blankIndex++;
            }

            const blank = blanks[currentBlankIndex];

            if (blank) {
                const userAnswer = userAnswers[blank.id] || '';
                const isCorrect = submitted && checkAnswer(blank.id);
                const isWrong = submitted && !checkAnswer(blank.id) && userAnswer.length > 0;
                const hasAlternatives = blank.alternatives && blank.alternatives.length > 0;

                parts.push(
                    <span key={blank.id} className="inline-flex items-center gap-1 mx-1">
                        {hasAlternatives ? (
                            <select
                                value={userAnswer}
                                onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                                disabled={submitted}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50 min-w-[120px]",
                                    submitted && isCorrect && "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
                                    submitted && isWrong && "bg-rose-500/20 border-rose-500/30 text-rose-300",
                                    !submitted && "bg-gray-800 border-gray-700 text-white"
                                )}
                            >
                                <option value="">Selecione...</option>
                                {blank.alternatives!.map((alt, i) => (
                                    <option key={i} value={alt}>{alt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={userAnswer}
                                onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                                disabled={submitted}
                                placeholder={blank.hint || "Digite aqui..."}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50 min-w-[100px] max-w-[200px]",
                                    submitted && isCorrect && "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
                                    submitted && isWrong && "bg-rose-500/20 border-rose-500/30 text-rose-300",
                                    !submitted && "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                )}
                            />
                        )}

                        {submitted && isCorrect && (
                            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
                        )}
                        {submitted && isWrong && (
                            <span className="flex items-center gap-1 shrink-0">
                                <XCircle className="h-4 w-4 text-rose-400" strokeWidth={1.5} />
                                <span className="text-xs text-emerald-400">({blank.correct_answer})</span>
                            </span>
                        )}
                    </span>
                );
            }

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push(
                <span key={`text-${lastIndex}`}>
                    {text.slice(lastIndex)}
                </span>
            );
        }

        return parts;
    }, [fillData, blanks, userAnswers, submitted, checkAnswer, handleAnswerChange]);

    if (!fillData) {
        return (
            <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-300">
                Erro: Dados do exercício fill_blank não encontrados.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <PenLine className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-300">Preencha as lacunas</span>
                <DifficultyBadge difficulty={data.difficulty} />
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
                <p className="text-gray-200 leading-loose text-lg">
                    {renderedText}
                </p>
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Verificar Resposta
                </button>
            ) : (
                <div className="space-y-3">
                    <FeedbackMessage score={correctCount} total={blanks.length} />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                            Tentar novamente
                        </button>
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                        </button>
                    </div>

                    {showExplanation && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                            <MarkdownRenderer content={data.answer_explanation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// ORDERING EXERCISE
// ═══════════════════════════════════════════════════════════════

function OrderingExercise({ data }: { data: InteractiveExerciseData }) {
    const items = data.ordering_items || [];
    const [userOrder, setUserOrder] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const handleSetOrder = useCallback((itemId: string, position: number): void => {
        if (submitted) return;
        setUserOrder((prev) => ({ ...prev, [itemId]: position }));
    }, [submitted]);

    const handleSubmit = useCallback((): void => {
        setSubmitted(true);
    }, []);

    const handleRetry = useCallback((): void => {
        setUserOrder({});
        setSubmitted(false);
        setShowExplanation(false);
    }, []);

    const allAnswered = items.every((item: OrderingItem) => userOrder[item.id] !== undefined);

    const correctCount = items.filter((item: OrderingItem) =>
        userOrder[item.id] === item.correct_position
    ).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-300">Ordene os itens na sequência correta</span>
                <DifficultyBadge difficulty={data.difficulty} />
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            <div className="space-y-2">
                {items.map((item: OrderingItem) => {
                    const userPos = userOrder[item.id];
                    const isCorrect = submitted && userPos === item.correct_position;
                    const isWrong = submitted && userPos !== undefined && userPos !== item.correct_position;

                    return (
                        <div
                            key={item.id}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                submitted && isCorrect && "border-emerald-500/30 bg-emerald-500/5",
                                submitted && isWrong && "border-rose-500/30 bg-rose-500/5",
                                !submitted && "border-gray-800 bg-gray-900/50"
                            )}
                        >
                            <div className="flex items-center gap-2 shrink-0">
                                <select
                                    value={userPos ?? ''}
                                    onChange={(e) => handleSetOrder(item.id, parseInt(e.target.value))}
                                    disabled={submitted}
                                    className={cn(
                                        "w-14 h-9 rounded-lg border text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50",
                                        submitted && isCorrect && "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
                                        submitted && isWrong && "bg-rose-500/20 border-rose-500/30 text-rose-300",
                                        !submitted && "bg-gray-800 border-gray-700 text-white"
                                    )}
                                >
                                    <option value="">-</option>
                                    {items.map((_: OrderingItem, i: number) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <p className="text-sm text-gray-300 flex-1">{item.text}</p>

                            {submitted && isCorrect && (
                                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" strokeWidth={1.5} />
                            )}
                            {submitted && isWrong && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <XCircle className="h-5 w-5 text-rose-400" strokeWidth={1.5} />
                                    <span className="text-xs text-gray-500">
                                        Correto: {item.correct_position}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Verificar Resposta
                </button>
            ) : (
                <div className="space-y-3">
                    <FeedbackMessage score={correctCount} total={items.length} />

                    <div className="flex gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                            Tentar novamente
                        </button>
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                        </button>
                    </div>

                    {showExplanation && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                            <MarkdownRenderer content={data.answer_explanation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TRUE/FALSE EXERCISE
// ═══════════════════════════════════════════════════════════════

function TrueFalseExercise({ data }: { data: InteractiveExerciseData }) {
    const statements = data.true_false_statements || [];
    const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const handleAnswer = useCallback((statementId: string, value: boolean): void => {
        if (submitted) return;
        setAnswers((prev) => ({ ...prev, [statementId]: value }));
    }, [submitted]);

    const handleSubmit = useCallback((): void => {
        setSubmitted(true);
    }, []);

    const handleRetry = useCallback((): void => {
        setAnswers({});
        setSubmitted(false);
        setShowExplanation(false);
    }, []);

    const allAnswered = statements.every((s: TrueFalseStatement) => answers[s.id] !== undefined && answers[s.id] !== null);

    const correctCount = statements.filter((s: TrueFalseStatement) =>
        answers[s.id] === s.correct
    ).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ToggleLeft className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-300">Marque Verdadeiro ou Falso</span>
                <DifficultyBadge difficulty={data.difficulty} />
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            <div className="space-y-3">
                {statements.map((statement: TrueFalseStatement, index: number) => {
                    const userAnswer = answers[statement.id];
                    const isCorrect = submitted && userAnswer === statement.correct;
                    const isWrong = submitted && userAnswer !== null && userAnswer !== undefined && userAnswer !== statement.correct;

                    return (
                        <div
                            key={statement.id}
                            className={cn(
                                "rounded-lg border p-4 transition-all",
                                submitted && isCorrect && "border-emerald-500/30 bg-emerald-500/5",
                                submitted && isWrong && "border-rose-500/30 bg-rose-500/5",
                                !submitted && "border-gray-800 bg-gray-900/50"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-xs text-gray-600 mt-1 shrink-0 w-5">{index + 1}.</span>
                                <p className="text-sm text-gray-300 flex-1 leading-relaxed">{statement.statement}</p>
                            </div>

                            <div className="flex items-center gap-2 mt-3 ml-8">
                                <button
                                    onClick={() => handleAnswer(statement.id, true)}
                                    disabled={submitted}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                                        userAnswer === true && !submitted && "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30",
                                        submitted && statement.correct === true && "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
                                        submitted && userAnswer === true && !statement.correct && "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30",
                                        userAnswer !== true && !submitted && "bg-gray-800 text-gray-400 hover:bg-gray-700",
                                        submitted && userAnswer !== true && statement.correct !== true && "bg-gray-800/50 text-gray-600"
                                    )}
                                >
                                    <ToggleRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    Verdadeiro
                                </button>

                                <button
                                    onClick={() => handleAnswer(statement.id, false)}
                                    disabled={submitted}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                                        userAnswer === false && !submitted && "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30",
                                        submitted && statement.correct === false && "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
                                        submitted && userAnswer === false && statement.correct && "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30",
                                        userAnswer !== false && !submitted && "bg-gray-800 text-gray-400 hover:bg-gray-700",
                                        submitted && userAnswer !== false && statement.correct !== false && "bg-gray-800/50 text-gray-600"
                                    )}
                                >
                                    <ToggleLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    Falso
                                </button>

                                {submitted && isCorrect && (
                                    <CheckCircle className="h-4 w-4 text-emerald-400 ml-1" strokeWidth={1.5} />
                                )}
                                {submitted && isWrong && (
                                    <XCircle className="h-4 w-4 text-rose-400 ml-1" strokeWidth={1.5} />
                                )}
                            </div>

                            {submitted && statement.explanation && (
                                <p className="text-xs text-gray-500 mt-2 ml-8 italic">{statement.explanation}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Verificar Respostas
                </button>
            ) : (
                <div className="space-y-3">
                    <FeedbackMessage score={correctCount} total={statements.length} />

                    <div className="flex gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                            Tentar novamente
                        </button>
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                        </button>
                    </div>

                    {showExplanation && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                            <MarkdownRenderer content={data.answer_explanation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// OPEN EXERCISE
// ═══════════════════════════════════════════════════════════════

function OpenExercise({ data }: { data: InteractiveExerciseData }) {
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <DifficultyBadge difficulty={data.difficulty} />
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
            >
                <Eye className="h-4 w-4" strokeWidth={1.5} />
                {showExplanation ? 'Ocultar resposta' : 'Ver resposta'}
            </button>

            {showExplanation && (
                <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                    <MarkdownRenderer content={data.answer_explanation} />
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// DEBUGGING EXERCISE (NOVO v18!)
// ═══════════════════════════════════════════════════════════════

function DebuggingExercise({ data }: { data: InteractiveExerciseData }) {
    const debugData = data.debugging_data;

    const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);
    const [showHints, setShowHints] = useState<Record<string, boolean>>({});
    const [showCorrectedCode, setShowCorrectedCode] = useState<boolean>(false);

    const codeLines = useMemo(() => {
        return debugData?.buggy_code?.split('\n') || [];
    }, [debugData]);

    const bugLines = useMemo(() => {
        return new Set(debugData?.bugs?.map(b => b.line) || []);
    }, [debugData]);

    const handleToggleLine = useCallback((lineNum: number): void => {
        if (submitted) return;
        setSelectedLines(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lineNum)) {
                newSet.delete(lineNum);
            } else {
                newSet.add(lineNum);
            }
            return newSet;
        });
    }, [submitted]);

    const handleSubmit = useCallback((): void => {
        setSubmitted(true);
    }, []);

    const handleRetry = useCallback((): void => {
        setSelectedLines(new Set());
        setSubmitted(false);
        setShowExplanation(false);
        setShowHints({});
        setShowCorrectedCode(false);
    }, []);

    const toggleHint = useCallback((bugId: string): void => {
        setShowHints(prev => ({ ...prev, [bugId]: !prev[bugId] }));
    }, []);

    const correctCount = useMemo(() => {
        if (!submitted) return 0;
        let correct = 0;
        bugLines.forEach(line => {
            if (selectedLines.has(line)) correct++;
        });
        return correct;
    }, [submitted, bugLines, selectedLines]);

    const wrongSelections = useMemo(() => {
        if (!submitted) return 0;
        let wrong = 0;
        selectedLines.forEach(line => {
            if (!bugLines.has(line)) wrong++;
        });
        return wrong;
    }, [submitted, selectedLines, bugLines]);

    if (!debugData) {
        return (
            <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-300">
                Erro: Dados do exercício debugging não encontrados.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-rose-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-300">Encontre os erros no código</span>
                <DifficultyBadge difficulty={data.difficulty} />
                <span className="px-2 py-0.5 rounded text-xs bg-violet-500/10 text-violet-400 font-mono">
                    {debugData.language}
                </span>
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            {/* Dicas */}
            {!submitted && debugData.bugs.some(b => b.hint) && (
                <div className="flex flex-wrap gap-2">
                    {debugData.bugs.map((bug, index) => (
                        bug.hint && (
                            <button
                                key={bug.id}
                                onClick={() => toggleHint(bug.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
                            >
                                <Lightbulb className="h-3.5 w-3.5" strokeWidth={1.5} />
                                Dica {index + 1}
                            </button>
                        )
                    ))}
                </div>
            )}

            {/* Dicas expandidas */}
            {Object.entries(showHints).filter(([, show]) => show).map(([bugId]) => {
                const bug = debugData.bugs.find(b => b.id === bugId);
                if (!bug?.hint) return null;
                return (
                    <div key={bugId} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-300">
                        💡 {bug.hint}
                    </div>
                );
            })}

            {/* Código com linhas clicáveis */}
            <div className="rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                    <span className="text-xs text-gray-500 font-mono">{debugData.language}</span>
                    <span className="text-xs text-gray-600">
                        Clique nas linhas com erro ({selectedLines.size} selecionada{selectedLines.size !== 1 ? 's' : ''})
                    </span>
                </div>
                <div className="p-4 font-mono text-sm overflow-x-auto">
                    {codeLines.map((line, index) => {
                        const lineNum = index + 1;
                        const isSelected = selectedLines.has(lineNum);
                        const isBugLine = bugLines.has(lineNum);
                        const isCorrect = submitted && isBugLine && isSelected;
                        const isWrong = submitted && !isBugLine && isSelected;
                        const isMissed = submitted && isBugLine && !isSelected;

                        return (
                            <div
                                key={index}
                                onClick={() => handleToggleLine(lineNum)}
                                className={cn(
                                    "flex items-center min-h-[1.75rem] px-2 -mx-2 rounded cursor-pointer transition-all",
                                    !submitted && !isSelected && "hover:bg-gray-800/50",
                                    !submitted && isSelected && "bg-amber-500/20 border-l-2 border-amber-500",
                                    submitted && isCorrect && "bg-emerald-500/20 border-l-2 border-emerald-500",
                                    submitted && isWrong && "bg-rose-500/20 border-l-2 border-rose-500",
                                    submitted && isMissed && "bg-amber-500/10 border-l-2 border-amber-500/50"
                                )}
                            >
                                <span className="w-8 text-right pr-3 text-gray-600 text-xs select-none shrink-0">
                                    {lineNum}
                                </span>
                                <span className={cn(
                                    "flex-1 whitespace-pre",
                                    submitted && isCorrect && "text-emerald-300",
                                    submitted && isWrong && "text-rose-300 line-through",
                                    submitted && isMissed && "text-amber-300",
                                    !submitted && "text-gray-300"
                                )}>
                                    {line || ' '}
                                </span>
                                {submitted && isCorrect && (
                                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 ml-2" strokeWidth={1.5} />
                                )}
                                {submitted && isWrong && (
                                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 ml-2" strokeWidth={1.5} />
                                )}
                                {submitted && isMissed && (
                                    <span className="text-xs text-amber-400 shrink-0 ml-2">← erro aqui</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detalhes dos bugs após submissão */}
            {submitted && (
                <div className="space-y-3">
                    {debugData.bugs.map(bug => (
                        <div key={bug.id} className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                            <div className="flex items-center gap-2 text-amber-400 mb-2">
                                <Bug className="h-4 w-4" strokeWidth={1.5} />
                                <span className="font-medium">Linha {bug.line}: {bug.description}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-rose-400 text-xs">❌ Errado:</span>
                                    <pre className="mt-1 p-2 rounded bg-rose-500/10 text-rose-300 font-mono text-xs overflow-x-auto">
                                        {bug.incorrect_code}
                                    </pre>
                                </div>
                                <div>
                                    <span className="text-emerald-400 text-xs">✅ Correto:</span>
                                    <pre className="mt-1 p-2 rounded bg-emerald-500/10 text-emerald-300 font-mono text-xs overflow-x-auto">
                                        {bug.correct_code}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={selectedLines.size === 0}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Verificar Resposta
                </button>
            ) : (
                <div className="space-y-3">
                    <FeedbackMessage
                        score={correctCount}
                        total={bugLines.size}
                    />
                    {wrongSelections > 0 && (
                        <p className="text-sm text-rose-400">
                            ⚠️ Você marcou {wrongSelections} linha{wrongSelections !== 1 ? 's' : ''} incorretamente.
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                            Tentar novamente
                        </button>
                        <button
                            onClick={() => setShowCorrectedCode(!showCorrectedCode)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                        >
                            <Code2 className="h-4 w-4" strokeWidth={1.5} />
                            {showCorrectedCode ? 'Ocultar' : 'Ver'} código corrigido
                        </button>
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                        </button>
                    </div>

                    {showCorrectedCode && (
                        <div className="rounded-lg border border-emerald-500/20 bg-gray-950 overflow-hidden">
                            <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20">
                                <span className="text-xs text-emerald-400 font-medium">✅ Código Corrigido</span>
                            </div>
                            <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                                {debugData.correct_full_code}
                            </pre>
                        </div>
                    )}

                    {showExplanation && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                            <MarkdownRenderer content={data.answer_explanation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// CODE OUTPUT EXERCISE (NOVO v18!)
// ═══════════════════════════════════════════════════════════════

function CodeOutputExercise({ data }: { data: InteractiveExerciseData }) {
    const outputData = data.code_output_data;
    const options = outputData?.options || [];

    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const handleSelectOption = useCallback((optionId: string): void => {
        if (submitted) return;
        setSelectedOption(optionId);
    }, [submitted]);

    const handleSubmit = useCallback((): void => {
        setSubmitted(true);
    }, []);

    const handleRetry = useCallback((): void => {
        setSelectedOption(null);
        setSubmitted(false);
        setShowExplanation(false);
    }, []);

    const isCorrect = submitted && selectedOption === outputData?.correct;

    if (!outputData) {
        return (
            <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-300">
                Erro: Dados do exercício code_output não encontrados.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-300">Qual a saída deste código?</span>
                <DifficultyBadge difficulty={data.difficulty} />
                <span className="px-2 py-0.5 rounded text-xs bg-violet-500/10 text-violet-400 font-mono">
                    {outputData.language}
                </span>
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            {/* Código */}
            <div className="rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                    <span className="text-xs text-gray-500 font-mono">{outputData.language}</span>
                    <span className="text-xs text-gray-600">Analise o código abaixo</span>
                </div>
                <pre className="p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                    {outputData.code.split('\n').map((line, index) => (
                        <div key={index} className="flex">
                            <span className="w-8 text-right pr-3 text-gray-600 text-xs select-none shrink-0">
                                {index + 1}
                            </span>
                            <span>{line}</span>
                        </div>
                    ))}
                </pre>
            </div>

            {/* Opções de saída */}
            <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Selecione a saída esperada:</p>
                {options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    const isThisCorrect = submitted && option.id === outputData.correct;
                    const isThisWrong = submitted && isSelected && option.id !== outputData.correct;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleSelectOption(option.id)}
                            disabled={submitted}
                            className={cn(
                                "w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all",
                                !submitted && !isSelected && "border-gray-800 bg-gray-900/50 hover:border-gray-700",
                                !submitted && isSelected && "border-sky-500 bg-sky-500/10",
                                submitted && isThisCorrect && "border-emerald-500/30 bg-emerald-500/10",
                                submitted && isThisWrong && "border-rose-500/30 bg-rose-500/10",
                                submitted && !isThisCorrect && !isThisWrong && "border-gray-800/50 bg-gray-900/30 opacity-50"
                            )}
                        >
                            <div className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors mt-0.5",
                                !submitted && !isSelected && "border-gray-600",
                                !submitted && isSelected && "border-sky-500 bg-sky-500",
                                submitted && isThisCorrect && "border-emerald-500 bg-emerald-500",
                                submitted && isThisWrong && "border-rose-500 bg-rose-500"
                            )}>
                                {(isSelected || (submitted && isThisCorrect)) && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <pre className={cn(
                                    "font-mono text-sm whitespace-pre-wrap",
                                    submitted && isThisCorrect && "text-emerald-300",
                                    submitted && isThisWrong && "text-rose-300"
                                )}>
                                    {option.text}
                                </pre>

                                {submitted && outputData.explanation_per_option?.[option.id] && (
                                    <p className={cn(
                                        "mt-2 text-sm",
                                        isThisCorrect && "text-emerald-400",
                                        isThisWrong && "text-rose-400",
                                        !isThisCorrect && !isThisWrong && "text-gray-500"
                                    )}>
                                        {outputData.explanation_per_option[option.id]}
                                    </p>
                                )}
                            </div>

                            {submitted && isThisCorrect && (
                                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" strokeWidth={1.5} />
                            )}
                            {submitted && isThisWrong && (
                                <XCircle className="h-5 w-5 text-rose-400 shrink-0" strokeWidth={1.5} />
                            )}
                        </button>
                    );
                })}
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Verificar Resposta
                </button>
            ) : (
                <div className="space-y-3">
                    <FeedbackMessage score={isCorrect ? 1 : 0} total={1} />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                            Tentar novamente
                        </button>
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                        </button>
                    </div>

                    {showExplanation && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                            <MarkdownRenderer content={data.answer_explanation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// CATEGORIZE EXERCISE (NOVO v18!)
// ═══════════════════════════════════════════════════════════════

function CategorizeExercise({ data }: { data: InteractiveExerciseData }) {
    const catData = data.categorize_data;
    const categories = catData?.categories || [];
    const items = catData?.items || [];

    const [assignments, setAssignments] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    const unassignedItems = useMemo(() => {
        return items.filter(item => !assignments[item.id]);
    }, [items, assignments]);

    const getItemsInCategory = useCallback((categoryId: string) => {
        return items.filter(item => assignments[item.id] === categoryId);
    }, [items, assignments]);

    const handleDragStart = useCallback((itemId: string): void => {
        if (submitted) return;
        setDraggedItemId(itemId);
    }, [submitted]);

    const handleDragEnd = useCallback((): void => {
        setDraggedItemId(null);
    }, []);

    const handleDropOnCategory = useCallback((categoryId: string): void => {
        if (submitted || !draggedItemId) return;

        setAssignments(prev => {
            const newAssignments = { ...prev };
            newAssignments[draggedItemId] = categoryId;
            return newAssignments;
        });

        setDraggedItemId(null);
    }, [submitted, draggedItemId]);

    const handleClickToAssign = useCallback((itemId: string, categoryId: string): void => {
        if (submitted) return;
        setAssignments(prev => ({
            ...prev,
            [itemId]: categoryId
        }));
    }, [submitted]);

    const handleRemoveFromCategory = useCallback((itemId: string): void => {
        if (submitted) return;
        setAssignments(prev => {
            const newAssignments = { ...prev };
            delete newAssignments[itemId];
            return newAssignments;
        });
    }, [submitted]);

    const handleSubmit = useCallback((): void => {
        setSubmitted(true);
    }, []);

    const handleRetry = useCallback((): void => {
        setAssignments({});
        setSubmitted(false);
        setShowExplanation(false);
    }, []);

    const allAssigned = items.every(item => assignments[item.id]);

    const correctCount = useMemo(() => {
        if (!submitted) return 0;
        return items.filter(item => assignments[item.id] === item.correct_category).length;
    }, [submitted, items, assignments]);

    if (!catData) {
        return (
            <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-300">
                Erro: Dados do exercício categorize não encontrados.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-300">Classifique os itens nas categorias</span>
                <DifficultyBadge difficulty={data.difficulty} />
            </div>

            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <MarkdownRenderer content={data.instruction} />
            </div>

            {/* Itens não classificados */}
            {unassignedItems.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Itens para classificar</p>
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-dashed border-gray-700 bg-gray-900/30 min-h-[3rem]">
                        {unassignedItems.map(item => (
                            <div
                                key={item.id}
                                draggable={!submitted}
                                onDragStart={() => handleDragStart(item.id)}
                                onDragEnd={handleDragEnd}
                                className={cn(
                                    "px-3 py-2 rounded-lg border text-sm font-medium transition-all select-none",
                                    !submitted && "cursor-grab active:cursor-grabbing bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20",
                                    submitted && "bg-gray-800 border-gray-700 text-gray-400 cursor-default",
                                    draggedItemId === item.id && "opacity-50 ring-2 ring-sky-500"
                                )}
                            >
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Categorias */}
            <div className="grid gap-4" style={{
                gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)`
            }}>
                {categories.map(category => {
                    const itemsInCategory = getItemsInCategory(category.id);
                    const categoryColor = category.color || '#6b7280';

                    return (
                        <div
                            key={category.id}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDropOnCategory(category.id)}
                            className={cn(
                                "rounded-lg border-2 border-dashed p-4 min-h-[120px] transition-all",
                                draggedItemId && "border-sky-500/50 bg-sky-500/5",
                                !draggedItemId && "border-gray-700"
                            )}
                        >
                            <div
                                className="flex items-center gap-2 mb-3 pb-2 border-b"
                                style={{ borderColor: categoryColor }}
                            >
                                <FolderOpen
                                    className="h-4 w-4"
                                    style={{ color: categoryColor }}
                                    strokeWidth={1.5}
                                />
                                <span
                                    className="font-medium text-sm"
                                    style={{ color: categoryColor }}
                                >
                                    {category.name}
                                </span>
                                <span className="text-xs text-gray-600 ml-auto">
                                    {itemsInCategory.length} item{itemsInCategory.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {itemsInCategory.length === 0 ? (
                                    <p className="text-xs text-gray-600 text-center py-4">
                                        Arraste itens aqui
                                    </p>
                                ) : (
                                    itemsInCategory.map(item => {
                                        const isCorrect = submitted && item.correct_category === category.id;
                                        const isWrong = submitted && item.correct_category !== category.id;
                                        const correctCategory = categories.find(c => c.id === item.correct_category);

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => !submitted && handleRemoveFromCategory(item.id)}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                                                    !submitted && "cursor-pointer hover:bg-gray-700/50 bg-gray-800/50",
                                                    submitted && isCorrect && "bg-emerald-500/20 border border-emerald-500/30",
                                                    submitted && isWrong && "bg-rose-500/20 border border-rose-500/30"
                                                )}
                                            >
                                                <span className={cn(
                                                    submitted && isCorrect && "text-emerald-300",
                                                    submitted && isWrong && "text-rose-300"
                                                )}>
                                                    {item.text}
                                                </span>
                                                {submitted && isCorrect && (
                                                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
                                                )}
                                                {submitted && isWrong && (
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <XCircle className="h-4 w-4 text-rose-400" strokeWidth={1.5} />
                                                        <span className="text-xs text-emerald-400">
                                                            → {correctCategory?.name}
                                                        </span>
                                                    </div>
                                                )}
                                                {!submitted && (
                                                    <XCircle className="h-4 w-4 text-gray-600 shrink-0 hover:text-gray-400" strokeWidth={1.5} />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!allAssigned}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    Verificar Resposta
                </button>
            ) : (
                <div className="space-y-3">
                    <FeedbackMessage score={correctCount} total={items.length} />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                            Tentar novamente
                        </button>
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                        </button>
                    </div>

                    {showExplanation && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                            <MarkdownRenderer content={data.answer_explanation} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}