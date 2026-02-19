// app/(auth)/inscreva-se/page.tsx
'use client';

import { useState } from 'react';
import { Code2, BookOpen, Users, Trophy } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/ui/header';
import { SubscribeForm } from '@/components/subscribe/SubscribeForm';
import { SubscribeSuccess } from '@/components/subscribe/SubscribeSuccess';

const COURSE_HIGHLIGHTS = [
    { icon: Code2, text: 'Java + Spring Framework' },
    { icon: BookOpen, text: 'Aulas ao vivo aos sábados' },
    { icon: Users, text: 'Turmas reduzidas e personalizadas' },
    { icon: Trophy, text: 'Projetos práticos do mercado' },
] as const;

export default function SubscribePage() {
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [subscriberName, setSubscriberName] = useState<string>('');

    const handleSubscriptionSuccess = (name: string): void => {
        setSubscriberName(name);
        setIsSubmitted(true);
    };

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                    <div className="space-y-8 text-center lg:text-left">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-1.5">
                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
                                <span className="text-sm text-sky-400 font-medium">Vagas Limitadas</span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                                Aprenda a programar
                                <span className="text-sky-400"> do zero ao profissional</span>
                            </h1>

                            <p className="text-gray-400 text-lg leading-relaxed">
                                Domine Java e Spring Framework com aulas ao vivo, mentoria
                                individualizada e projetos reais que vão turbinar seu portfólio.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {COURSE_HIGHLIGHTS.map((highlight, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 bg-gray-900/50 border border-gray-800/50 rounded-xl p-4"
                                >
                                    <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <highlight.icon className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-gray-300 text-sm font-medium">{highlight.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
                        {isSubmitted ? (
                            <SubscribeSuccess subscriberName={subscriberName} />
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-white">
                                        Inscreva-se Agora
                                    </h2>
                                    <p className="text-gray-400 text-sm">
                                        Preencha seus dados e entraremos em contato!
                                    </p>
                                </div>
                                <SubscribeForm onSuccess={handleSubscriptionSuccess} />
                            </div>
                        )}

                        {!isSubmitted && (
                            <div className="mt-6 pt-6 border-t border-gray-800/50 text-center">
                                <Link
                                    href="/signin"
                                    className="text-sm text-gray-400 hover:text-sky-400 transition-colors"
                                >
                                    Já é aluno? <span className="font-semibold">Fazer login</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}