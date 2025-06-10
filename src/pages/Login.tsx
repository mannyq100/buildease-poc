import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Provider } from '@supabase/supabase-js'
import { Eye, EyeOff } from 'lucide-react'

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  AuthPageLayout,
  AuthHeader,
  AuthToggleButtons,
  AuthFormLayout,
  SocialLoginButtons,
  LoadingRedirect
} from '@/components/auth'
import { LoginFormData, LoginFormState } from '@/types/auth'
import { 
  validateLoginForm, 
  getLoginErrorMessage, 
  getSocialLoginErrorMessage, 
  parseRedirectParams 
} from '@/utils/auth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useSupabaseAuth()
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  
  const [formState, setFormState] = useState<LoginFormState>({
    isLoading: false,
    error: null,
    showPassword: false,
    rememberMe: false
  })
  
  const { from, errorParam, errorMessage } = parseRedirectParams(location)

  useEffect(() => {
    if (auth.isAuthenticated) {
      const redirectTimer = setTimeout(() => {
        navigate(from, { replace: true })
      }, 300)
      return () => clearTimeout(redirectTimer)
    }
    
    auth.clearAuthError?.()
    
    if (errorParam) {
      setFormState(prev => ({
        ...prev,
        error: errorMessage || `Login failed: ${errorParam}`
      }))
    }
  }, [auth.isAuthenticated, auth.clearAuthError, navigate, from, errorParam, errorMessage])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateLoginForm(formData)
    if (validationError) {
      setFormState(prev => ({ ...prev, error: validationError }))
      return
    }
    
    setFormState(prev => ({ ...prev, error: null, isLoading: true }))
    
    try {
      const { error } = await auth.signInWithEmail(formData.email, formData.password)
      
      if (!error) return
      
      const errorMessage = getLoginErrorMessage(error.message)
      setFormState(prev => ({ ...prev, error: errorMessage }))
    } catch (err) {
      setFormState(prev => ({ 
        ...prev, 
        error: 'An unexpected error occurred. Please try again.' 
      }))
      console.error('Login error:', err)
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }))
    }
  }
  
  const handleSocialLogin = async (provider: string) => {
    setFormState(prev => ({ ...prev, error: null, isLoading: true }))
    
    try {
      auth.clearAuthError?.()
      localStorage.setItem('returnUrl', from)
      await auth.signInWithProvider(provider as Provider)
    } catch (err) {
      const errorMessage = getSocialLoginErrorMessage(provider as Provider, err)
      setFormState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
      console.error(`Error signing in with ${provider}:`, err)
    }
  }
  
  if (auth.isAuthenticated) {
    return <LoadingRedirect />
  }
  
  return (
    <AuthPageLayout>
      <AuthHeader />
      <AuthToggleButtons currentPage="login" />
      
      <AuthFormLayout 
        title="Welcome back" 
        description="Sign in to your account to continue"
        error={formState.error}
      >
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium text-sm">Email</Label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#2B6CB0]/20 to-[#ED8936]/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-12 border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-[#2B6CB0] dark:focus:ring-[#2B6CB0] min-h-[44px] font-opensans transition-all duration-300 rounded-md" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium text-sm">Password</Label>
              <Link to="/forgot-password" className="text-sm text-[#2B6CB0] dark:text-blue-400 hover:underline font-opensans hover:text-[#ED8936] transition-colors duration-300">
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#2B6CB0]/20 to-[#ED8936]/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              <Input
                id="password"
                name="password"
                type={formState.showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="h-12 pr-10 border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] dark:focus:border-[#2B6CB0] focus:ring-[#2B6CB0] dark:focus:ring-[#2B6CB0] min-h-[44px] font-opensans transition-all duration-300 rounded-md" 
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ED8936] dark:text-gray-400 dark:hover:text-[#ED8936] transition-colors duration-300"
                onClick={() => setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              >
                {formState.showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={formState.rememberMe} 
              onCheckedChange={() => setFormState(prev => ({ ...prev, rememberMe: !prev.rememberMe }))} 
              className="data-[state=checked]:bg-[#2B6CB0] data-[state=checked]:border-[#2B6CB0]"
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300 cursor-pointer font-opensans"
            >
              Remember me
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-[#2B6CB0] to-[#2B6CB0] hover:from-[#2B6CB0] hover:to-[#ED8936] text-white font-medium min-h-[44px] transition-all duration-500 rounded-md font-inter shadow-md hover:shadow-lg"
            disabled={formState.isLoading}
          >
            {formState.isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-gray-900/95 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700">
              or continue with
            </span>
          </div>
        </div>

        <SocialLoginButtons 
          onSocialLogin={handleSocialLogin}
          isLoading={formState.isLoading}
        />

        <div className="flex flex-col items-center border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/80 backdrop-blur-sm px-6 py-5 -mx-6 mt-6">
          <div className="flex items-center mb-2">
            <div className="w-1 h-1 rounded-full bg-[#2B6CB0] mr-1.5"></div>
            <div className="w-1 h-1 rounded-full bg-[#ED8936] mr-1.5"></div>
            <div className="w-1 h-1 rounded-full bg-[#2B6CB0]"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#2B6CB0] hover:text-[#ED8936] dark:text-blue-400 hover:underline font-medium font-opensans transition-colors duration-300">
              Sign up
            </Link>
          </p>
        </div>
      </AuthFormLayout>
    </AuthPageLayout>
  )
}