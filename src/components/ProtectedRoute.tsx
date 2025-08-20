import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requirePermission?: string;
  requireRole?: string | string[];
  fallback?: ReactNode;
}

const ProtectedRoute = ({ 
  children, 
  requirePermission, 
  requireRole, 
  fallback 
}: ProtectedRouteProps) => {
  const { user, isLoading, hasPermission, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requirePermission && !hasPermission(requirePermission)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Navigate to="/" replace />
    );
  }

  if (requireRole && !hasRole(requireRole)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Navigate to="/" replace />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
