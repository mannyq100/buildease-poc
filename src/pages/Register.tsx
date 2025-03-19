import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '@/auth/components/RegisterForm';
import { useAuth } from '@/auth/hooks/useAuth';
import { m, LazyMotion, domAnimation } from 'framer-motion';

/**
 * Modern and simplified registration page with construction management theme
 */
export function Register() {
  const { state } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (state.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [state.isAuthenticated, navigate]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex min-h-screen bg-white dark:bg-slate-900 overflow-hidden">
        {/* Main content */}
        <div className="flex flex-col items-center justify-center w-full p-4 sm:p-8">
          <m.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link to="/" className="inline-block">
              <div className="flex items-center justify-center">
                <img 
                  src="/buildease-logo-1.svg" 
                  alt="BuildEase Logo" 
                  className="h-12"
                />
                <span className="ml-2 text-2xl font-semibold text-blue-600">BuildEase</span>
              </div>
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Create an account</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Join BuildEase to manage your construction projects efficiently
            </p>
          </m.div>
          
          <div className="w-full max-w-md">
            <RegisterForm />
            
            <m.div 
              className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            </m.div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}