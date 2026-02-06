// components/admin/QuizEditor.tsx
'use client';

import { useState } from 'react';
import {
    Plus,
    Trash2,
    GripVertical,
    CheckCircle,
    Circle,
    AlertTriangle,
    HelpCircle
} from 'lucide-react';

export interface QuizOption {
    id: string;
    text: string;
    correct: boolean;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: QuizOption[];
}

interface QuizEditorProps {
    questions: QuizQuestion[];
    onChange: (questions: QuizQuestion[]) => void;
    disabled?: boolean;
}

// Gerar ID único
const generateId = () => crypto.randomUUID();

// Criar pergunta vazia
const createEmptyQuestion = (): QuizQuestion => ({
    id: generateId(),
    question: '',
    options: [
        { id: generateId(), text: '', correct: true },
        { id: generateId(), text: '', correct: false },
    ],
});

// Criar opção vazia
const createEmptyOption = (): QuizOption => ({
    id: generateId(),
    text: '',
    correct: false,
});

export default function QuizEditor({ questions, onChange, disabled }: QuizEditorProps) {
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(
        questions.length > 0 ? questions[0].id : null
    );

    // Adicionar pergunta
    const addQuestion = () => {
        const newQuestion = createEmptyQuestion();
        onChange([...questions, newQuestion]);
        setExpandedQuestion(newQuestion.id);
    };

    // Remover pergunta
    const removeQuestion = (questionId: string) => {
        const updated = questions.filter(q => q.id !== questionId);
        onChange(updated);
        if (expandedQuestion === questionId && updated.length > 0) {
            setExpandedQuestion(updated[0].id);
        }
    };

    // Atualizar texto da pergunta
    const updateQuestionText = (questionId: string, text: string) => {
        onChange(
            questions.map(q =>
                q.id === questionId ? { ...q, question: text } : q
            )
        );
    };

    // Adicionar opção
    const addOption = (questionId: string) => {
        onChange(
            questions.map(q =>
                q.id === questionId
                    ? { ...q, options: [...q.options, createEmptyOption()] }
                    : q
            )
        );
    };

    // Remover opção
    const removeOption = (questionId: string, optionId: string) => {
        onChange(
            questions.map(q => {
                if (q.id !== questionId) return q;

                const updatedOptions = q.options.filter(o => o.id !== optionId);

                // Se removeu a opção correta, marcar a primeira como correta
                if (!updatedOptions.some(o => o.correct) && updatedOptions.length > 0) {
                    updatedOptions[0].correct = true;
                }

                return { ...q, options: updatedOptions };
            })
        );
    };

    // Atualizar texto da opção
    const updateOptionText = (questionId: string, optionId: string, text: string) => {
        onChange(
            questions.map(q =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map(o =>
                            o.id === optionId ? { ...o, text } : o
                        )
                    }
                    : q
            )
        );
    };

    // Marcar opção como correta
    const setCorrectOption = (questionId: string, optionId: string) => {
        onChange(
            questions.map(q =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map(o => ({
                            ...o,
                            correct: o.id === optionId
                        }))
                    }
                    : q
            )
        );
    };

    // Mover pergunta
    const moveQuestion = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= questions.length) return;

        const updated = [...questions];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        onChange(updated);
    };

    // Validar pergunta
    const validateQuestion = (question: QuizQuestion): string[] => {
        const errors: string[] = [];

        if (!question.question.trim()) {
            errors.push('Pergunta vazia');
        }

        if (question.options.length < 2) {
            errors.push('Mínimo 2 opções');
        }

        const emptyOptions = question.options.filter(o => !o.text.trim());
        if (emptyOptions.length > 0) {
            errors.push(`${emptyOptions.length} opção(ões) vazia(s)`);
        }

        if (!question.options.some(o => o.correct)) {
            errors.push('Nenhuma resposta correta');
        }

        return errors;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-gray-300">
                        {questions.length} {questions.length === 1 ? 'pergunta' : 'perguntas'}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={addQuestion}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    Adicionar Pergunta
                </button>
            </div>

            {/* Lista de perguntas */}
            {questions.length === 0 ? (
                <div className="text-center py-8 rounded-lg border border-dashed border-gray-700 bg-gray-900/30">
                    <HelpCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-sm text-gray-500 mb-3">Nenhuma pergunta adicionada</p>
                    <button
                        type="button"
                        onClick={addQuestion}
                        disabled={disabled}
                        className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                        Adicionar primeira pergunta
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {questions.map((question, questionIndex) => {
                        const errors = validateQuestion(question);
                        const isExpanded = expandedQuestion === question.id;
                        const hasErrors = errors.length > 0;

                        return (
                            <div
                                key={question.id}
                                className={`rounded-lg border transition-all ${
                                    isExpanded
                                        ? 'border-sky-500/50 bg-gray-900/50'
                                        : hasErrors
                                            ? 'border-amber-500/30 bg-gray-900/30'
                                            : 'border-gray-800/50 bg-gray-900/30'
                                }`}
                            >
                                {/* Header da pergunta */}
                                <div
                                    className="flex items-center gap-3 p-3 cursor-pointer"
                                    onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                                >
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <GripVertical className="h-4 w-4" strokeWidth={1.5} />
                                        <span className="flex items-center justify-center h-6 w-6 rounded bg-gray-800 text-xs font-medium">
                                            {questionIndex + 1}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${question.question ? 'text-white' : 'text-gray-500 italic'}`}>
                                            {question.question || 'Pergunta sem título...'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {question.options.length} opções
                                        </p>
                                    </div>

                                    {hasErrors && (
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveQuestion(questionIndex, questionIndex - 1);
                                            }}
                                            disabled={questionIndex === 0 || disabled}
                                            className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-30"
                                            title="Mover para cima"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveQuestion(questionIndex, questionIndex + 1);
                                            }}
                                            disabled={questionIndex === questions.length - 1 || disabled}
                                            className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-30"
                                            title="Mover para baixo"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeQuestion(question.id);
                                            }}
                                            disabled={disabled}
                                            className="p-1 text-rose-400 hover:text-rose-300"
                                            title="Remover pergunta"
                                        >
                                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>

                                {/* Conteúdo expandido */}
                                {isExpanded && (
                                    <div className="px-3 pb-3 space-y-4 border-t border-gray-800/50 pt-3">
                                        {/* Erros */}
                                        {hasErrors && (
                                            <div className="flex items-start gap-2 p-2 rounded bg-amber-950/30 border border-amber-500/20">
                                                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                                <div className="text-xs text-amber-300">
                                                    {errors.map((err, i) => (
                                                        <p key={i}>{err}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Texto da pergunta */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                                Pergunta
                                            </label>
                                            <input
                                                type="text"
                                                value={question.question}
                                                onChange={(e) => updateQuestionText(question.id, e.target.value)}
                                                placeholder="Digite a pergunta..."
                                                disabled={disabled}
                                                className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none transition-colors"
                                            />
                                        </div>

                                        {/* Opções */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-medium text-gray-400">
                                                    Opções (clique para marcar a correta)
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => addOption(question.id)}
                                                    disabled={disabled || question.options.length >= 6}
                                                    className="text-xs text-sky-400 hover:text-sky-300 disabled:opacity-50"
                                                >
                                                    + Adicionar opção
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                {question.options.map((option, optionIndex) => (
                                                    <div key={option.id} className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setCorrectOption(question.id, option.id)}
                                                            disabled={disabled}
                                                            className={`flex-shrink-0 p-1 rounded transition-colors ${
                                                                option.correct
                                                                    ? 'text-emerald-400'
                                                                    : 'text-gray-600 hover:text-gray-400'
                                                            }`}
                                                            title={option.correct ? 'Resposta correta' : 'Marcar como correta'}
                                                        >
                                                            {option.correct ? (
                                                                <CheckCircle className="h-5 w-5" strokeWidth={1.5} />
                                                            ) : (
                                                                <Circle className="h-5 w-5" strokeWidth={1.5} />
                                                            )}
                                                        </button>

                                                        <span className="text-xs text-gray-500 w-4">
                                                            {String.fromCharCode(65 + optionIndex)}
                                                        </span>

                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                                                            placeholder={`Opção ${String.fromCharCode(65 + optionIndex)}...`}
                                                            disabled={disabled}
                                                            className={`flex-1 rounded-lg border px-3 py-2 text-sm placeholder-gray-600 focus:outline-none transition-colors ${
                                                                option.correct
                                                                    ? 'border-emerald-500/30 bg-emerald-950/20 text-white focus:border-emerald-500/50'
                                                                    : 'border-gray-800 bg-gray-900 text-white focus:border-sky-500'
                                                            }`}
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(question.id, option.id)}
                                                            disabled={disabled || question.options.length <= 2}
                                                            className="flex-shrink-0 p-1 text-gray-600 hover:text-rose-400 disabled:opacity-30 transition-colors"
                                                            title="Remover opção"
                                                        >
                                                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Dica */}
            {questions.length > 0 && (
                <p className="text-xs text-gray-500 text-center">
                    💡 Clique no círculo para marcar a resposta correta. Mínimo de 2 opções por pergunta.
                </p>
            )}
        </div>
    );
}