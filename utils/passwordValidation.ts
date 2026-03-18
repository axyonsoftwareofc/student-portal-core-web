// utils/passwordValidation.ts

export interface PasswordRequirement {
    id: string;
    label: string;
    validator: (password: string) => boolean;
}

export interface PasswordValidationResult {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    strengthScore: number; // 0-100
    requirements: {
        id: string;
        label: string;
        met: boolean;
    }[];
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
    {
        id: 'length',
        label: 'Mínimo 8 caracteres',
        validator: (password) => password.length >= 8,
    },
    {
        id: 'uppercase',
        label: 'Uma letra maiúscula',
        validator: (password) => /[A-Z]/.test(password),
    },
    {
        id: 'lowercase',
        label: 'Uma letra minúscula',
        validator: (password) => /[a-z]/.test(password),
    },
    {
        id: 'number',
        label: 'Um número',
        validator: (password) => /[0-9]/.test(password),
    },
    {
        id: 'special',
        label: 'Um caractere especial (!@#$%...)',
        validator: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
];

export function validatePassword(password: string): PasswordValidationResult {
    const results = PASSWORD_REQUIREMENTS.map((req) => ({
        id: req.id,
        label: req.label,
        met: req.validator(password),
    }));

    const metCount = results.filter((r) => r.met).length;
    const totalRequirements = PASSWORD_REQUIREMENTS.length;

    // Calcular score (0-100)
    const strengthScore = Math.round((metCount / totalRequirements) * 100);

    // Determinar força
    let strength: PasswordValidationResult['strength'];
    if (metCount <= 2) {
        strength = 'weak';
    } else if (metCount <= 3) {
        strength = 'medium';
    } else if (metCount <= 4) {
        strength = 'strong';
    } else {
        strength = 'very-strong';
    }

    // Senha é válida apenas se TODOS os requisitos forem atendidos
    const isValid = metCount === totalRequirements;

    return {
        isValid,
        strength,
        strengthScore,
        requirements: results,
    };
}

export function getStrengthColor(strength: PasswordValidationResult['strength']): string {
    switch (strength) {
        case 'weak':
            return 'rose';
        case 'medium':
            return 'amber';
        case 'strong':
            return 'sky';
        case 'very-strong':
            return 'emerald';
    }
}

export function getStrengthLabel(strength: PasswordValidationResult['strength']): string {
    switch (strength) {
        case 'weak':
            return 'Fraca';
        case 'medium':
            return 'Média';
        case 'strong':
            return 'Forte';
        case 'very-strong':
            return 'Muito forte';
    }
}