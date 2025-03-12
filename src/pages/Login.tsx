import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LoginForm } from '@/auth/components/LoginForm';
import { useAuth } from '@/auth/hooks/useAuth';

/**
 * Login page component
 */
export function Login() {
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [state.isAuthenticated, navigate, location.state?.from]);

  return (
    <>
      <Helmet>
        <title>Login | Buildease</title>
      </Helmet>
      
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Buildease</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Log in to your construction management account
            </p>
          </div>
          
          <LoginForm />
          
          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            By logging in, you agree to our{' '}
            <a href="/terms" className="underline hover:text-slate-700 dark:hover:text-slate-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </>
  );
} 