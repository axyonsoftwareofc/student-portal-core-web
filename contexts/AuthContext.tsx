'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Tipo do usuário
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

// Tipo do contexto
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários de teste (em produção isso viria de uma API)
const TEST_USERS = [
  {
    id: '1',
    email: 'aluno@teste.com',
    password: '123456',
    name: 'João Silva',
    role: 'student' as const,
  },
  {
    id: '2',
    email: 'admin@teste.com',
    password: 'admin123',
    name: 'Maria Santos',
    role: 'admin' as const,
  },
];

// Provider do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar se há um usuário salvo no localStorage ao carregar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar credenciais
      const foundUser = TEST_USERS.find(
        u => u.email === email && u.password === password
      );

      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirecionar baseado no role
        if (userData.role === 'student') {
          router.push('/aluno/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/signin');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook customizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
