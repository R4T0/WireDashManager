
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import FirstUserSetup from '@/components/auth/FirstUserSetup';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {isFirstUser ? (
        <FirstUserSetup
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          error={error}
        />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">WireGuard Manager</CardTitle>
            <CardDescription>
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                />
              </TabsContent>
              
              <TabsContent value="register">
                <SignupForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  isFirstUser={false}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500">
            WireGuard Manager - Sistema de gerenciamento
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Auth;
