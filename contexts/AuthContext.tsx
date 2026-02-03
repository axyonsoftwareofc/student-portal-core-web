// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  avatar_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Estado global persistente
let globalUser: AppUser | null = null;
let globalSupabaseUser: SupabaseUser | null = null;
let isGlobalLoading = true;
let hasInitialized = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(globalUser);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(globalSupabaseUser);
  const [isLoading, setIsLoading] = useState(isGlobalLoading);

  // Atualizar estados globais e locais
  const updateState = useCallback((newUser: AppUser | null, newSupabaseUser: SupabaseUser | null, loading: boolean) => {
    globalUser = newUser;
    globalSupabaseUser = newSupabaseUser;
    isGlobalLoading = loading;
    setUser(newUser);
    setSupabaseUser(newSupabaseUser);
    setIsLoading(loading);
  }, []);

  // Buscar dados do usuário no banco
  const fetchUserData = useCallback(async (userId: string): Promise<AppUser | null> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

      if (error) {
        console.error('[Auth] Erro buscar usuário:', error.message);
        return null;
      }
      return data as AppUser;
    } catch {
      return null;
    }
  }, []);

  // Inicialização
  useEffect(() => {
    // Se já inicializou e tem dados, usa eles
    if (hasInitialized) {
      setUser(globalUser);
      setSupabaseUser(globalSupabaseUser);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    let mounted = true;

    const init = async () => {
      try {
        // Primeiro, tentar pegar sessão existente
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          if (mounted && userData) {
            hasInitialized = true;
            updateState(userData, session.user, false);
            return;
          }
        }

        // Sem sessão ou sem usuário válido
        hasInitialized = true;
        updateState(null, null, false);
      } catch (err) {
        console.error('[Auth] Erro init:', err);
        hasInitialized = true;
        if (mounted) updateState(null, null, false);
      }
    };

    init();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await fetchUserData(session.user.id);
        if (mounted && userData) {
          updateState(userData, session.user, false);
        }
      } else if (event === 'SIGNED_OUT') {
        hasInitialized = false;
        updateState(null, null, false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        globalSupabaseUser = session.user;
        setSupabaseUser(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData, updateState]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: translateError(error.message) };
      }

      if (data.user) {
        const userData = await fetchUserData(data.user.id);
        if (userData) {
          hasInitialized = true;
          updateState(userData, data.user, false);
          return {
            success: true,
            redirectTo: userData.role === 'admin' ? '/admin/dashboard' : '/aluno/dashboard'
          };
        }
        setIsLoading(false);
        return { success: false, error: 'Perfil não encontrado' };
      }

      setIsLoading(false);
      return { success: false, error: 'Erro desconhecido' };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Erro ao fazer login' };
    }
  }, [fetchUserData, updateState]);

  // Signup
  const signup = useCallback(async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: translateError(error.message) };
      }

      if (data.user) {
        // Criar perfil
        await supabase.from('users').insert({
          id: data.user.id,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role: 'student',
          created_at: new Date().toISOString(),
        });

        const userData = await fetchUserData(data.user.id);
        if (userData) {
          hasInitialized = true;
          updateState(userData, data.user, false);
        }

        return { success: true, redirectTo: '/aluno/dashboard' };
      }

      setIsLoading(false);
      return { success: false, error: 'Erro ao criar conta' };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Erro ao criar conta' };
    }
  }, [fetchUserData, updateState]);

  // Logout
  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignora erros
    }

    // Limpa estado
    hasInitialized = false;
    globalUser = null;
    globalSupabaseUser = null;

    // Força reload limpo
    window.location.href = '/signin';
  }, []);

  return (
      <AuthContext.Provider value={{
        user,
        supabaseUser,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

function translateError(error: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos',
    'User already registered': 'E-mail já cadastrado',
    'Password should be at least 6 characters': 'Senha deve ter 6+ caracteres',
    'Email not confirmed': 'Confirme seu e-mail antes de entrar',
  };
  return map[error] || error;
}