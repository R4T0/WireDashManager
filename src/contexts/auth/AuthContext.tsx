
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase';
import { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Função para verificar se o usuário é admin
    const checkUserAdmin = async (userId: string) => {
      try {
        // Use the correct typing for from() method
        // @ts-ignore - We've created the table in the database, but TypeScript doesn't know about it yet
        const { data, error } = await supabase
          .from('users')
          .select('isadmin')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        setIsAdmin(data?.isadmin || false); // Note: using isadmin (lowercase) from the database
      } catch (error) {
        console.error('Erro ao verificar permissões do usuário:', error);
        setIsAdmin(false);
      }
    };

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Verificar admin status quando o usuário fizer login
        if (event === 'SIGNED_IN' && newSession?.user) {
          setTimeout(() => {
            checkUserAdmin(newSession.user.id);
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
        }
      }
    );

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        checkUserAdmin(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Limpar estado de autenticação
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Tentar fazer logout global
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignorar erros
      }
      
      // Forçar recarregamento da página para limpar o estado
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value = {
    user,
    session,
    isAdmin,
    isLoading,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
