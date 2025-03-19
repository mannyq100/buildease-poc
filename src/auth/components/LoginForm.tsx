import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { EyeIcon, EyeOffIcon, KeyIcon, MailIcon, AlertCircle, BuildingIcon, HardHatIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { SocialLoginButtons } from './SocialLoginButtons';
import { m, AnimatePresence } from 'framer-motion';

/**
 * Modern and simplified login form component with construction theme
 */
export function LoginForm() {
  const { login, state } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const { isLoading, error } = state;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
    
    // Navigate on successful login
    if (state.isAuthenticated && !state.error) {
      navigate('/dashboard');
    }
  }

  const iconVariants = {
    focused: { 
      scale: 1.1,
      color: '#3b82f6'
    },
    blurred: { 
      scale: 1,
      color: '#94a3b8'
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="w-full max-w-md mx-auto border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="h-1 bg-blue-500"></div>
        
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <AnimatePresence>
            {error && (
              <m.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-900/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                </Alert>
              </m.div>
            )}
          </AnimatePresence>
          
          {/* Social login buttons */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="px-1"
          >
            <SocialLoginButtons className="mb-2" />
          </m.div>
          
          <m.div 
            className="relative my-4 sm:my-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center">
              <m.span 
                className="w-full border-t dark:border-slate-700"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.4, duration: 0.8 }}
              />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <m.span 
                className="bg-white dark:bg-slate-800 px-3 text-slate-500 dark:text-slate-400 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                Or continue with email
              </m.span>
            </div>
          </m.div>
          
          <m.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <m.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Label htmlFor="email" className="text-sm font-medium flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                <m.span
                  animate={focusedField === 'email' ? { color: '#3b82f6' } : {}}
                >
                  Email Address
                </m.span>
              </Label>
              <div className="relative">
                <m.div 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 z-10"
                  animate={focusedField === 'email' ? iconVariants.focused : iconVariants.blurred}
                  transition={{ duration: 0.2 }}
                >
                  <MailIcon className="h-5 w-5" />
                </m.div>
                <m.div className="relative">
                  <m.div 
                    className="absolute inset-0 rounded-md bg-blue-50 dark:bg-blue-900/20 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: focusedField === 'email' ? 0.3 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  ></m.div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="pl-10 py-5 h-12 sm:h-11 text-base sm:text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all relative z-10"
                    required
                  />
                </m.div>
              </div>
            </m.div>
            
            <m.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <Label htmlFor="password" className="text-sm font-medium flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                  <m.span
                    animate={focusedField === 'password' ? { color: '#3b82f6' } : {}}
                  >
                    Password
                  </m.span>
                </Label>
                <m.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to="/password-reset" 
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Forgot password?
                  </Link>
                </m.div>
              </div>
              <div className="relative">
                <m.div 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 z-10"
                  animate={focusedField === 'password' ? iconVariants.focused : iconVariants.blurred}
                  transition={{ duration: 0.2 }}
                >
                  <KeyIcon className="h-5 w-5" />
                </m.div>
                <m.div className="relative">
                  <m.div 
                    className="absolute inset-0 rounded-md bg-blue-50 dark:bg-blue-900/20 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: focusedField === 'password' ? 0.3 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  ></m.div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 pr-10 py-5 h-12 sm:h-11 text-base sm:text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all relative z-10"
                    required
                  />
                </m.div>
                <m.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10 p-1.5"
                  whileHover={{ scale: 1.1, color: '#3b82f6' }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </m.button>
              </div>
            </m.div>
            
            <m.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="w-4 h-4 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor="remember" className="font-normal text-sm cursor-pointer">Remember me</Label>
              </div>
            </m.div>
            
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
              className="pt-2"
            >
              <m.button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 sm:h-11 flex items-center justify-center font-medium rounded-md text-white transition-all duration-200 relative overflow-hidden border-0 bg-blue-500 hover:bg-blue-600 text-base sm:text-sm"
                whileHover={{ 
                  scale: 1.01
                }}
                whileTap={{ scale: 0.99 }}
              >
                <m.span className="relative flex items-center justify-center" >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <m.span 
                      className="flex items-center justify-center w-full"
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span>Sign In</span>
                      <m.svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 ml-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        initial={{ x: -5, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </m.svg>
                    </m.span>
                  )}
                </m.span>
              </m.button>
            </m.div>
          </m.form>
          
          <m.div 
            className="flex flex-col sm:flex-row items-center justify-center mt-4 sm:mt-5 space-y-2 sm:space-y-0 sm:space-x-1 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <span className="text-slate-500 dark:text-slate-400">New to Buildease?</span>
            <m.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/register" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline">
                Create an account
              </Link>
            </m.div>
          </m.div>
        </CardContent>
      </Card>
    </m.div>
  );
}