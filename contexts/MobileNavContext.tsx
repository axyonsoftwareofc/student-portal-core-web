// contexts/MobileNavContext.tsx
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface MobileNavContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined);

// Estado do drawer de navegação, compartilhado entre o header (botão) e o Sidebar (Sheet)
export function MobileNavProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <MobileNavContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </MobileNavContext.Provider>
    );
}

export function useMobileNav(): MobileNavContextType {
    const context = useContext(MobileNavContext);

    if (!context) {
        throw new Error('useMobileNav deve ser usado dentro de MobileNavProvider');
    }

    return context;
}
