
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  
  // Verificar se existe algum usuário no sistema
  useEffect(() => {
    const checkForUsers = async () => {
      try {
        // @ts-ignore - We've created the users table in the database, but TypeScript doesn't know about it yet
        const { data, error, count } = await supabase
          .from('users')
          .select('*', { count: 'exact' });
          
        if (error) throw error;
        
        // Se não existirem usuários, este será o primeiro admin
        setIsFirstUser(count === 0);
      } catch (error) {
        console.error('Erro ao verificar usuários:', error);
      }
    };
    
    checkForUsers();
  }, []);

  // Limpar estado de autenticação para evitar problemas
  const cleanupAuthState = () => {
    localStorage.removeItem('supabase.auth.token');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  // Verificar se usuário já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);

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
        // Verificar se o usuário tem permissão de acesso
        // @ts-ignore - We've created the users table in the database, but TypeScript doesn't know about it yet
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userError || !userData) {
          await supabase.auth.signOut();
          throw new Error('Usuário não tem permissão para acessar o sistema');
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Limpar estado de autenticação
      cleanupAuthState();
      
      // Registrar novo usuário
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Criar registro na tabela de usuários
        // @ts-ignore - We've created the users table in the database, but TypeScript doesn't know about it yet
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          email: email,
          // Se for o primeiro usuário, será admin por padrão
          isAdmin: isFirstUser
        });
        
        if (insertError) throw insertError;
        
        toast({
          title: 'Registro realizado com sucesso',
          description: isFirstUser
            ? 'Você foi registrado como administrador do sistema.'
            : 'Sua conta foi criada com sucesso.',
        });
        
        // Redirecionar para página inicial
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro de registro:', error);
      setError(error.message || 'Falha no registro');
      
      toast({
        title: 'Erro no registro',
        description: error.message || 'Não foi possível criar sua conta',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">WireGuard Manager</CardTitle>
          <CardDescription>
            {isFirstUser 
              ? 'Configure o primeiro usuário administrador' 
              : 'Faça login para acessar o sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isFirstUser ? (
            <form onSubmit={handleSignUp}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@exemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500">
                    A senha deve ter pelo menos 6 caracteres
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrar Administrador'}
                </Button>
              </div>
            </form>
          ) : (
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
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
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleSignUp}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="registerEmail" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="registerEmail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="registerPassword" className="text-sm font-medium">
                        Senha
                      </label>
                      <Input
                        id="registerPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500">
                        A senha deve ter pelo menos 6 caracteres
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Registrando...' : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Registrar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          WireGuard Manager - Sistema de gerenciamento
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
