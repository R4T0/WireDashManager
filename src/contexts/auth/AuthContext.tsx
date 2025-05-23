
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase';
import { SystemUser, AuthState, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  // Check if user is already authenticated on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Attempt to get session from localStorage
        const storedUser = localStorage.getItem('wireguard_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          });
          console.log('User restored from storage:', user.email);
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: 'Failed to restore session'
        });
      }
    };

    checkAuth();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Query the system_users table for the user with matching email
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .eq('email', credentials.email)
        .single();

      if (error) {
        throw new Error('User not found');
      }

      // Compare the password hash (in a real system, we'd use bcrypt or similar)
      // For now, we'll use a simple check since we can't do real password hashing on the client
      if (data.password_hash !== credentials.password) {
        throw new Error('Invalid password');
      }

      // Map database user to our SystemUser type
      const user: SystemUser = {
        id: data.id,
        email: data.email,
        isAdmin: data.is_admin,
        created_at: data.created_at
      };

      // Store user in localStorage
      localStorage.setItem('wireguard_user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo, ${user.email}!`,
      });

      // Redirect to home after successful login
      window.location.href = '/';
    } catch (error: any) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Falha no login'
      }));
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (credentials: RegisterCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // First check if user already exists
      const { data: existingUser } = await supabase
        .from('system_users')
        .select('id')
        .eq('email', credentials.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Este email já está em uso');
      }

      // Create new user
      const { data, error } = await supabase
        .from('system_users')
        .insert({
          email: credentials.email,
          password_hash: credentials.password, // In a real app, hash this password
          is_admin: false // New users are not admins by default
        })
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao criar conta: ' + error.message);
      }

      // Map database user to our SystemUser type
      const user: SystemUser = {
        id: data.id,
        email: data.email,
        isAdmin: data.is_admin,
        created_at: data.created_at
      };

      toast({
        title: "Conta criada com sucesso",
        description: "Você foi registrado e autenticado no sistema",
      });

      // Automatically log the user in
      localStorage.setItem('wireguard_user', JSON.stringify(user));
      
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Falha no registro'
      }));
      toast({
        title: "Erro no registro",
        description: error.message || "Não foi possível criar sua conta",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear authentication from localStorage
      localStorage.removeItem('wireguard_user');
      
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });

      toast({
        title: "Logout realizado",
        description: "Você saiu do sistema com sucesso",
      });

      // Redirect to login page
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Erro ao sair",
        description: error.message || "Não foi possível sair do sistema",
        variant: "destructive",
      });
    }
  };

  const value = {
    ...state,
    signIn,
    signUp,
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
