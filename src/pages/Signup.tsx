import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Provider } from '@supabase/supabase-js'
import { Eye, EyeOff } from 'lucide-react'

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardContent, CardFooter } from '@/components/ui/card'
import { 
  AuthPageLayout,
  AuthHeader,
  AuthToggleButtons,
  AuthFormLayout,
  SocialLoginButtons,
  PasswordStrength,
  VerificationSuccess
} from '@/components/auth'
import { SignupFormData, SignupFormState } from '@/types/auth'
import { 
  validateSignupForm, 
  calculatePasswordStrength, 
  getPasswordCriteria,
  getSocialLoginErrorMessage 
} from '@/utils/auth'

export default function Signup() {
  const navigate = useNavigate()
  const auth = useSupabaseAuth()
  
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  
  const [formState, setFormState] = useState<SignupFormState>({
    isLoading: false,
    error: null,
    verificationSent: false,
    showPassword: false,
    passwordStrength: 0
  })

  const passwordCriteria = getPasswordCriteria(formData.password)

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard')
    }
  }, [auth.isAuthenticated, navigate])

  useEffect(() => {
    const strength = calculatePasswordStrength(formData.password)
    setFormState(prev => ({ ...prev, passwordStrength: strength }))
  }, [formData.password])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateSignupForm(formData, formState.passwordStrength)
    if (validationError) {
      setFormState(prev => ({ ...prev, error: validationError }))
      return
    }

    setFormState(prev => ({ ...prev, error: null, isLoading: true }))
    
    try {
      const { error: signupError } = await auth.signUp(
        formData.email,
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          phone: formData.phone
        }
      )
      
      if (signupError) throw signupError
      
      setFormState(prev => ({ ...prev, verificationSent: true }))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during signup';
      setFormState(prev => ({ 
        ...prev, 
        error: errorMessage 
      }))
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setFormState(prev => ({ ...prev, error: null, isLoading: true }))
    
    try {
      await auth.signInWithProvider(provider as Provider)
    } catch (err: unknown) {
      const errorMessage = getSocialLoginErrorMessage(provider as Provider, err)
      setFormState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }))
    }
  }

  if (auth.isAuthenticated) {
    navigate('/dashboard')
    return null
  }

  return (
    <AuthPageLayout>
      <AuthHeader showLogo />
      <AuthToggleButtons currentPage="signup" />
      
      <AuthFormLayout 
        title="Create an account" 
        description="Sign up to start managing your construction projects"
        error={formState.error}
      >
        {formState.verificationSent ? (
          <VerificationSuccess onReturnToLogin={() => navigate('/login')} />
        ) : (
          <SignupForm 
            formData={formData}
            formState={formState}
            passwordCriteria={passwordCriteria}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onSocialLogin={handleSocialLogin}
            onTogglePassword={() => setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
          />
        )}
      </AuthFormLayout>
    </AuthPageLayout>
  )
}

function SignupForm({ 
  formData, 
  formState, 
  passwordCriteria, 
  onInputChange, 
  onSubmit, 
  onSocialLogin,
  onTogglePassword 
}: {
  formData: SignupFormData
  formState: SignupFormState
  passwordCriteria: Array<{ label: string; met: boolean }>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onSocialLogin: (provider: string) => void
  onTogglePassword: () => void
}) {
  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4 pt-2 p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={onInputChange}
              className="h-10 min-h-[44px] bg-white dark:bg-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={onInputChange}
              className="h-10 min-h-[44px] bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-gray-700 dark:text-gray-300">Company Name (Optional)</Label>
          <Input
            id="companyName"
            name="companyName"
            placeholder="Your Construction Company"
            value={formData.companyName}
            onChange={onInputChange}
            className="h-10 min-h-[44px] bg-white dark:bg-gray-800"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={onInputChange}
            className="h-10 min-h-[44px] bg-white dark:bg-gray-800"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone (Optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(123) 456-7890"
            value={formData.phone}
            onChange={onInputChange}
            className="h-10 min-h-[44px] bg-white dark:bg-gray-800"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={onInputChange}
              className="h-10 min-h-[44px] pr-10 bg-white dark:bg-gray-800"
              required
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {formState.showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {formData.password.length > 0 && (
            <PasswordStrength 
              strength={formState.passwordStrength} 
              criteria={passwordCriteria} 
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={onInputChange}
              className="h-10 min-h-[44px] pr-10 bg-white dark:bg-gray-800"
              required
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 pt-2 p-0 mt-4">
        <Button 
          type="submit" 
          className="w-full h-12 min-h-[44px] bg-gradient-to-r from-[#2B6CB0] to-[#2B6CB0] hover:from-[#2B6CB0] hover:to-[#ED8936] text-white font-medium rounded-md transition-all duration-500 shadow-md hover:shadow-lg"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? 'Creating account...' : 'Create account'}
        </Button>
        
        <div className="relative w-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative z-10 bg-white dark:bg-gray-900 px-3 text-sm text-gray-500 dark:text-gray-400">
            or continue with
          </div>
        </div>
        
        <SocialLoginButtons 
          onSocialLogin={onSocialLogin} 
          isLoading={formState.isLoading} 
        />
        
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#2B6CB0] hover:text-[#ED8936] dark:text-blue-400 dark:hover:text-orange-400 transition-colors">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </form>
  )
}