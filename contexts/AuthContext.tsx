// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const fetchUserData = useCallback(async (userId: string): Promise<AppUser | null> => {
    try {
      const { data, error } = await supabase
          .from('users')
          .select('id, email, name, role, avatar_url, phone, created_at, updated_at')
          .eq('id', userId)
          .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Erro ao buscar dados do usuário:', error);
        }
        return null;
      }

      return data as AppUser;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  }, [supabase]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();

        if (error && error.message !== 'Auth session missing!') {
          console.error('Erro ao obter usuário:', error);
        }

        if (authUser) {
          setSupabaseUser(authUser);
          const userData = await fetchUserData(authUser.id);
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        if (!errorMessage.includes('Auth session missing')) {
          console.error('Erro ao carregar usuário:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            setSupabaseUser(session.user);
            const userData = await fetchUserData(session.user.id);
            if (userData) {
              setUser(userData);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setSupabaseUser(null);
          }
        }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserData]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: getErrorMessage(error.message) };
      }

      if (data.user) {
        const userData = await fetchUserData(data.user.id);

        if (userData) {
          setUser(userData);
          setSupabaseUser(data.user);

          if (userData.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/aluno/dashboard');
          }

          return { success: true };
        } else {
          return { success: false, error: 'Perfil não encontrado. Entre em contato com o administrador.' };
        }
      }

      return { success: false, error: 'Erro ao fazer login' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro inesperado. Tente novamente.' };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: existingUser } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', email)
          .single();

      if (existingUser) {
        return { success: false, error: 'Este e-mail já está cadastrado. Tente fazer login.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Este e-mail já está cadastrado. Tente fazer login.' };
        }
        return { success: false, error: getErrorMessage(error.message) };
      }

      if (data.user) {
        const existingProfile = await fetchUserData(data.user.id);

        if (existingProfile) {
          setUser(existingProfile);
          setSupabaseUser(data.user);
          router.push('/aluno/dashboard');
          return { success: true };
        }

        const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: email,
              name: name,
              role: 'student',
              created_at: new Date().toISOString(),
            } as Record<string, unknown>);

        if (insertError) {
          if (insertError.message.includes('duplicate')) {
            const userData = await fetchUserData(data.user.id);
            if (userData) {
              setUser(userData);
              setSupabaseUser(data.user);
              router.push('/aluno/dashboard');
              return { success: true };
            }
          }

          console.error('Erro ao criar perfil do usuário:', insertError.message);
          return { success: false, error: 'Erro ao criar perfil. Tente fazer login.' };
        }

        const userData = await fetchUserData(data.user.id);

        if (userData) {
          setUser(userData);
          setSupabaseUser(data.user);
        }

        router.push('/aluno/dashboard');
        return { success: true };
      }

      return { success: false, error: 'Erro ao criar conta' };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: 'Erro inesperado. Tente novamente.' };
    }
  };

  // Função de logout CORRIGIDA
  const logout = async () => {
    if (isLoggingOut) return; // Evita múltiplas chamadas

    setIsLoggingOut(true);

    try {
      // Limpa o estado primeiro para UI responder rápido
      setUser(null);
      setSupabaseUser(null);

      // Faz o signOut no Supabase
      await supabase.auth.signOut({ scope: 'local' });

      // Redireciona
      router.push('/signin');
      router.refresh();
    } catch (error) {
      console.error('Erro no logout:', error);
      // Fallback
      window.location.href = '/signin';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const value = {
    user,
    supabaseUser,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos',
    'Email not confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada.',
    'User already registered': 'Este e-mail já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Unable to validate email address: invalid format': 'Formato de e-mail inválido',
  };

  return errorMessages[error] || 'Erro ao processar. Tente novamente.';
}