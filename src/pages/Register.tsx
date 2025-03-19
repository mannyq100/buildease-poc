import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 order-2 lg:order-1">
          <m.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create an account</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Join BuildEase to manage your construction projects efficiently
            </p>
          </m.div>
          
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative order-1 lg:order-2">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: 'url(/images/construction-4.jpg)' }}
          >
            <div className="absolute inset-0 bg-orange-600 bg-opacity-50 backdrop-filter backdrop-blur-sm"></div>
          </div>
          <div className="absolute inset-0 flex flex-col items-start justify-center p-12 text-white">
            <m.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="max-w-md ml-auto"
            >
              <h2 className="text-4xl font-bold mb-6 leading-tight">Start Building Better</h2>
              <p className="text-lg mb-8 text-orange-50 opacity-90">
                Join thousands of builders who are managing their construction projects more efficiently with BuildEase.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-orange-500 bg-opacity-30 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Easy project setup in minutes</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-orange-500 bg-opacity-30 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Reduce project costs by up to 30%</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-orange-500 bg-opacity-30 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Complete projects faster with better planning</span>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}