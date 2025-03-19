import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/auth/components/LoginForm';
import { useAuth } from '@/auth/hooks/useAuth';
import { m, LazyMotion, domAnimation } from 'framer-motion';

/**
 * Modern and simplified login page with construction management theme
 */
export function Login() {
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
      <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        {/* Left side - Image (hidden on mobile and tablets, visible on desktop) */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: 'url(/images/construction-3.jpg)' }}
          >
            <div className="absolute inset-0 bg-blue-900 bg-opacity-60 backdrop-filter backdrop-blur-sm"></div>
          </div>
          <div className="absolute inset-0 flex flex-col items-start justify-center p-12 text-white">
            <m.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="max-w-md"
            >
              <h2 className="text-4xl font-bold mb-6 leading-tight">Welcome back to BuildEase</h2>
              <p className="text-lg mb-8 text-blue-100 opacity-90">
                Your complete construction management platform for efficient project tracking and team collaboration.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-500 bg-opacity-30 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Track all your projects in one place</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 bg-opacity-30 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Manage budgets and expenses efficiently</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 bg-opacity-30 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Collaborate with your team in real-time</span>
                </div>
              </div>
            </m.div>
          </div>
        </div>

        {/* Right side - Form (takes full width on mobile/tablet, half on desktop) */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-12">
          {/* Small logo shown only on mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/buildease-logo-1.svg" alt="BuildEase" className="h-10 w-auto" />
          </div>
          
          <m.div 
            className="mb-6 md:mb-8 text-center w-full max-w-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Sign in to continue to your construction dashboard
            </p>
          </m.div>
          
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 sm:p-6 md:p-8">
            <LoginForm />
          </div>
          
          {/* Footer links for mobile and desktop */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <div className="space-x-4">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Help</a>
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}