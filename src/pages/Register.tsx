import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '@/auth/components/RegisterForm';
import { useAuth } from '@/auth/hooks/useAuth';
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';

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
      <div className="flex min-h-screen flex-col md:flex-row bg-white dark:bg-slate-900 overflow-hidden">
        {/* Construction-themed side (hidden on mobile) */}
        <AnimatePresence>
          <m.div 
            className="hidden md:flex md:w-1/2 text-white flex-col justify-between p-10 relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)' 
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.7, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            {/* Simple geometric decorations */}
            <div className="absolute inset-0 z-0">
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 1.5 }}
                className="absolute top-0 right-0 w-full h-full overflow-hidden"
              >
                {/* Minimal geometric shapes */}
                <m.div 
                  className="absolute top-[10%] right-[15%] w-40 h-40 bg-white/10 rounded-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                ></m.div>
                
                <m.div 
                  className="absolute bottom-[15%] left-[10%] w-60 h-60 bg-white/5 rounded-full"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ 
                    duration: 12, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5 
                  }}
                ></m.div>
                
                {/* Yellow accent */}
                <m.div 
                  className="absolute right-[10%] bottom-[35%] w-24 h-1 bg-yellow-300 rounded-full"
                  animate={{ width: [24, 100, 24] }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                ></m.div>
              </m.div>
            </div>
            
            <div className="relative z-10">
              {/* Enhanced logo with animation */}
              <m.div 
                className="mb-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="relative inline-block">
                  <m.div
                    className="absolute -inset-1 bg-gradient-to-r from-yellow-300/30 to-white/20 rounded-xl blur-lg"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  ></m.div>
                  <m.img 
                    src="/buildease-logo-2.svg" 
                    alt="BuildEase Logo" 
                    className="h-16 relative"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </m.div>
              
              {/* Tagline */}
              <m.p 
                className="text-xl sm:text-2xl text-blue-50 mb-10 font-light leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Your complete construction project management solution
              </m.p>
              
              {/* Simplified feature highlights */}
              <div className="space-y-6">
                {[
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ),
                    title: "Project Security",
                    description: "Secure management of your construction data"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    title: "Time Tracking",
                    description: "Monitor progress and deadlines efficiently"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ),
                    title: "Resource Management",
                    description: "Optimize materials, equipment, and workforce"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    ),
                    title: "Team Collaboration",
                    description: "Work seamlessly with your construction team, anywhere, anytime"
                  }
                ].map((feature, index) => (
                  <m.div 
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.9 + (index * 0.15), 
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <m.div 
                        className="bg-white/15 p-2.5 rounded-md"
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
                        transition={{ duration: 0.2 }}
                      >
                        {feature.icon}
                      </m.div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-yellow-300">{feature.title}</h3>
                      <p className="text-blue-50 text-sm">{feature.description}</p>
                    </div>
                  </m.div>
                ))}
              </div>
            </div>
            
            {/* Simple quote section */}
            <m.div 
              className="relative z-10 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <m.div 
                className="my-4 border-t border-white/20"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.6, duration: 1.2, ease: "easeInOut" }}
              ></m.div>
              <m.p 
                className="text-sm text-blue-100 italic font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
              >
                "Great buildings, like great nations, are built on strong foundations."
              </m.p>
            </m.div>
          </m.div>
        </AnimatePresence>
        
        {/* Registration form side */}
        <m.div 
          className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 bg-gray-50 dark:bg-slate-900"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile logo (visible only on mobile) */}
          <m.div 
            className="flex items-center justify-center mb-8 md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-md"></div>
              <img 
                src="/buildease-logo-2.svg" 
                alt="BuildEase Logo" 
                className="h-12 relative"
                style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))' }}
              />
            </div>
          </m.div>
          
          <div className="w-full max-w-md mx-auto">
            <m.div 
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                Create Your Account
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Join BuildEase to manage your construction projects
              </p>
            </m.div>
            
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <RegisterForm />
            </m.div>
            
            <m.div 
              className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                Privacy Policy
              </Link>
            </m.div>
          </div>
        </m.div>
      </div>
    </LazyMotion>
  );
} 