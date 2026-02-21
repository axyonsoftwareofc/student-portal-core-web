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

    const validTypes = ['ordering', 'true_false', 'fill_blank', 'code', 'text', 'open'];
    if (!content.exercise_type || !validTypes.includes(content.exercise_type)) {
        errors.push({ field: `contents[${index}].exercise_type`, message: `Exercício "${content.title}": exercise_type deve ser ${validTypes.join(', ')}` });
    }

    if (content.exercise_type === 'ordering' && (!content.ordering_items || content.ordering_items.length < 2)) {
        errors.push({ field: `contents[${index}].ordering_items`, message: `Exercício "${content.title}": ordering precisa de pelo menos 2 itens` });
    }

    if (content.exercise_type === 'true_false' && (!content.true_false_statements || content.true_false_statements.length < 1)) {
        errors.push({ field: `contents[${index}].true_false_statements`, message: `Exercício "${content.title}": true_false precisa de pelo menos 1 afirmação` });
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