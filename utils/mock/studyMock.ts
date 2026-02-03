// utils/mock/studyMock.ts

export const studyModules = [
    {
        id: "fundamentos",
        name: "Fundamentos de Java",
        description: "Aprenda os conceitos básicos de Java e programação",
        level: "Iniciante",
        topics: [
            {
                id: "variaveis",
                name: "Variáveis e Tipos de Dados",
                description: "Entenda como funcionam variáveis e tipos primitivos",
                complexity: "Fácil",
                videos: [
                    {
                        id: 1,
                        title: "Introdução a Variáveis em Java",
                        youtubeId: "jQgz9wX4qvM",
                        duration: "12:34",
                        instructor: "Professor Carlos",
                    },
                    {
                        id: 2,
                        title: "Tipos Primitivos de Dados",
                        youtubeId: "rZ5Bvj8Wsxo",
                        duration: "15:47",
                        instructor: "Professor Carlos",
                    },
                ],
                materials: [
                    {
                        id: 1,
                        title: "Apostila - Variáveis em Java",
                        type: "PDF",
                        url: "#",
                    },
                    {
                        id: 2,
                        title: "Documentação Oracle",
                        type: "Link",
                        url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/variables.html",
                    },
                    {
                        id: 3,
                        title: "Exemplos de Código",
                        type: "GitHub",
                        url: "#",
                    },
                ],
                quiz: {
                    id: 1,
                    title: "Quiz: Variáveis e Tipos de Dados",
                    questions: [
                        {
                            id: 1,
                            question: "Qual é o tamanho em bytes de um tipo int em Java?",
                            options: [
                                { id: "a", text: "2 bytes" },
                                { id: "b", text: "4 bytes", correct: true },
                                { id: "c", text: "8 bytes" },
                                { id: "d", text: "16 bytes" },
                            ],
                        },
                        {
                            id: 2,
                            question: "Qual palavra-chave é usada para declarar uma constante em Java?",
                            options: [
                                { id: "a", text: "const" },
                                { id: "b", text: "final", correct: true },
                                { id: "c", text: "static" },
                                { id: "d", text: "constant" },
                            ],
                        },
                        {
                            id: 3,
                            question: "Qual é o tipo de dado padrão para números inteiros em Java?",
                            options: [
                                { id: "a", text: "byte" },
                                { id: "b", text: "short" },
                                { id: "c", text: "int", correct: true },
                                { id: "d", text: "long" },
                            ],
                        },
                        {
                            id: 4,
                            question: "Qual é o intervalo de valores para um tipo byte?",
                            options: [
                                { id: "a", text: "-128 a 127", correct: true },
                                { id: "b", text: "0 a 255" },
                                { id: "c", text: "-32768 a 32767" },
                                { id: "d", text: "0 a 65535" },
                            ],
                        },
                        {
                            id: 5,
                            question: "Qual tipo de dado é usado para armazenar um valor lógico?",
                            options: [
                                { id: "a", text: "bool" },
                                { id: "b", text: "boolean", correct: true },
                                { id: "c", text: "bit" },
                                { id: "d", text: "logic" },
                            ],
                        },
                    ],
                },
                completed: true,
            },
            {
                id: "operadores",
                name: "Operadores",
                description: "Explore operadores aritméticos, lógicos e comparativos",
                complexity: "Fácil",
                videos: [
                    {
                        id: 1,
                        title: "Operadores Aritméticos",
                        youtubeId: "jQgz9wX4qvM",
                        duration: "14:20",
                        instructor: "Professor Carlos",
                    },
                    {
                        id: 2,
                        title: "Operadores de Comparação",
                        youtubeId: "rZ5Bvj8Wsxo",
                        duration: "11:15",
                        instructor: "Professor Carlos",
                    },
                ],
                materials: [
                    {
                        id: 1,
                        title: "Tabela de Operadores",
                        type: "PDF",
                        url: "#",
                    },
                ],
                quiz: {
                    id: 2,
                    title: "Quiz: Operadores",
                    questions: [
                        {
                            id: 1,
                            question: "Qual é o resultado de 10 % 3?",
                            options: [
                                { id: "a", text: "1", correct: true },
                                { id: "b", text: "3" },
                                { id: "c", text: "0" },
                                { id: "d", text: "7" },
                            ],
                        },
                        {
                            id: 2,
                            question: "Qual operador é usado para AND lógico?",
                            options: [
                                { id: "a", text: "&" },
                                { id: "b", text: "&&", correct: true },
                                { id: "c", text: "|" },
                                { id: "d", text: "and" },
                            ],
                        },
                        {
                            id: 3,
                            question: "Qual é o resultado de 5 + 3 * 2?",
                            options: [
                                { id: "a", text: "11", correct: true },
                                { id: "b", text: "16" },
                                { id: "c", text: "13" },
                                { id: "d", text: "10" },
                            ],
                        },
                        {
                            id: 4,
                            question: "O operador == compara o quê?",
                            options: [
                                { id: "a", text: "Referência" },
                                { id: "b", text: "Valor", correct: true },
                                { id: "c", text: "Tipo" },
                                { id: "d", text: "Ambos" },
                            ],
                        },
                        {
                            id: 5,
                            question: "Qual é o resultado de true || false?",
                            options: [
                                { id: "a", text: "true", correct: true },
                                { id: "b", text: "false" },
                                { id: "c", text: "null" },
                                { id: "d", text: "undefined" },
                            ],
                        },
                    ],
                },
                completed: false,
            },
            {
                id: "controle",
                name: "Estruturas de Controle",
                description: "if/else, switch, loops e mais",
                complexity: "Médio",
                videos: [
                    {
                        id: 1,
                        title: "if/else em Java",
                        youtubeId: "jQgz9wX4qvM",
                        duration: "16:30",
                        instructor: "Professor Carlos",
                    },
                    {
                        id: 2,
                        title: "Switch Statement",
                        youtubeId: "rZ5Bvj8Wsxo",
                        duration: "13:45",
                        instructor: "Professor Carlos",
                    },
                    {
                        id: 3,
                        title: "Operador Ternário",
                        youtubeId: "jQgz9wX4qvM",
                        duration: "9:20",
                        instructor: "Professor Carlos",
                    },
                ],
                materials: [
                    {
                        id: 1,
                        title: "Guia Completo - Estruturas de Controle",
                        type: "PDF",
                        url: "#",
                    },
                    {
                        id: 2,
                        title: "Documentação Oracle",
                        type: "Link",
                        url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/if.html",
                    },
                ],
                quiz: {
                    id: 3,
                    title: "Quiz: Estruturas de Controle",
                    questions: [
                        {
                            id: 1,
                            question: "Qual é a sintaxe correta para um if em Java?",
                            options: [
                                { id: "a", text: "if x > 5" },
                                { id: "b", text: "if (x > 5)", correct: true },
                                { id: "c", text: "if x > 5 then" },
                                { id: "d", text: "if: x > 5" },
                            ],
                        },
                        {
                            id: 2,
                            question: "O que o switch compara?",
                            options: [
                                { id: "a", text: "Referência" },
                                { id: "b", text: "Valor com equals()", correct: true },
                                { id: "c", text: "Tipo" },
                                { id: "d", text: "Endereço de memória" },
                            ],
                        },
                        {
                            id: 3,
                            question: "Qual palavra-chave sai de um loop?",
                            options: [
                                { id: "a", text: "exit" },
                                { id: "b", text: "stop" },
                                { id: "c", text: "break", correct: true },
                                { id: "d", text: "end" },
                            ],
                        },
                        {
                            id: 4,
                            question: "Qual é o resultado de if (true) { } else { }?",
                            options: [
                                { id: "a", text: "Executa o if", correct: true },
                                { id: "b", text: "Executa o else" },
                                { id: "c", text: "Erro" },
                                { id: "d", text: "Nada" },
                            ],
                        },
                        {
                            id: 5,
                            question: "O que break faz em um switch?",
                            options: [
                                { id: "a", text: "Sai do programa" },
                                { id: "b", text: "Sai do switch", correct: true },
                                { id: "c", text: "Continua para próximo case" },
                                { id: "d", text: "Reinicia o switch" },
                            ],
                        },
                    ],
                },
                completed: false,
            },
        ],
    },
];

// Helper para ícone de material baseado no tipo
export function getMaterialIcon(type: string): string {
    switch (type) {
        case 'PDF':
            return 'FileText';
        case 'Link':
            return 'ExternalLink';
        case 'GitHub':
            return 'Code';
        default:
            return 'File';
    }
}

// Funções helper para feedback
export const getQuizFeedback = (score: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100;

    if (percentage === 100) {
        return {
            message: "Perfeito! Você dominou esse assunto!",
            color: "emerald",
            tip: "Continue assim! Você está no caminho certo.",
        };
    } else if (percentage >= 80) {
        return {
            message: "Excelente desempenho!",
            color: "sky",
            tip: "Revise apenas os pontos que errou.",
        };
    } else if (percentage >= 60) {
        return {
            message: "Bom trabalho! Há espaço para melhorar.",
            color: "amber",
            tip: "Revise o material e tente novamente.",
        };
    } else if (percentage >= 40) {
        return {
            message: "Continue estudando!",
            color: "amber",
            tip: "Estude o assunto novamente antes de refazer o quiz.",
        };
    } else {
        return {
            message: "Precisa de mais prática.",
            color: "rose",
            tip: "Revise completamente o material antes de tentar novamente.",
        };
    }
};