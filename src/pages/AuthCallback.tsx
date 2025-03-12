import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/auth/hooks/useAuth';
import { AuthProvider } from '@/auth/types/auth';
import { Card, CardContent } from '@/components/ui/card';

/**
 * AuthCallback page component for handling OAuth callbacks
 */
export function AuthCallback() {
  const { provider } = useParams<{ provider: string }>();
  const { handleSocialLoginCallback, state } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    
    // Handle errors returned from OAuth provider
    if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }
    
    if (!code) {
      setError('No authorization code received');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }
    
    if (!provider || !['google', 'facebook', 'apple'].includes(provider)) {
      setError('Invalid authentication provider');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }
    
    // Process the authentication
    async function processAuth() {
      try {
        await handleSocialLoginCallback(provider as AuthProvider, code);
        
        // If authentication was successful, redirect to dashboard
        if (state.isAuthenticated && !state.error) {
          const redirectPath = sessionStorage.getItem('auth_redirect') || '/dashboard';
          sessionStorage.removeItem('auth_redirect');
          navigate(redirectPath);
        }
      } catch (err) {
        setError('Failed to authenticate. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    }
    
    processAuth();
  }, [provider, handleSocialLoginCallback, navigate, state.isAuthenticated, state.error]);
  
  return (
    <>
      <Helmet>
        <title>Authenticating | Buildease</title>
      </Helmet>
      
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              {error ? (
                <>
                  <div className="text-red-500 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
                  <p>Redirecting you back to login...</p>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Authenticating...</h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Please wait while we complete your {provider} login.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 