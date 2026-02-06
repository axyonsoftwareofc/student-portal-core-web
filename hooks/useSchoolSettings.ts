// hooks/useSchoolSettings.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface SchoolSettings {
    name: string;
    description: string;
    primaryColor: string;
}

const DEFAULT_SETTINGS: SchoolSettings = {
    name: 'Code Plus',
    description: 'Escola de programação focada em Java e Spring Framework',
    primaryColor: 'sky',
};

const STORAGE_KEY = 'school_settings';

export function useSchoolSettings() {
    const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar do localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setSettings(JSON.parse(stored));
            }
        } catch (err) {
            console.error('Erro ao carregar configurações:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Salvar configurações
    const saveSettings = useCallback((newSettings: Partial<SchoolSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return { success: true };
    }, [settings]);

    // Resetar para padrão
    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        return { success: true };
    }, []);

    return {
        settings,
        isLoading,
        saveSettings,
        resetSettings,
    };
}