
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  email, 
  setEmail, 
  password, 
  setPassword 
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpar estado de autenticação para evitar problemas
  const cleanupAuthState = () => {
    localStorage.removeItem('supabase.auth.token');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Limpar estado de autenticação
      cleanupAuthState();
      
      // Tentar fazer logout global por segurança
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continuar mesmo se falhar
      }
      
      // Login com email e senha
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Verificar se o usuário existe na tabela users
        // @ts-ignore - We've created the users table in the database, but TypeScript doesn't know about it yet
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id);
        
        if (userError) {
          console.error('Erro ao verificar usuário:', userError);
          
          // Se o usuário não existir na tabela users, inserir automaticamente
          // @ts-ignore - We've created the users table in the database, but TypeScript doesn't know about it yet
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              isadmin: false
            });
          
          if (insertError) {
            console.error('Erro ao inserir usuário na tabela users:', insertError);
          }
        } else if (!userData || userData.length === 0) {
          // Se o usuário não existir na tabela users, inserir automaticamente
          // @ts-ignore - We've created the users table in the database, but TypeScript doesn't know about it yet
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              isadmin: false
            });
          
          if (insertError) {
            console.error('Erro ao inserir usuário na tabela users:', insertError);
          }
        }
        
        toast({
          title: 'Login realizado com sucesso',
          description: `Bem-vindo de volta, ${email}!`,
        });
        
        // Redirecionar para página inicial
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro de login:', error);
      setError(error.message || 'Falha na autenticação');
      
      toast({
        title: 'Erro de autenticação',
        description: error.message || 'Credenciais inválidas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <label htmlFor="loginEmail" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="loginEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="loginPassword" className="text-sm font-medium">
            Senha
          </label>
          <Input
            id="loginPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
