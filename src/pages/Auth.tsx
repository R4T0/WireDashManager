
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Verificar se usuário já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      console.log('Verificando sessão existente');
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log('Sessão encontrada, redirecionando');
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">WireGuard Manager</CardTitle>
          <CardDescription>
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
          />
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          WireGuard Manager - Sistema de gerenciamento
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
