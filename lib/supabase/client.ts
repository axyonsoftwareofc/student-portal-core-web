// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
    // Se já existe um cliente, retorna ele (singleton)
    if (supabaseClient) {
        return supabaseClient
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Verifica se estamos no browser
    if (typeof window === 'undefined') {
        // No servidor durante build, retorna cliente placeholder
        // Isso não será usado para operações reais
        return createBrowserClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseKey || 'placeholder-key'
        )
    }

    // No browser, as variáveis devem estar disponíveis
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials are required')
    }

    supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
    return supabaseClient
}