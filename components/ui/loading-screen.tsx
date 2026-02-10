// components/ui/loading-screen.tsx
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
    /** Mensagem exibida abaixo do spinner */
    message?: string;
    /** Classes CSS adicionais */
    className?: string;
}

/**
 * Tela de loading em tela cheia.
 * Usado durante carregamento inicial de páginas/layouts.
 */
export function LoadingScreen({
                                  message = "Carregando...",
                                  className,
                              }: LoadingScreenProps) {
    return (
        <div
            className={cn(
                "flex h-screen items-center justify-center bg-gray-950",
                className
            )}
        >
            <div className="text-center space-y-4">
                <Loader2
                    className="h-8 w-8 animate-spin text-sky-500 mx-auto"
                    strokeWidth={1.5}
                />
                <p className="text-sm text-gray-500">{message}</p>
            </div>
        </div>
    );
}