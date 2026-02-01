// utils/mock/modulesMock.ts

export const modules = [
    {
        id: "fundamentos",
        name: "Fundamentos de Java",
        description: "Aprenda os conceitos básicos de Java e programação orientada a objetos",
        level: "Iniciante",
        progress: 100,
        status: "Concluído",
        icon: "🟠",
        topics: [
            { id: 1, name: "Variáveis e Tipos de Dados", completed: true },
            { id: 2, name: "Operadores", completed: true },
            { id: 3, name: "Estruturas de Controle (if/else/switch)", completed: true },
            { id: 4, name: "Loops (for/while)", completed: true },
            { id: 5, name: "Arrays e Collections", completed: true },
            { id: 6, name: "Métodos e Funções", completed: true },
        ],
        completedDate: "2025-11-15",
        duration: "4 semanas",
    },
    {
        id: "intermediario",
        name: "Programação Orientada a Objetos",
        description: "Domine classes, herança, polimorfismo e encapsulamento",
        level: "Intermediário",
        progress: 75,
        status: "Em Progresso",
        icon: "🟦",
        topics: [
            { id: 1, name: "Classes e Objetos", completed: true },
            { id: 2, name: "Encapsulamento", completed: true },
            { id: 3, name: "Herança", completed: true },
            { id: 4, name: "Polimorfismo", completed: false },
            { id: 5, name: "Interfaces", completed: false },
            { id: 6, name: "Exceções e Tratamento de Erros", completed: false },
        ],
        duration: "5 semanas",
    },
    {
        id: "avancado",
        name: "Spring Framework & Spring Boot",
        description: "Crie aplicações enterprise robustas com Spring Boot",
        level: "Avançado",
        progress: 30,
        status: "Em Progresso",
        icon: "🟢",
        topics: [
            { id: 1, name: "Introdução ao Spring Framework", completed: true },
            { id: 2, name: "Spring Boot Setup", completed: true },
            { id: 3, name: "REST APIs", completed: false },
            { id: 4, name: "Banco de Dados com JPA/Hibernate", completed: false },
            { id: 5, name: "Segurança com Spring Security", completed: false },
            { id: 6, name: "Testes Unitários", completed: false },
        ],
        duration: "6 semanas",
    },
];

export const performanceData = [
    {
        name: "Fundamentos",
        progress: 100,
        fill: "#7c3aed",
    },
    {
        name: "POO",
        progress: 75,
        fill: "#6366f1",
    },
    {
        name: "Spring Boot",
        progress: 30,
        fill: "#10b981",
    },
];

export const studyTimeData = [
    { week: "Semana 1", hours: 5 },
    { week: "Semana 2", hours: 7 },
    { week: "Semana 3", hours: 6 },
    { week: "Semana 4", hours: 8 },
    { week: "Semana 5", hours: 9 },
    { week: "Semana 6", hours: 7 },
    { week: "Semana 7", hours: 10 },
];

export const badges = [
    {
        id: 1,
        name: "Iniciante",
        description: "Completou o módulo Fundamentos",
        icon: "🏅",
        unlockedDate: "2025-11-15",
    },
    {
        id: 2,
        name: "Aprendiz de POO",
        description: "75% de progresso em POO",
        icon: "🎯",
        unlockedDate: null,
    },
    {
        id: 3,
        name: "Mestre do Spring",
        description: "Completar Spring Boot",
        icon: "⭐",
        unlockedDate: null,
    },
];

export const profileStats = {
    totalStudyTime: "37 horas",
    lastActivity: "Hoje às 14:30",
    modulesCompleted: 1,
    modulesInProgress: 2,
    topicCompleted: 11,
    streak: 5, // dias consecutivos estudando
};