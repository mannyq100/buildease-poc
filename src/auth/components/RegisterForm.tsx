import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EyeIcon, EyeOffIcon, KeyIcon, MailIcon, AlertCircle, UserIcon, SmartphoneIcon, BuildingIcon } from 'lucide-react';
import { SocialLoginButtons } from './SocialLoginButtons';
import { m, AnimatePresence } from 'framer-motion';

/**
 * Modern and simplified registration form component with construction theme
 */
export function RegisterForm() {
  const { register, state } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phoneNumber: '',
    role: 'owner' as UserRole
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isLoading, error } = state;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function handleRoleChange(value: string) {
    setFormData(prev => ({ ...prev, role: value as UserRole }));
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const { confirmPassword, ...userData } = formData;
    
    await register(userData);
    
    // Navigate on successful registration
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
      <Card className="w-full max-w-md mx-auto border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
        <div className="h-1 bg-blue-500"></div>
        
        <CardContent className="p-6 space-y-5">
          <AnimatePresence>
            {(error || Object.keys(errors).length > 0) && (
              <m.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-900/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm font-medium">
                    {error || errors.password || errors.confirmPassword || errors.email || errors.firstName || errors.lastName}
                  </AlertDescription>
                </Alert>
              </m.div>
            )}
          </AnimatePresence>
          
          {/* Social signup buttons */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <SocialLoginButtons className="mb-2" />
          </m.div>
          
          <m.div 
            className="relative my-5"
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
                Or register with email
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
            <div className="grid grid-cols-2 gap-4">
              <m.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <Label htmlFor="firstName" className="text-sm font-medium flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                  <m.span animate={focusedField === 'firstName' ? { color: '#3b82f6' } : {}}>
                    First Name
                  </m.span>
                </Label>
                <div className="relative">
                  <m.div 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 z-10"
                    animate={focusedField === 'firstName' ? iconVariants.focused : iconVariants.blurred}
                    transition={{ duration: 0.2 }}
                  >
                    <UserIcon className="h-5 w-5" />
                  </m.div>
                  <m.div className="relative">
                    <m.div 
                      className="absolute inset-0 rounded-md bg-blue-50 dark:bg-blue-900/20 z-0"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: focusedField === 'firstName' ? 0.3 : 0
                      }}
                      transition={{ duration: 0.2 }}
                    ></m.div>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John"
                      className="pl-10 py-5 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all relative z-10"
                      required
                    />
                  </m.div>
                </div>
              </m.div>
              
              <m.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.3 }}
              >
                <Label htmlFor="lastName" className="text-sm font-medium flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                  <m.span animate={focusedField === 'lastName' ? { color: '#3b82f6' } : {}}>
                    Last Name
                  </m.span>
                </Label>
                <div className="relative">
                  <m.div 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 z-10"
                    animate={focusedField === 'lastName' ? iconVariants.focused : iconVariants.blurred}
                    transition={{ duration: 0.2 }}
                  >
                    <UserIcon className="h-5 w-5" />
                  </m.div>
                  <m.div className="relative">
                    <m.div 
                      className="absolute inset-0 rounded-md bg-blue-50 dark:bg-blue-900/20 z-0"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: focusedField === 'lastName' ? 0.3 : 0
                      }}
                      transition={{ duration: 0.2 }}
                    ></m.div>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Doe"
                      className="pl-10 py-5 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all relative z-10"
                      required
                    />
                  </m.div>
                </div>
              </m.div>
            </div>
            
            <m.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <Label htmlFor="email" className="text-sm font-medium flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                <m.span animate={focusedField === 'email' ? { color: '#3b82f6' } : {}}>
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
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="pl-10 py-5 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all relative z-10"
                    required
                  />
                </m.div>
              </div>
            </m.div>
            
            <div className="grid grid-cols-2 gap-4">
              <m.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.3 }}
              >
                <Label htmlFor="company" className="text-sm font-medium flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                  <m.span animate={focusedField === 'company' ? { color: '#3b82f6' } : {}}>
                    Company Name
                  </m.span>
                </Label>
                <div className="relative">
                  <m.div 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 z-10"
                    animate={focusedField === 'company' ? iconVariants.focused : iconVariants.blurred}
                    transition={{ duration: 0.2 }}
                  >
                    <BuildingIcon className="h-5 w-5" />
                  </m.div>
                  <m.div className="relative">
                    <m.div 
                      className="absolute inset-0 rounded-md bg-blue-50 dark:bg-blue-900/20 z-0"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: focusedField === 'company' ? 0.3 : 0
                      }}
                      transition={{ duration: 0.2 }}
                    ></m.div>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('company')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Construction Co."
                      className="pl-10 py-5 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all relative z-10"
                    />
                  </m.div>
                </div>
              </m.div>
              
              <m.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                  <m.span animate={focusedField === 'phoneNumber' ? { color: '#3b82f6' } : {}}>
                    Phone Number
                  </m.span>
                </Label>
                <div className="relative">
                  <m.div 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 z-10"
                    animate={focusedField === 'phoneNumber' ? iconVariants.focused : iconVariants.blurred}
                    transition={{ duration: 0.2 }}
                  >
                    <SmartphoneIcon className="h-5 w-5" />
                  </m.div>
                  <m.div className="relative">
                    <m.div 
                      className="absolute inset-0 rounded-md bg-blue-50 dark:bg-blue-900/20 z-0"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: focusedField === 'phoneNumber' ? 0.3 : 0
                      }}
                      transition={{ duration: 0.2 }}
                    ></m.div>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phoneNumber')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="(123) 456-7890"
                      className="pl-10 py-5 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all relative z-10"
                    />
                  </m.div>
                </div>
              </m.div>
            </div>
            
            <m.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.3 }}
            >
              <Label htmlFor="role" className="text-sm font-medium flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                <m.span animate={focusedField === 'role' ? { color: '#3b82f6' } : {}}>
                  Your Role
                </m.span>
              </Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger 
                  className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500"
                  onFocus={() => setFocusedField('role')}
                  onBlur={() => setFocusedField(null)}
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner/Manager</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="architect">Architect</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </m.div>
            
            <m.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            >
              <Label htmlFor="password" className="text-sm font-medium flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                <m.span animate={focusedField === 'password' ? { color: '#3b82f6' } : {}}>
                  Password
                </m.span>
              </Label>
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 pr-10 py-5 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all relative z-10"
                    required
                  />
                </m.div>
                <m.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Must be at least 8 characters
              </p>
            </m.div>
            
            <m.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.3 }}
            >
              <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                <m.span animate={focusedField === 'confirmPassword' ? { color: '#3b82f6' } : {}}>
                  Confirm Password
                </m.span>
              </Label>
              <div className="relative">
                <m.div 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 z-10"
                  animate={focusedField === 'confirmPassword' ? iconVariants.focused : iconVariants.blurred}
                  transition={{ duration: 0.2 }}
                >
                  <KeyIcon className="h-5 w-5" />
                </m.div>
                <m.div className="relative">
                  <m.div 
                    className="absolute inset-0 rounded-md bg-blue-50 dark:bg-blue-900/20 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: focusedField === 'confirmPassword' ? 0.3 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  ></m.div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 pr-10 py-5 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all relative z-10"
                    required
                  />
                </m.div>
                <m.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
                  whileHover={{ scale: 1.1, color: '#3b82f6' }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </m.button>
              </div>
            </m.div>
            
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.3 }}
              className="pt-2"
            >
              <m.button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center font-medium rounded-md text-white transition-all duration-200 relative overflow-hidden border-0 bg-blue-500 hover:bg-blue-600"
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
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <m.span 
                      className="flex items-center justify-center w-full"
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span className="text-base">Create Account</span>
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
            className="flex items-center justify-center mt-5 space-x-1 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <span className="text-slate-500 dark:text-slate-400">Already have an account?</span>
            <m.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline">
                Sign in
              </Link>
            </m.div>
          </m.div>
        </CardContent>
      </Card>
    </m.div>
  );
} 