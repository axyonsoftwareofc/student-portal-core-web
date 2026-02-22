// hooks/useContentImport.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { parseImportJson, validateImportPayload } from '@/utils/validateImportJson';
import { showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from '@/lib/toast';
import type {
    ImportPayload,
    ImportContent,
    ImportQuizContent,
    ImportExerciseContent,
    ImportStep,
    ImportResult,
    ImportSummary,
    ValidationError,
    InteractiveExerciseData,
} from '@/lib/types/content-import';
import type { QuizQuestion } from '@/lib/types/lesson-contents';

interface UseContentImportReturn {
    step: ImportStep;
    jsonInput: string;
    parseErrors: string | null;
    validationErrors: ValidationError[];
    summary: ImportSummary | null;
    payload: ImportPayload | null;
    importResult: ImportResult | null;
    isValidating: boolean;
    isImporting: boolean;
    setJsonInput: (value: string) => void;
    handleValidate: () => Promise<void>;
    handleImport: () => Promise<void>;
    handleReset: () => void;
    goBackToInput: () => void;
}

export function useContentImport(): UseContentImportReturn {
    const [step, setStep] = useState<ImportStep>('input');
    const [jsonInput, setJsonInput] = useState<string>('');
    const [parseErrors, setParseErrors] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [summary, setSummary] = useState<ImportSummary | null>(null);
    const [payload, setPayload] = useState<ImportPayload | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const findOrCreateModule = useCallback(async (
        importPayload: ImportPayload
    ): Promise<{ moduleId: string; created: boolean }> => {
        const { data: existingModules } = await supabase
            .from('modules')
            .select('id, name')
            .ilike('name', importPayload.module.name.trim());

        if (existingModules && existingModules.length > 0) {
            return { moduleId: existingModules[0].id, created: false };
        }

        if (!importPayload.module.create_if_not_exists) {
            throw new Error(`Módulo "${importPayload.module.name}" não encontrado e create_if_not_exists é false`);
        }

        const { data: courses } = await supabase
            .from('courses')
            .select('id')
            .limit(1)
            .single();

        if (!courses) {
            throw new Error('Nenhum curso encontrado. Crie um curso antes de importar.');
        }

        const { data: lastModule } = await supabase
            .from('modules')
            .select('order_index')
            .eq('course_id', courses.id)
            .order('order_index', { ascending: false })
            .limit(1)
            .single();

        const nextOrder = importPayload.module.order ?? ((lastModule?.order_index || 0) + 1);

        const { data: newModule, error: createError } = await supabase
            .from('modules')
            .insert([{
                course_id: courses.id,
                name: importPayload.module.name.trim(),
                description: importPayload.module.description?.trim() || null,
                order_index: nextOrder,
                status: 'PUBLISHED',
            }])
            .select('id')
            .single();

        if (createError || !newModule) {
            throw new Error(`Erro ao criar módulo: ${createError?.message || 'desconhecido'}`);
        }

        return { moduleId: newModule.id, created: true };
    }, [supabase]);

    const findOrCreateLesson = useCallback(async (
        importPayload: ImportPayload,
        moduleId: string
    ): Promise<{ lessonId: string; created: boolean }> => {
        const { data: existingLessons } = await supabase
            .from('lessons')
            .select('id, title')
            .eq('module_id', moduleId)
            .ilike('title', importPayload.lesson.title.trim());

        if (existingLessons && existingLessons.length > 0) {
            return { lessonId: existingLessons[0].id, created: false };
        }

        if (!importPayload.lesson.create_if_not_exists) {
            throw new Error(`Aula "${importPayload.lesson.title}" não encontrada e create_if_not_exists é false`);
        }

        const { data: lastLesson } = await supabase
            .from('lessons')
            .select('order_index')
            .eq('module_id', moduleId)
            .order('order_index', { ascending: false })
            .limit(1)
            .single();

        const nextOrder = importPayload.lesson.order ?? ((lastLesson?.order_index || 0) + 1);

        const { data: newLesson, error: createError } = await supabase
            .from('lessons')
            .insert([{
                module_id: moduleId,
                title: importPayload.lesson.title.trim(),
                description: importPayload.lesson.description?.trim() || null,
                duration: importPayload.lesson.duration?.trim() || null,
                order_index: nextOrder,
                status: 'PUBLISHED',
                total_contents: 0,
            }])
            .select('id')
            .single();

        if (createError || !newLesson) {
            throw new Error(`Erro ao criar aula: ${createError?.message || 'desconhecido'}`);
        }

        return { lessonId: newLesson.id, created: true };
    }, [supabase]);

    const transformQuizToQuizData = useCallback((content: ImportQuizContent): QuizQuestion[] => {
        return content.questions.map((q, index: number) => ({
            id: `q_${Date.now()}_${index}`,
            question: q.question,
            options: q.options.map((opt: string, optIndex: number) => ({
                id: `opt_${Date.now()}_${index}_${optIndex}`,
                text: opt,
                correct: optIndex === q.correct,
            })),
        }));
    }, []);

    const buildExerciseData = useCallback((exercise: ImportExerciseContent): { content: string; description: string | null } => {
        const interactiveData: InteractiveExerciseData = {
            exercise_type: exercise.exercise_type,
            difficulty: exercise.difficulty,
            instruction: exercise.content,
            answer_explanation: exercise.answer,
            ordering_items: exercise.ordering_items,
            true_false_statements: exercise.true_false_statements,
            fill_blank_data: exercise.fill_blank_data,
        };

        return {
            content: JSON.stringify(interactiveData),
            description: `interactive:${exercise.exercise_type}`,
        };
    }, []);

    const insertContents = useCallback(async (
        lessonId: string,
        contents: ImportContent[]
    ): Promise<number> => {
        let createdCount = 0;

        const { data: existingContents } = await supabase
            .from('lesson_contents')
            .select('order_index')
            .eq('lesson_id', lessonId)
            .order('order_index', { ascending: false })
            .limit(1)
            .single();

        const baseOrder = (existingContents?.order_index || 0);

        for (const content of contents) {
            const orderIndex = baseOrder + content.order;

            const contentData: Record<string, unknown> = {
                lesson_id: lessonId,
                type: content.type,
                title: content.title.trim(),
                order_index: orderIndex,
            };

            switch (content.type) {
                case 'VIDEO': {
                    contentData.content = content.content;
                    contentData.duration = content.duration_minutes ? `${content.duration_minutes} min` : null;
                    contentData.youtube_id = content.video_url || null;
                    break;
                }
                case 'ARTICLE': {
                    contentData.content = content.content;
                    break;
                }
                case 'EXERCISE': {
                    const exerciseContent = content as ImportExerciseContent;
                    const exerciseData = buildExerciseData(exerciseContent);
                    contentData.content = exerciseData.content;
                    contentData.description = exerciseData.description;
                    break;
                }
                case 'QUIZ': {
                    const quizContent = content as ImportQuizContent;
                    contentData.quiz_data = transformQuizToQuizData(quizContent);
                    contentData.content = null;
                    break;
                }
            }

            const { error: insertError } = await supabase
                .from('lesson_contents')
                .insert([contentData]);

            if (insertError) {
                console.error(`[useContentImport] Erro ao inserir ${content.type} "${content.title}":`, insertError);
                throw new Error(`Erro ao inserir "${content.title}": ${insertError.message}`);
            }

            createdCount++;
        }

        await supabase
            .from('lessons')
            .update({
                total_contents: createdCount + baseOrder,
                updated_at: new Date().toISOString(),
            })
            .eq('id', lessonId);

        return createdCount;
    }, [supabase, buildExerciseData, transformQuizToQuizData]);

    const checkExistence = useCallback(async (parsedPayload: ImportPayload): Promise<ImportSummary> => {
        const { data: existingModules } = await supabase
            .from('modules')
            .select('id')
            .ilike('name', parsedPayload.module.name.trim());

        const moduleExists = (existingModules && existingModules.length > 0) || false;
        let lessonExists = false;

        if (moduleExists && existingModules && existingModules.length > 0) {
            const { data: existingLessons } = await supabase
                .from('lessons')
                .select('id')
                .eq('module_id', existingModules[0].id)
                .ilike('title', parsedPayload.lesson.title.trim());

            lessonExists = (existingLessons && existingLessons.length > 0) || false;
        }

        const validationResult = validateImportPayload(parsedPayload);
        const baseSummary = validationResult.summary!;

        return {
            ...baseSummary,
            moduleExists,
            lessonExists,
        };
    }, [supabase]);

    const handleValidate = useCallback(async (): Promise<void> => {
        setIsValidating(true);
        setParseErrors(null);
        setValidationErrors([]);
        setSummary(null);

        try {
            const { payload: parsedPayload, parseError } = parseImportJson(jsonInput);

            if (parseError || !parsedPayload) {
                setParseErrors(parseError || 'JSON inválido');
                showErrorToast('JSON inválido', parseError || 'Verifique a sintaxe do JSON');
                setIsValidating(false);
                return;
            }

            const validationResult = validateImportPayload(parsedPayload);

            if (!validationResult.valid) {
                setValidationErrors(validationResult.errors);
                showWarningToast(
                    `${validationResult.errors.length} problema(s) encontrado(s)`,
                    'Corrija os erros e tente novamente'
                );
                setIsValidating(false);
                return;
            }

            const fullSummary = await checkExistence(parsedPayload);

            setPayload(parsedPayload);
            setSummary(fullSummary);
            setStep('preview');

            const totalContents = fullSummary.counts.video + fullSummary.counts.article + fullSummary.counts.exercise + fullSummary.counts.quiz;
            showSuccessToast(
                'JSON validado com sucesso!',
                `${totalContents} conteúdo(s) prontos para importar`
            );
        } catch (err) {
            console.error('[useContentImport] Erro na validação:', err);
            const message = err instanceof Error ? err.message : 'Erro desconhecido na validação';
            setParseErrors(message);
            showErrorToast('Erro na validação', message);
        } finally {
            setIsValidating(false);
        }
    }, [jsonInput, checkExistence]);

    const handleImport = useCallback(async (): Promise<void> => {
        if (!payload) return;

        setIsImporting(true);
        setStep('importing');

        showInfoToast('Importando conteúdo...', 'Aguarde enquanto processamos');

        const result: ImportResult = {
            success: false,
            moduleId: null,
            lessonId: null,
            contentsCreated: 0,
            moduleCreated: false,
            lessonCreated: false,
            errors: [],
        };

        try {
            const { moduleId, created: moduleCreated } = await findOrCreateModule(payload);
            result.moduleId = moduleId;
            result.moduleCreated = moduleCreated;

            const { lessonId, created: lessonCreated } = await findOrCreateLesson(payload, moduleId);
            result.lessonId = lessonId;
            result.lessonCreated = lessonCreated;

            const contentsCreated = await insertContents(lessonId, payload.contents);
            result.contentsCreated = contentsCreated;

            result.success = true;
            setStep('success');

            const details = [
                moduleCreated ? '📁 Módulo criado' : null,
                lessonCreated ? '📄 Aula criada' : null,
                `📝 ${contentsCreated} conteúdo(s) importado(s)`,
            ].filter(Boolean).join(' • ');

            showSuccessToast('Importação concluída! 🎉', details);
        } catch (err) {
            console.error('[useContentImport] Erro na importação:', err);
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            result.errors.push(errorMessage);
            setStep('error');

            showErrorToast('Erro na importação', errorMessage);
        } finally {
            setImportResult(result);
            setIsImporting(false);
        }
    }, [payload, findOrCreateModule, findOrCreateLesson, insertContents]);

    const handleReset = useCallback((): void => {
        setStep('input');
        setJsonInput('');
        setParseErrors(null);
        setValidationErrors([]);
        setSummary(null);
        setPayload(null);
        setImportResult(null);
        showInfoToast('Formulário limpo', 'Pronto para nova importação');
    }, []);

    const goBackToInput = useCallback((): void => {
        setStep('input');
        setSummary(null);
        setPayload(null);
    }, []);

    return {
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
    };
}