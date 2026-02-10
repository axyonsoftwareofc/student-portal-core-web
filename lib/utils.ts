// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para combinar classes Tailwind de forma inteligente.
 * Usa clsx para concatenar e twMerge para resolver conflitos.
 *
 * @example
 * cn("px-4 py-2", "px-6") // retorna "py-2 px-6" (px-6 sobrescreve px-4)
 * cn("bg-red-500", isActive && "bg-blue-500") // condicional
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}