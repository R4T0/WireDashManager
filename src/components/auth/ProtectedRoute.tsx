
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar indicador de carregamento enquanto verifica autenticação
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  // Redirecionar para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Verificar permissões de admin se necessário
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
