// components/subscribe/SubscribeForm.tsx
'use client';

import { useState, useRef } from 'react';
import { Send, User, Mail, Phone, MessageSquare, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CreateLeadDTO } from '@/lib/types/leads';
import { cn } from '@/lib/utils';

const LEAD_SOURCES = [
    { value: 'google', label: 'Google' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'indicacao', label: 'Indicação de amigo' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'outro', label: 'Outro' },
] as const;

interface SubscribeFormProps {
    onSuccess: (name: string) => void;
}

export function SubscribeForm({ onSuccess }: SubscribeFormProps) {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [formData, setFormData] = useState<CreateLeadDTO>({
        name: '',
        email: '',
        phone: '',
        source: '',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
        const { name, value } = event.target;
        setFormData((previous: CreateLeadDTO) => ({ ...previous, [name]: value }));
        setFormError(null);
    };

    const formatPhoneNumber = (value: string): string => {
        const digitsOnly = value.replace(/\D/g, '');
        const limitedDigits = digitsOnly.slice(0, 11);

        if (limitedDigits.length <= 2) return limitedDigits;
        if (limitedDigits.length <= 7) return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2)}`;
        return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2, 7)}-${limitedDigits.slice(7)}`;
    };

    const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const formattedPhone = formatPhoneNumber(event.target.value);
        setFormData((previous: CreateLeadDTO) => ({ ...previous, phone: formattedPhone }));
        setFormError(null);
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setFormError('Por favor, informe seu nome.');
            return false;
        }

        if (!formData.email.trim()) {
            setFormError('Por favor, informe seu e-mail.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormError('Por favor, informe um e-mail válido.');
            return false;
        }

        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setFormError('Por favor, informe um telefone válido com DDD.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            setFormError(null);

            const leadPayload: CreateLeadDTO = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                source: formData.source || undefined,
                message: formData.message?.trim() || undefined,
            };

            const { error: insertError } = await supabase
                .from('leads')
                .insert([leadPayload]);

            if (insertError) {
                throw new Error(insertError.message);
            }

            onSuccess(formData.name.trim().split(' ')[0]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar inscrição';
            setFormError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBaseClasses = 'w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-200';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-3 text-sm text-rose-400">
                    {formError}
                </div>
            )}

            <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                <input
                    type="text"
                    name="name"
                    placeholder="Seu nome completo *"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputBaseClasses}
                    disabled={isSubmitting}
                />
            </div>

            <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                <input
                    type="email"
                    name="email"
                    placeholder="Seu melhor e-mail *"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputBaseClasses}
                    disabled={isSubmitting}
                />
            </div>

            <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                <input
                    type="tel"
                    name="phone"
                    placeholder="Seu WhatsApp com DDD *"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={inputBaseClasses}
                    disabled={isSubmitting}
                />
            </div>

            <div className="relative">
                <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-500 pointer-events-none" strokeWidth={1.5} />
                <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className={cn(
                        'w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-200 appearance-none',
                        !formData.source && 'text-gray-500'
                    )}
                    disabled={isSubmitting}
                >
                    <option value="" className="text-gray-500">Como nos encontrou?</option>
                    {LEAD_SOURCES.map((source) => (
                        <option key={source.value} value={source.value} className="text-white bg-gray-800">
                            {source.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                <textarea
                    name="message"
                    placeholder="Conte um pouco sobre você e seus objetivos (opcional)"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className={cn(inputBaseClasses, 'resize-none')}
                    disabled={isSubmitting}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                    'w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-white transition-all duration-200',
                    isSubmitting
                        ? 'bg-sky-500/50 cursor-not-allowed'
                        : 'bg-sky-500 hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/25'
                )}
            >
                {isSubmitting ? (
                    <>
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                    </>
                ) : (
                    <>
                        <Send className="h-5 w-5" strokeWidth={1.5} />
                        Quero me inscrever
                    </>
                )}
            </button>

            <p className="text-xs text-gray-500 text-center">
                Ao se inscrever, você concorda em receber contato da equipe Code Plus.
            </p>
        </form>
    );
}