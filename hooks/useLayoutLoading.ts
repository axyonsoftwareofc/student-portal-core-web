// hooks/useLayoutLoading.ts
import { useEffect, useState } from "react";

interface UseLayoutLoadingOptions {
    /** Se o contexto pai ainda está carregando */
    isParentLoading: boolean;
    /** Tempo máximo de espera em ms (default: 1500) */
    maxWaitTime?: number;
}

/**
 * Hook para gerenciar o estado de loading de layouts.
 * Garante que o conteúdo seja exibido após o carregamento
 * ou após um timeout máximo.
 *
 * @example
 * const { showContent } = useLayoutLoading({ isParentLoading: isLoading });
 * if (!showContent) return <LoadingScreen />;
 */
export function useLayoutLoading({
                                     isParentLoading,
                                     maxWaitTime = 1500,
                                 }: UseLayoutLoadingOptions) {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (!isParentLoading) {
            setShowContent(true);
            return;
        }

        const timer = setTimeout(() => setShowContent(true), maxWaitTime);
        return () => clearTimeout(timer);
    }, [isParentLoading, maxWaitTime]);

    return { showContent };
}