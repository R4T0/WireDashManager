
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Auth = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-wireguard p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">WireGuard Manager</CardTitle>
          <CardDescription>Acesso ao sistema de gerenciamento VPN</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSuccess={() => window.location.href = '/'} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
