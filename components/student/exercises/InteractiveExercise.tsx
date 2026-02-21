// components/student/exercises/InteractiveExercise.tsx
'use client';

import { useState, useCallback } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import type { InteractiveExerciseData, OrderingItem, TrueFalseStatement } from '@/lib/types/content-import';

interface InteractiveExerciseProps {
    data: InteractiveExerciseData;
}

export function InteractiveExercise({ data }: InteractiveExerciseProps) {
    switch (data.exercise_type) {
        case 'ordering':
            return <OrderingExercise data={data} />;
        case 'true_false':
            return <TrueFalseExercise data={data} />;
        default:
            return <OpenExercise data={data} />;
    }
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
    let color: string;
    let icon: typeof Trophy;

    if (percentage === 100) {
        message = "Perfeito! Você acertou tudo! 🎉";
        color = "emerald";
        icon = Trophy;
    } else if (percentage >= 80) {
        message = "Excelente! Quase perfeito!";
        color = "sky";
        icon = CheckCircle;
    } else if (percentage >= 60) {
        message = "Bom trabalho! Mas revise os erros.";
        color = "amber";
        icon = Lightbulb;
    } else if (percentage >= 40) {
        message = "Precisa estudar mais este tema.";
        color = "amber";
        icon = Lightbulb;
    } else {
        message = "Releia o conteúdo e tente novamente!";
        color = "rose";
        icon = RotateCcw;
    }

    const Icon = icon;

    return (
        <div className={cn(
            "flex items-center gap-3 p-4 rounded-lg border",
            `bg-${color}-500/10 border-${color}-500/20`
        )}>
            <Icon className={`h-6 w-6 text-${color}-400 shrink-0`} strokeWidth={1.5} />
            <div>
                <p className={`font-semibold text-${color}-300`}>
                    {score}/{total} correto(s)
                </p>
                <p className="text-sm text-gray-400">{message}</p>
            </div>
        </div>
    );
}

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