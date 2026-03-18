// components/common/password-strength.tsx
'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    PasswordValidationResult,
    getStrengthColor,
    getStrengthLabel,
} from '@/utils/passwordValidation';

interface PasswordStrengthProps {
    validation: PasswordValidationResult;
    showRequirements?: boolean;
}

type ColorKey = 'rose' | 'amber' | 'sky' | 'emerald';

const colorClasses: Record<ColorKey, { bar: string; text: string; icon: string }> = {
    rose: {
        bar: 'bg-rose-500',
        text: 'text-rose-400',
        icon: 'text-rose-400',
    },
    amber: {
        bar: 'bg-amber-500',
        text: 'text-amber-400',
        icon: 'text-amber-400',
    },
    sky: {
        bar: 'bg-sky-500',
        text: 'text-sky-400',
        icon: 'text-sky-400',
    },
    emerald: {
        bar: 'bg-emerald-500',
        text: 'text-emerald-400',
        icon: 'text-emerald-400',
    },
};

export function PasswordStrength({ validation, showRequirements = true }: PasswordStrengthProps) {
    const color = getStrengthColor(validation.strength) as ColorKey;
    const label = getStrengthLabel(validation.strength);
    const colors = colorClasses[color];

    return (
        <div className="space-y-3">
            {/* Barra de força */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                        className={cn('h-full transition-all duration-300', colors.bar)}
                        style={{ width: `${validation.strengthScore}%` }}
                    />
                </div>
                <span className={cn('text-xs font-medium min-w-[80px] text-right', colors.text)}>
          {label}
        </span>
            </div>

            {/* Lista de requisitos */}
            {showRequirements && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {validation.requirements.map((req) => (
                        <div
                            key={req.id}
                            className={cn(
                                'flex items-center gap-2 text-xs transition-colors',
                                req.met ? 'text-emerald-400' : 'text-gray-500'
                            )}
                        >
                            {req.met ? (
                                <Check className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
                            ) : (
                                <X className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
                            )}
                            <span>{req.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}