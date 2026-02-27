// utils/validateImportJson.ts

import type {
    ImportPayload,
    ImportContent,
    ImportExerciseContent,
    ImportQuizContent,
    ImportVideoContent,
    ImportArticleContent,
    ValidationError,
    ValidationResult,
    ImportSummary,
} from '@/lib/types/content-import';

function validateModule(payload: ImportPayload, errors: ValidationError[]): void {
    if (!payload.module) {
        errors.push({ field: 'module', message: 'Campo "module" é obrigatório' });
        return;
    }

    if (!payload.module.name?.trim()) {
        errors.push({ field: 'module.name', message: 'Nome do módulo é obrigatório' });
    }

    if (typeof payload.module.create_if_not_exists !== 'boolean') {
        errors.push({ field: 'module.create_if_not_exists', message: 'Campo "create_if_not_exists" deve ser true ou false' });
    }
}

function validateLesson(payload: ImportPayload, errors: ValidationError[]): void {
    if (!payload.lesson) {
        errors.push({ field: 'lesson', message: 'Campo "lesson" é obrigatório' });
        return;
    }

    if (!payload.lesson.title?.trim()) {
        errors.push({ field: 'lesson.title', message: 'Título da aula é obrigatório' });
    }

    if (typeof payload.lesson.create_if_not_exists !== 'boolean') {
        errors.push({ field: 'lesson.create_if_not_exists', message: 'Campo "create_if_not_exists" deve ser true ou false' });
    }
}

function validateBlock(payload: ImportPayload, errors: ValidationError[]): void {
    if (!payload.block) {
        errors.push({ field: 'block', message: 'Campo "block" é obrigatório' });
        return;
    }

    if (!payload.block.title?.trim()) {
        errors.push({ field: 'block.title', message: 'Título do bloco é obrigatório' });
    }

    if (typeof payload.block.order !== 'number' || payload.block.order < 1) {
        errors.push({ field: 'block.order', message: 'Ordem do bloco deve ser um número >= 1' });
    }
}

function validateVideoContent(content: ImportVideoContent, index: number, errors: ValidationError[]): void {
    if (!content.content?.trim()) {
        errors.push({ field: `contents[${index}].content`, message: `Vídeo "${content.title}": conteúdo do roteiro é obrigatório` });
    }
}

function validateArticleContent(content: ImportArticleContent, index: number, errors: ValidationError[]): void {
    if (!content.content?.trim()) {
        errors.push({ field: `contents[${index}].content`, message: `Artigo "${content.title}": conteúdo é obrigatório` });
    }

    if (content.content && content.content.trim().length < 100) {
        errors.push({ field: `contents[${index}].content`, message: `Artigo "${content.title}": conteúdo muito curto (mínimo 100 caracteres)` });
    }
}

function validateFillBlankContent(content: ImportExerciseContent, index: number, errors: ValidationError[]): void {
    if (!content.fill_blank_data) {
        errors.push({
            field: `contents[${index}].fill_blank_data`,
            message: `Exercício "${content.title}": fill_blank precisa de fill_blank_data`
        });
        return;
    }

    const fillData = content.fill_blank_data;

    if (!fillData.text_with_blanks?.trim()) {
        errors.push({
            field: `contents[${index}].fill_blank_data.text_with_blanks`,
            message: `Exercício "${content.title}": text_with_blanks é obrigatório`
        });
    }

    if (!fillData.blanks || !Array.isArray(fillData.blanks) || fillData.blanks.length < 1) {
        errors.push({
            field: `contents[${index}].fill_blank_data.blanks`,
            message: `Exercício "${content.title}": deve ter pelo menos 1 lacuna`
        });
        return;
    }

    fillData.blanks.forEach((blank, blankIndex) => {
        if (!blank.id?.trim()) {
            errors.push({
                field: `contents[${index}].fill_blank_data.blanks[${blankIndex}].id`,
                message: `Exercício "${content.title}", lacuna ${blankIndex + 1}: id é obrigatório`
            });
        }

        if (!blank.correct_answer?.trim()) {
            errors.push({
                field: `contents[${index}].fill_blank_data.blanks[${blankIndex}].correct_answer`,
                message: `Exercício "${content.title}", lacuna ${blankIndex + 1}: correct_answer é obrigatório`
            });
        }

        if (blank.alternatives && blank.alternatives.length > 0) {
            const correctInAlternatives = blank.alternatives.some(
                (alt) => alt.toLowerCase() === blank.correct_answer?.toLowerCase()
            );
            if (!correctInAlternatives) {
                errors.push({
                    field: `contents[${index}].fill_blank_data.blanks[${blankIndex}].alternatives`,
                    message: `Exercício "${content.title}", lacuna ${blankIndex + 1}: correct_answer deve estar nas alternatives`
                });
            }
        }
    });

    const text = fillData.text_with_blanks || '';
    const placeholderMatches = text.match(/\{(\d+)\}|_{3,}/g) || [];

    if (placeholderMatches.length !== fillData.blanks.length) {
        errors.push({
            field: `contents[${index}].fill_blank_data`,
            message: `Exercício "${content.title}": número de lacunas no texto (${placeholderMatches.length}) não bate com blanks array (${fillData.blanks.length})`
        });
    }
}

function validateMatchingContent(content: ImportExerciseContent, index: number, errors: ValidationError[]): void {
    if (!content.matching_data) {
        errors.push({
            field: `contents[${index}].matching_data`,
            message: `Exercício "${content.title}": matching precisa de matching_data`
        });
        return;
    }

    const matchingData = content.matching_data;

    if (!matchingData.pairs || !Array.isArray(matchingData.pairs) || matchingData.pairs.length < 2) {
        errors.push({
            field: `contents[${index}].matching_data.pairs`,
            message: `Exercício "${content.title}": matching deve ter pelo menos 2 pares`
        });
        return;
    }

    matchingData.pairs.forEach((pair, pairIndex) => {
        if (!pair.id?.trim()) {
            errors.push({
                field: `contents[${index}].matching_data.pairs[${pairIndex}].id`,
                message: `Exercício "${content.title}", par ${pairIndex + 1}: id é obrigatório`
            });
        }

        if (!pair.left?.trim()) {
            errors.push({
                field: `contents[${index}].matching_data.pairs[${pairIndex}].left`,
                message: `Exercício "${content.title}", par ${pairIndex + 1}: left (termo) é obrigatório`
            });
        }

        if (!pair.right?.trim()) {
            errors.push({
                field: `contents[${index}].matching_data.pairs[${pairIndex}].right`,
                message: `Exercício "${content.title}", par ${pairIndex + 1}: right (correspondência) é obrigatório`
            });
        }
    });

    const ids = matchingData.pairs.map((p) => p.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
        errors.push({
            field: `contents[${index}].matching_data.pairs`,
            message: `Exercício "${content.title}": IDs dos pares devem ser únicos`
        });
    }
}

function validateMultipleSelectContent(content: ImportExerciseContent, index: number, errors: ValidationError[]): void {
    if (!content.multiple_select_data) {
        errors.push({
            field: `contents[${index}].multiple_select_data`,
            message: `Exercício "${content.title}": multiple_select precisa de multiple_select_data`
        });
        return;
    }

    const selectData = content.multiple_select_data;

    if (!selectData.options || !Array.isArray(selectData.options) || selectData.options.length < 2) {
        errors.push({
            field: `contents[${index}].multiple_select_data.options`,
            message: `Exercício "${content.title}": multiple_select deve ter pelo menos 2 opções`
        });
        return;
    }

    const correctOptions = selectData.options.filter((opt) => opt.correct);
    if (correctOptions.length < 1) {
        errors.push({
            field: `contents[${index}].multiple_select_data.options`,
            message: `Exercício "${content.title}": deve ter pelo menos 1 opção correta`
        });
    }

    const incorrectOptions = selectData.options.filter((opt) => !opt.correct);
    if (incorrectOptions.length < 1) {
        errors.push({
            field: `contents[${index}].multiple_select_data.options`,
            message: `Exercício "${content.title}": deve ter pelo menos 1 opção incorreta`
        });
    }

    selectData.options.forEach((option, optIndex) => {
        if (!option.id?.trim()) {
            errors.push({
                field: `contents[${index}].multiple_select_data.options[${optIndex}].id`,
                message: `Exercício "${content.title}", opção ${optIndex + 1}: id é obrigatório`
            });
        }

        if (!option.text?.trim()) {
            errors.push({
                field: `contents[${index}].multiple_select_data.options[${optIndex}].text`,
                message: `Exercício "${content.title}", opção ${optIndex + 1}: text é obrigatório`
            });
        }

        if (typeof option.correct !== 'boolean') {
            errors.push({
                field: `contents[${index}].multiple_select_data.options[${optIndex}].correct`,
                message: `Exercício "${content.title}", opção ${optIndex + 1}: correct deve ser true ou false`
            });
        }
    });

    const ids = selectData.options.map((o) => o.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
        errors.push({
            field: `contents[${index}].multiple_select_data.options`,
            message: `Exercício "${content.title}": IDs das opções devem ser únicos`
        });
    }
}

function validateCodeCompletionContent(content: ImportExerciseContent, index: number, errors: ValidationError[]): void {
    if (!content.code_completion_data) {
        errors.push({
            field: `contents[${index}].code_completion_data`,
            message: `Exercício "${content.title}": code_completion precisa de code_completion_data`
        });
        return;
    }

    const codeData = content.code_completion_data;

    if (!codeData.language?.trim()) {
        errors.push({
            field: `contents[${index}].code_completion_data.language`,
            message: `Exercício "${content.title}": language é obrigatório (ex: "java", "python")`
        });
    }

    if (!codeData.code_template?.trim()) {
        errors.push({
            field: `contents[${index}].code_completion_data.code_template`,
            message: `Exercício "${content.title}": code_template é obrigatório`
        });
    }

    if (!codeData.blanks || !Array.isArray(codeData.blanks) || codeData.blanks.length < 1) {
        errors.push({
            field: `contents[${index}].code_completion_data.blanks`,
            message: `Exercício "${content.title}": deve ter pelo menos 1 lacuna`
        });
        return;
    }

    codeData.blanks.forEach((blank, blankIndex) => {
        if (!blank.id?.trim()) {
            errors.push({
                field: `contents[${index}].code_completion_data.blanks[${blankIndex}].id`,
                message: `Exercício "${content.title}", lacuna ${blankIndex + 1}: id é obrigatório`
            });
        }

        if (!blank.correct_answer?.trim()) {
            errors.push({
                field: `contents[${index}].code_completion_data.blanks[${blankIndex}].correct_answer`,
                message: `Exercício "${content.title}", lacuna ${blankIndex + 1}: correct_answer é obrigatório`
            });
        }

        if (blank.alternatives && blank.alternatives.length > 0) {
            const correctInAlternatives = blank.alternatives.some(
                (alt) => alt === blank.correct_answer
            );
            if (!correctInAlternatives) {
                errors.push({
                    field: `contents[${index}].code_completion_data.blanks[${blankIndex}].alternatives`,
                    message: `Exercício "${content.title}", lacuna ${blankIndex + 1}: correct_answer deve estar nas alternatives`
                });
            }
        }
    });

    const template = codeData.code_template || '';
    const placeholderMatches = template.match(/\{(\d+)\}|_{3,}/g) || [];

    if (placeholderMatches.length !== codeData.blanks.length) {
        errors.push({
            field: `contents[${index}].code_completion_data`,
            message: `Exercício "${content.title}": número de lacunas no código (${placeholderMatches.length}) não bate com blanks array (${codeData.blanks.length})`
        });
    }
}

function validateDragDropContent(content: ImportExerciseContent, index: number, errors: ValidationError[]): void {
    if (!content.drag_drop_data) {
        errors.push({
            field: `contents[${index}].drag_drop_data`,
            message: `Exercício "${content.title}": drag_drop precisa de drag_drop_data`
        });
        return;
    }

    const dragData = content.drag_drop_data;

    if (!dragData.items || !Array.isArray(dragData.items) || dragData.items.length < 2) {
        errors.push({
            field: `contents[${index}].drag_drop_data.items`,
            message: `Exercício "${content.title}": drag_drop deve ter pelo menos 2 itens`
        });
        return;
    }

    if (!dragData.zones || !Array.isArray(dragData.zones) || dragData.zones.length < 1) {
        errors.push({
            field: `contents[${index}].drag_drop_data.zones`,
            message: `Exercício "${content.title}": drag_drop deve ter pelo menos 1 zona`
        });
        return;
    }

    const itemIds = new Set<string>();
    dragData.items.forEach((item, itemIndex) => {
        if (!item.id?.trim()) {
            errors.push({
                field: `contents[${index}].drag_drop_data.items[${itemIndex}].id`,
                message: `Exercício "${content.title}", item ${itemIndex + 1}: id é obrigatório`
            });
        } else {
            itemIds.add(item.id);
        }

        if (!item.content?.trim()) {
            errors.push({
                field: `contents[${index}].drag_drop_data.items[${itemIndex}].content`,
                message: `Exercício "${content.title}", item ${itemIndex + 1}: content é obrigatório`
            });
        }
    });

    dragData.zones.forEach((zone, zoneIndex) => {
        if (!zone.id?.trim()) {
            errors.push({
                field: `contents[${index}].drag_drop_data.zones[${zoneIndex}].id`,
                message: `Exercício "${content.title}", zona ${zoneIndex + 1}: id é obrigatório`
            });
        }

        if (!zone.label?.trim()) {
            errors.push({
                field: `contents[${index}].drag_drop_data.zones[${zoneIndex}].label`,
                message: `Exercício "${content.title}", zona ${zoneIndex + 1}: label é obrigatório`
            });
        }

        if (!zone.correct_item_id?.trim()) {
            errors.push({
                field: `contents[${index}].drag_drop_data.zones[${zoneIndex}].correct_item_id`,
                message: `Exercício "${content.title}", zona ${zoneIndex + 1}: correct_item_id é obrigatório`
            });
        } else if (!itemIds.has(zone.correct_item_id)) {
            errors.push({
                field: `contents[${index}].drag_drop_data.zones[${zoneIndex}].correct_item_id`,
                message: `Exercício "${content.title}", zona ${zoneIndex + 1}: correct_item_id "${zone.correct_item_id}" não existe nos itens`
            });
        }
    });

    if (itemIds.size !== dragData.items.length) {
        errors.push({
            field: `contents[${index}].drag_drop_data.items`,
            message: `Exercício "${content.title}": IDs dos itens devem ser únicos`
        });
    }

    const zoneIds = dragData.zones.map((z) => z.id);
    const uniqueZoneIds = new Set(zoneIds);
    if (uniqueZoneIds.size !== zoneIds.length) {
        errors.push({
            field: `contents[${index}].drag_drop_data.zones`,
            message: `Exercício "${content.title}": IDs das zonas devem ser únicos`
        });
    }
}

function validateExerciseContent(content: ImportExerciseContent, index: number, errors: ValidationError[]): void {
    if (!content.content?.trim()) {
        errors.push({ field: `contents[${index}].content`, message: `Exercício "${content.title}": enunciado é obrigatório` });
    }

    if (!content.answer?.trim()) {
        errors.push({ field: `contents[${index}].answer`, message: `Exercício "${content.title}": resposta é obrigatória` });
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(content.difficulty)) {
        errors.push({ field: `contents[${index}].difficulty`, message: `Exercício "${content.title}": dificuldade deve ser easy, medium ou hard` });
    }

    // 🆕 ATUALIZADO: Agora com 12 tipos!
    const validTypes = [
        'ordering',
        'true_false',
        'fill_blank',
        'matching',
        'multiple_select',
        'code_completion',
        'drag_drop',
        'debugging',
        'code_output',
        'categorize',
        'code',
        'text',
        'open'
    ];

    if (!content.exercise_type || !validTypes.includes(content.exercise_type)) {
        errors.push({
            field: `contents[${index}].exercise_type`,
            message: `Exercício "${content.title}": exercise_type deve ser ${validTypes.join(', ')}`
        });
    }

    if (content.exercise_type === 'ordering' && (!content.ordering_items || content.ordering_items.length < 2)) {
        errors.push({ field: `contents[${index}].ordering_items`, message: `Exercício "${content.title}": ordering precisa de pelo menos 2 itens` });
    }

    if (content.exercise_type === 'true_false' && (!content.true_false_statements || content.true_false_statements.length < 1)) {
        errors.push({ field: `contents[${index}].true_false_statements`, message: `Exercício "${content.title}": true_false precisa de pelo menos 1 afirmação` });
    }

    if (content.exercise_type === 'fill_blank') {
        validateFillBlankContent(content, index, errors);
    }

    if (content.exercise_type === 'matching') {
        validateMatchingContent(content, index, errors);
    }

    if (content.exercise_type === 'multiple_select') {
        validateMultipleSelectContent(content, index, errors);
    }

    if (content.exercise_type === 'code_completion') {
        validateCodeCompletionContent(content, index, errors);
    }

    if (content.exercise_type === 'drag_drop') {
        validateDragDropContent(content, index, errors);
    }

    if (content.exercise_type === 'debugging') {
        validateDebuggingContent(content, index, errors);
    }

    if (content.exercise_type === 'code_output') {
        validateCodeOutputContent(content, index, errors);
    }

    if (content.exercise_type === 'categorize') {
        validateCategorizeContent(content, index, errors);
    }
}

function validateQuizContent(content: ImportQuizContent, index: number, errors: ValidationError[]): void {
    if (!content.questions || !Array.isArray(content.questions)) {
        errors.push({ field: `contents[${index}].questions`, message: `Quiz "${content.title}": campo "questions" é obrigatório e deve ser um array` });
        return;
    }

    if (content.questions.length < 1) {
        errors.push({ field: `contents[${index}].questions`, message: `Quiz "${content.title}": deve ter pelo menos 1 pergunta` });
        return;
    }

    content.questions.forEach((question, qIndex: number) => {
        if (!question.question?.trim()) {
            errors.push({ field: `contents[${index}].questions[${qIndex}].question`, message: `Quiz "${content.title}", pergunta ${qIndex + 1}: texto é obrigatório` });
        }

        if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
            errors.push({ field: `contents[${index}].questions[${qIndex}].options`, message: `Quiz "${content.title}", pergunta ${qIndex + 1}: deve ter pelo menos 2 opções` });
        }

        if (typeof question.correct !== 'number' || question.correct < 0 || question.correct >= (question.options?.length || 0)) {
            errors.push({ field: `contents[${index}].questions[${qIndex}].correct`, message: `Quiz "${content.title}", pergunta ${qIndex + 1}: índice da resposta correta inválido` });
        }
    });
}

function validateContents(payload: ImportPayload, errors: ValidationError[]): void {
    if (!payload.contents || !Array.isArray(payload.contents)) {
        errors.push({ field: 'contents', message: 'Campo "contents" é obrigatório e deve ser um array' });
        return;
    }

    if (payload.contents.length === 0) {
        errors.push({ field: 'contents', message: 'Deve ter pelo menos 1 conteúdo' });
        return;
    }

    const validTypes = ['VIDEO', 'ARTICLE', 'EXERCISE', 'QUIZ'];

    payload.contents.forEach((content: ImportContent, index: number) => {
        if (!content.title?.trim()) {
            errors.push({ field: `contents[${index}].title`, message: `Conteúdo ${index + 1}: título é obrigatório` });
        }

        if (!validTypes.includes(content.type)) {
            errors.push({ field: `contents[${index}].type`, message: `Conteúdo "${content.title}": tipo deve ser VIDEO, ARTICLE, EXERCISE ou QUIZ` });
            return;
        }

        if (typeof content.order !== 'number' || content.order < 1) {
            errors.push({ field: `contents[${index}].order`, message: `Conteúdo "${content.title}": ordem deve ser >= 1` });
        }

        switch (content.type) {
            case 'VIDEO':
                validateVideoContent(content as ImportVideoContent, index, errors);
                break;
            case 'ARTICLE':
                validateArticleContent(content as ImportArticleContent, index, errors);
                break;
            case 'EXERCISE':
                validateExerciseContent(content as ImportExerciseContent, index, errors);
                break;
            case 'QUIZ':
                validateQuizContent(content as ImportQuizContent, index, errors);
                break;
        }
    });
}

function buildSummary(payload: ImportPayload): ImportSummary {
    const counts = { video: 0, article: 0, exercise: 0, quiz: 0, totalQuizQuestions: 0 };

    payload.contents.forEach((content: ImportContent) => {
        switch (content.type) {
            case 'VIDEO':
                counts.video++;
                break;
            case 'ARTICLE':
                counts.article++;
                break;
            case 'EXERCISE':
                counts.exercise++;
                break;
            case 'QUIZ':
                counts.quiz++;
                counts.totalQuizQuestions += (content as ImportQuizContent).questions?.length || 0;
                break;
        }
    });

    return {
        moduleName: payload.module.name,
        lessonTitle: payload.lesson.title,
        blockTitle: payload.block.title,
        blockOrder: payload.block.order,
        counts,
        moduleExists: false,
        lessonExists: false,
    };
}

export function parseImportJson(jsonString: string): { payload: ImportPayload | null; parseError: string | null } {
    try {
        const parsed = JSON.parse(jsonString);
        return { payload: parsed as ImportPayload, parseError: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'JSON inválido';
        return { payload: null, parseError: `Erro ao parsear JSON: ${errorMessage}` };
    }
}

export function validateImportPayload(payload: ImportPayload): ValidationResult {
    const errors: ValidationError[] = [];

    validateModule(payload, errors);
    validateLesson(payload, errors);
    validateBlock(payload, errors);
    validateContents(payload, errors);

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    const summary = buildSummary(payload);
    return { valid: true, errors: [], summary };
}

// ═══════════════════════════════════════════════════════════════
// VALIDAÇÃO - DEBUGGING (NOVO v18)
// ═══════════════════════════════════════════════════════════════

function validateDebuggingContent(content: ImportExerciseContent, index: number, errors: ValidationError[]): void {
    if (!content.debugging_data) {
        errors.push({
            field: `contents[${index}].debugging_data`,
            message: `Exercício "${content.title}": debugging precisa de debugging_data`
        });
        return;
    }

    const debugData = content.debugging_data;

    if (!debugData.language?.trim()) {
        errors.push({
            field: `contents[${index}].debugging_data.language`,
            message: `Exercício "${content.title}": language é obrigatório`
        });
    }

    if (!debugData.buggy_code?.trim()) {
        errors.push({
            field: `contents[${index}].debugging_data.buggy_code`,
            message: `Exercício "${content.title}": buggy_code é obrigatório`
        });
    }

    if (!debugData.bugs || !Array.isArray(debugData.bugs) || debugData.bugs.length < 1) {
        errors.push({
            field: `contents[${index}].debugging_data.bugs`,
            message: `Exercício "${content.title}": deve ter pelo menos 1 bug`
        });
        return;
    }

    const bugIds = new Set<string>();
    debugData.bugs.forEach((bug, bugIndex) => {
        if (!bug.id?.trim()) {
            errors.push({
                field: `contents[${index}].debugging_data.bugs[${bugIndex}].id`,
                message: `Exercício "${content.title}", bug ${bugIndex + 1}: id é obrigatório`
            });
        } else {
            if (bugIds.has(bug.id)) {
                errors.push({
                    field: `contents[${index}].debugging_data.bugs[${bugIndex}].id`,
                    message: `Exercício "${content.title}", bug ${bugIndex + 1}: id "${bug.id}" duplicado`
                });
            }
            bugIds.add(bug.id);
        }

        if (typeof bug.line !== 'number' || bug.line < 1) {
            errors.push({
                field: `contents[${index}].debugging_data.bugs[${bugIndex}].line`,
                message: `Exercício "${content.title}", bug ${bugIndex + 1}: line deve ser um número >= 1`
            });
        }

        if (!bug.description?.trim()) {
            errors.push({
                field: `contents[${index}].debugging_data.bugs[${bugIndex}].description`,
                message: `Exercício "${content.title}", bug ${bugIndex + 1}: description é obrigatório`
            });
        }

        if (!bug.incorrect_code?.trim()) {
            errors.push({
                field: `contents[${index}].debugging_data.bugs[${bugIndex}].incorrect_code`,
                message: `Exercício "${content.title}", bug ${bugIndex + 1}: incorrect_code é obrigatório`
            });
        }

        if (!bug.correct_code?.trim()) {
            errors.push({
                field: `contents[${index}].debugging_data.bugs[${bugIndex}].correct_code`,
                message: `Exercício "${content.title}", bug ${bugIndex + 1}: correct_code é obrigatório`
            });
        }
    });

    if (!debugData.correct_full_code?.trim()) {
        errors.push({
            field: `contents[${index}].debugging_data.correct_full_code`,
            message: `Exercício "${content.title}": correct_full_code é obrigatório`
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// VALIDAÇÃO - CODE OUTPUT (NOVO v18)
// ═══════════════════════════════════════════════════════════════

function validateCodeOutputContent(content: ImportExerciseContent, index: number, errors: ValidationError[]): void {
    if (!content.code_output_data) {
        errors.push({
            field: `contents[${index}].code_output_data`,
            message: `Exercício "${content.title}": code_output precisa de code_output_data`
        });
        return;
    }

    const outputData = content.code_output_data;

    if (!outputData.language?.trim()) {
        errors.push({
            field: `contents[${index}].code_output_data.language`,
            message: `Exercício "${content.title}": language é obrigatório`
        });
    }

    if (!outputData.code?.trim()) {
        errors.push({
            field: `contents[${index}].code_output_data.code`,
            message: `Exercício "${content.title}": code é obrigatório`
        });
    }

    if (!outputData.options || !Array.isArray(outputData.options) || outputData.options.length < 2) {
        errors.push({
            field: `contents[${index}].code_output_data.options`,
            message: `Exercício "${content.title}": deve ter pelo menos 2 opções de saída`
        });
        return;
    }

    const optionIds = new Set<string>();
    outputData.options.forEach((option, optIndex) => {
        if (!option.id?.trim()) {
            errors.push({
                field: `contents[${index}].code_output_data.options[${optIndex}].id`,
                message: `Exercício "${content.title}", opção ${optIndex + 1}: id é obrigatório`
            });
        } else {
            if (optionIds.has(option.id)) {
                errors.push({
                    field: `contents[${index}].code_output_data.options[${optIndex}].id`,
                    message: `Exercício "${content.title}", opção ${optIndex + 1}: id "${option.id}" duplicado`
                });
            }
            optionIds.add(option.id);
        }

        if (!option.text) {
            errors.push({
                field: `contents[${index}].code_output_data.options[${optIndex}].text`,
                message: `Exercício "${content.title}", opção ${optIndex + 1}: text é obrigatório`
            });
        }
    });

    if (!outputData.correct?.trim()) {
        errors.push({
            field: `contents[${index}].code_output_data.correct`,
            message: `Exercício "${content.title}": correct (ID da opção correta) é obrigatório`
        });
    } else if (!optionIds.has(outputData.correct)) {
        errors.push({
            field: `contents[${index}].code_output_data.correct`,
            message: `Exercício "${content.title}": correct "${outputData.correct}" não existe nas opções`
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// VALIDAÇÃO - CATEGORIZE (NOVO v18)
// ═══════════════════════════════════════════════════════════════

function validateCategorizeContent(content: ImportExerciseContent, index: number, errors: ValidationError[]): void {
    if (!content.categorize_data) {
        errors.push({
            field: `contents[${index}].categorize_data`,
            message: `Exercício "${content.title}": categorize precisa de categorize_data`
        });
        return;
    }

    const catData = content.categorize_data;

    if (!catData.categories || !Array.isArray(catData.categories) || catData.categories.length < 2) {
        errors.push({
            field: `contents[${index}].categorize_data.categories`,
            message: `Exercício "${content.title}": deve ter pelo menos 2 categorias`
        });
        return;
    }

    const categoryIds = new Set<string>();
    catData.categories.forEach((category, catIndex) => {
        if (!category.id?.trim()) {
            errors.push({
                field: `contents[${index}].categorize_data.categories[${catIndex}].id`,
                message: `Exercício "${content.title}", categoria ${catIndex + 1}: id é obrigatório`
            });
        } else {
            if (categoryIds.has(category.id)) {
                errors.push({
                    field: `contents[${index}].categorize_data.categories[${catIndex}].id`,
                    message: `Exercício "${content.title}", categoria ${catIndex + 1}: id "${category.id}" duplicado`
                });
            }
            categoryIds.add(category.id);
        }

        if (!category.name?.trim()) {
            errors.push({
                field: `contents[${index}].categorize_data.categories[${catIndex}].name`,
                message: `Exercício "${content.title}", categoria ${catIndex + 1}: name é obrigatório`
            });
        }
    });

    if (!catData.items || !Array.isArray(catData.items) || catData.items.length < 2) {
        errors.push({
            field: `contents[${index}].categorize_data.items`,
            message: `Exercício "${content.title}": deve ter pelo menos 2 itens para classificar`
        });
        return;
    }

    const itemIds = new Set<string>();
    catData.items.forEach((item, itemIndex) => {
        if (!item.id?.trim()) {
            errors.push({
                field: `contents[${index}].categorize_data.items[${itemIndex}].id`,
                message: `Exercício "${content.title}", item ${itemIndex + 1}: id é obrigatório`
            });
        } else {
            if (itemIds.has(item.id)) {
                errors.push({
                    field: `contents[${index}].categorize_data.items[${itemIndex}].id`,
                    message: `Exercício "${content.title}", item ${itemIndex + 1}: id "${item.id}" duplicado`
                });
            }
            itemIds.add(item.id);
        }

        if (!item.text?.trim()) {
            errors.push({
                field: `contents[${index}].categorize_data.items[${itemIndex}].text`,
                message: `Exercício "${content.title}", item ${itemIndex + 1}: text é obrigatório`
            });
        }

        if (!item.correct_category?.trim()) {
            errors.push({
                field: `contents[${index}].categorize_data.items[${itemIndex}].correct_category`,
                message: `Exercício "${content.title}", item ${itemIndex + 1}: correct_category é obrigatório`
            });
        } else if (!categoryIds.has(item.correct_category)) {
            errors.push({
                field: `contents[${index}].categorize_data.items[${itemIndex}].correct_category`,
                message: `Exercício "${content.title}", item ${itemIndex + 1}: correct_category "${item.correct_category}" não existe`
            });
        }
    });
}