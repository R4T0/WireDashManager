
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SignupForm from './SignupForm';

interface FirstUserSetupProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string | null;
}

const FirstUserSetup: React.FC<FirstUserSetupProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  error
}) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">WireGuard Manager</CardTitle>
        <CardDescription>
          Configure o primeiro usuário administrador
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <SignupForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isFirstUser={true}
        />
      </CardContent>
    </Card>
  );
};

export default FirstUserSetup;
