
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

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

  // Função segura para verificar/criar usuário sem causar recursão
  const safeEnsureUser = async (userId: string, userEmail: string) => {
    try {
      console.log('Verificando usuário na tabela users:', userId);
      
      // Consulta direta pelo ID sem depender de políticas RLS
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao verificar usuário:', error);
        return;
      }
      
      if (!data) {
        console.log('Usuário não encontrado, criando registro...');
        
        // Criar usuário se não existir
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: userEmail,
            isadmin: false
          });
        
        if (insertError) {
          console.error('Erro ao inserir usuário:', insertError);
        } else {
          console.log('Usuário inserido com sucesso');
          setIsAdmin(false);
        }
      } else {
        console.log('Usuário encontrado:', data);
        setIsAdmin(data.isadmin || false);
      }
    } catch (error) {
      console.error('Erro ao processar usuário:', error);
    }
  };

  // Efeito para configurar ouvintes de autenticação
  useEffect(() => {
    console.log('Configurando ouvintes de autenticação');
    
    // Definir ouvinte para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Evento de autenticação:', event);
        
        // Atualizar estado com sessão e usuário
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Usar setTimeout para evitar problemas de recursão
          setTimeout(() => {
            safeEnsureUser(newSession.user.id, newSession.user.email || '');
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
        }
      }
    );

    // Verificar sessão atual ao inicializar
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Sessão atual:', currentSession ? 'Autenticado' : 'Não autenticado');
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Usar setTimeout para evitar problemas de recursão
        setTimeout(() => {
          safeEnsureUser(currentSession.user.id, currentSession.user.email || '');
        }, 100);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função de logout segura
  const signOut = async () => {
    try {
      console.log('Iniciando processo de logout');
      
      // Limpar estado de autenticação local
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Tentativa de logout global
      await supabase.auth.signOut({ scope: 'global' });
      
      // Resetar estado
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Forçar redirecionamento para página de login
      window.location.href = '/auth';
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      
      // Forçar redirecionamento mesmo em caso de erro
      window.location.href = '/auth';
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
