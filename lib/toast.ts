// lib/toast.ts
import { toast } from 'sonner';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
    description?: string;
    duration?: number;
}

const ICONS: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

const DURATIONS: Record<ToastType, number> = {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000,
};

export function showToast(type: ToastType, message: string, options?: ToastOptions) {
    const icon = ICONS[type];
    const duration = options?.duration ?? DURATIONS[type];

    const toastFn = {
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
    }[type];

    toastFn(message, {
        description: options?.description,
        duration,
        icon,
    });
}

export function showSuccessToast(message: string, description?: string) {
    showToast('success', message, { description });
}

export function showErrorToast(message: string, description?: string) {
    showToast('error', message, { description });
}

export function showWarningToast(message: string, description?: string) {
    showToast('warning', message, { description });
}

export function showInfoToast(message: string, description?: string) {
    showToast('info', message, { description });
}