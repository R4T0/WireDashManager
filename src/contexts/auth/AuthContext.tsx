
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
    // Função para garantir que o usuário exista na tabela users
    const ensureUserInTable = async (userId: string, userEmail: string) => {
      try {
        // Verificar se o usuário já existe na tabela users usando uma abordagem segura
        const { data, error } = await supabase
          .from('users')
          .select('isadmin')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar usuário:', error);
          // Tentar continuar mesmo com erro
        }
          
        if (!data) {
          console.log('Usuário não encontrado na tabela users, criando agora...');
          
          // Se não existir, adicionar na tabela users
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: userEmail,
              isadmin: false // Por padrão, novos usuários não são admin
            });
          
          if (insertError) {
            console.error('Erro ao inserir usuário na tabela users:', insertError);
          } else {
            console.log('Usuário inserido na tabela users com sucesso');
          }
        } else {
          // Usuário existe, definir flag de admin
          setIsAdmin(data.isadmin || false);
        }
      } catch (error) {
        console.error('Erro ao verificar/criar usuário:', error);
      }
    };

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth event:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Verificar/criar usuário na tabela users quando fizer login
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Usar setTimeout para evitar recursão na política
          setTimeout(() => {
            ensureUserInTable(newSession.user.id, newSession.user.email || '');
          }, 100);
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
        setTimeout(() => {
          ensureUserInTable(currentSession.user.id, currentSession.user.email || '');
        }, 100);
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
