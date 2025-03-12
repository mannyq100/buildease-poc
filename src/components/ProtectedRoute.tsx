import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { UserRole } from '@/auth/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

/**
 * Protects routes that require authentication
 * Redirects to login page if not authenticated
 * Optionally checks for required roles
 */
export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { state } = useAuth();
  const location = useLocation();
  
  // Wait until auth state is determined
  if (state.isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check role permissions if specified
  if (requiredRoles.length > 0 && state.user) {
    const hasRequiredRole = requiredRoles.includes(state.user.role);
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  return <>{children}</>;
} 