// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
    if (supabaseClient) {
        return supabaseClient
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (typeof window === 'undefined') {
        // No servidor, cria um cliente temporário
        return createBrowserClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseKey || 'placeholder-key'
        )
    }

    if (!supabaseUrl || !supabaseKey) {
        console.error('[Supabase] Credenciais não encontradas')
        throw new Error('Supabase credentials are required')
    }

    supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
    return supabaseClient
}

// Função para obter o cliente existente (sem criar novo)
export function getClient() {
    return supabaseClient
}