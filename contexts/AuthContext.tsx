// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, ReactNode, useCallback, useSyncExternalStore } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, AuthChangeEvent, Session } from '@supabase/supabase-js';

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

// ========== STORE EXTERNO ==========
interface AuthStore {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
}

let store: AuthStore = {
  user: null,
  supabaseUser: null,
  isLoading: true,
};

const listeners: Set<() => void> = new Set();
let isInitialized = false;
let authListenerSet = false;

function getSnapshot(): AuthStore {
  return store;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function updateStore(partial: Partial<AuthStore>) {
  store = { ...store, ...partial };
  listeners.forEach(listener => listener());
}

// Buscar dados do usuário com timeout de segurança
async function fetchUserFromDB(userId: string): Promise<AppUser | null> {
  const supabase = createClient();

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), 5000);
  });

  const queryPromise = (async () => {
    try {
      const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

      if (error) {
        console.error('[Auth] Erro ao buscar usuário:', error.message);
        return null;
      }

      return data as AppUser;
    } catch (err) {
      console.error('[Auth] Erro inesperado:', err);
      return null;
    }
  })();

  return Promise.race([queryPromise, timeoutPromise]);
}

// Setup do listener de auth (roda uma vez)
function setupAuthListener() {
  if (authListenerSet) return;
  authListenerSet = true;

  const supabase = createClient();

  supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
    if (event === 'SIGNED_IN' && session?.user) {
      if (!store.user || store.user.id !== session.user.id) {
        updateStore({ isLoading: true });
        const userData = await fetchUserFromDB(session.user.id);
        updateStore({
          user: userData,
          supabaseUser: session.user,
          isLoading: false,
        });
      }
    } else if (event === 'SIGNED_OUT') {
      updateStore({ user: null, supabaseUser: null, isLoading: false });
      isInitialized = false;
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      updateStore({ supabaseUser: session.user });
    }
  });
}

// Inicialização
async function initializeAuth() {
  if (isInitialized) return;

  setupAuthListener();

  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const userData = await fetchUserFromDB(session.user.id);
      updateStore({
        user: userData,
        supabaseUser: session.user,
        isLoading: false,
      });
    } else {
      updateStore({ isLoading: false });
    }

    isInitialized = true;
  } catch (err) {
    console.error('[Auth] Erro na inicialização:', err);
    updateStore({ isLoading: false });
    isInitialized = true;
  }
}

// ========== PROVIDER ==========
export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      updateStore({ isLoading: true });
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        updateStore({ isLoading: false });
        return { success: false, error: translateError(error.message) };
      }

      if (data.user) {
        const userData = await fetchUserFromDB(data.user.id);
        if (userData) {
          updateStore({
            user: userData,
            supabaseUser: data.user,
            isLoading: false,
          });
          isInitialized = true;
          return {
            success: true,
            redirectTo: userData.role === 'admin' ? '/admin/dashboard' : '/aluno/dashboard'
          };
        }
        updateStore({ isLoading: false });
        return { success: false, error: 'Perfil não encontrado' };
      }

      updateStore({ isLoading: false });
      return { success: false, error: 'Erro desconhecido' };
    } catch {
      updateStore({ isLoading: false });
      return { success: false, error: 'Erro ao fazer login' };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    try {
      updateStore({ isLoading: true });
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        updateStore({ isLoading: false });
        return { success: false, error: translateError(error.message) };
      }

      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role: 'student',
          created_at: new Date().toISOString(),
        });

        const userData = await fetchUserFromDB(data.user.id);
        if (userData) {
          updateStore({
            user: userData,
            supabaseUser: data.user,
            isLoading: false,
          });
          isInitialized = true;
        }

        return { success: true, redirectTo: '/aluno/dashboard' };
      }

      updateStore({ isLoading: false });
      return { success: false, error: 'Erro ao criar conta' };
    } catch {
      updateStore({ isLoading: false });
      return { success: false, error: 'Erro ao criar conta' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignora erros
    }

    store = { user: null, supabaseUser: null, isLoading: true };
    isInitialized = false;
    authListenerSet = false;

    window.location.href = '/signin';
  }, []);

  return (
      <AuthContext.Provider value={{
        user: state.user,
        supabaseUser: state.supabaseUser,
        isLoading: state.isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!state.user,
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