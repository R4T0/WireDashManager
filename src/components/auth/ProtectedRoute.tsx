
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Add error boundary for useAuth hook
  let authState;
  
  try {
    authState = useAuth();
  } catch (error) {
    console.error('ProtectedRoute: useAuth error:', error);
    // If useAuth fails, redirect to auth page
    return <Navigate to="/auth" replace />;
  }

  const { isAuthenticated, loading } = authState;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-wireguard-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
