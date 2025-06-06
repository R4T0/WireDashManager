
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface SignupFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isFirstUser: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ 
  email, 
  setEmail, 
  password, 
  setPassword,
  isFirstUser 
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Limpar estado de autenticação
      cleanupAuthState();
      
      let userId = null;
      
      // Se for o primeiro usuário, podemos registrar diretamente
      if (isFirstUser) {
        // Registrar novo usuário diretamente na tabela system_users
        const insertResult = await supabase
          .from('system_users')
          .insert({
            email: email,
            password_hash: password,
            is_admin: true
          })
          .select();
        
        if (insertResult.error) throw insertResult.error;
        userId = insertResult.data[0]?.id;
      } else {
        // Caso não seja o primeiro usuário, primeiro verificamos se já existe
        const existingResult = await supabase
          .from('system_users')
          .select('id')
          .eq('email', email)
          .single();
        
        if (existingResult.data) {
          throw new Error('Este email já está em uso');
        }
        
        // Registrar novo usuário
        const insertResult = await supabase
          .from('system_users')
          .insert({
            email: email,
            password_hash: password,
            is_admin: false
          })
          .select();
        
        if (insertResult.error) throw insertResult.error;
        userId = insertResult.data[0]?.id;
      }
      
      if (userId) {
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
    <form onSubmit={handleSignUp}>
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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
              {isFirstUser ? 'Registrar Administrador' : 'Registrar'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SignupForm;
