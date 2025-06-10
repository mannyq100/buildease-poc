import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import type { UserRole } from '@/types/user';

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
  const { isAuthenticated, isLoading, isLoadingProfile, profile, authError } = useSupabaseAuth();
  const location = useLocation();

  // Show loading state while authentication is being checked
  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        {/* Mobile-first loading state with appropriate sizing */}
        <div className="flex flex-col items-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg backdrop-blur-sm border border-gray-100 dark:border-gray-700">
          <div className="h-12 w-12 rounded-full border-4 border-[#2B6CB0] border-t-[#ED8936] animate-spin mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
            Loading your BuildEase account...
          </p>
          <div className="mt-3 flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-[#2B6CB0] animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-[#2B6CB0] animate-pulse delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-[#2B6CB0] animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page with return path
  if (!isAuthenticated) {
    // Save the location the user is trying to access for redirection after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Handle authentication errors
  if (authError) {
    console.error('Authentication error in ProtectedRoute:', authError);
    // Could add additional error handling here if needed
  }

  // Role-based access check
  if (requiredRoles.length > 0 && profile) {
    // Check if the user has any of the required roles from their project memberships
    const hasRequiredRole = profile.projectMemberships.some(membership => 
      requiredRoles.includes(membership.role)
    );
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required roles (if any)
  return <>{children}</>;
}