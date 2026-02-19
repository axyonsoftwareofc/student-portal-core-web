// components/subscribe/SubscribeSuccess.tsx
'use client';

import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SubscribeSuccessProps {
    subscriberName: string;
}

export function SubscribeSuccess({ subscriberName }: SubscribeSuccessProps) {
    return (
        <div className="text-center space-y-6">
            <div className="flex justify-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-emerald-400" strokeWidth={1.5} />
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                    Inscrição Enviada!
                </h2>
                <p className="text-gray-400">
                    Obrigado, <span className="text-sky-400 font-semibold">{subscriberName}</span>!
                </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-left space-y-3">
                <p className="text-gray-300 text-sm leading-relaxed">
                    Recebemos sua inscrição com sucesso! Nossa equipe entrará em contato
                    em breve para conversar sobre o curso e tirar todas as suas dúvidas.
                </p>
                <p className="text-gray-400 text-sm">
                    Fique de olho no seu WhatsApp e e-mail! 📱
                </p>
            </div>

            <Link
                href="/signin"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                Já é aluno? Fazer login
            </Link>
        </div>
    );
}