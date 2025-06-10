export interface LoginFormData {
  email: string
  password: string
}

export interface LoginFormState {
  isLoading: boolean
  error: string | null
  showPassword: boolean
  rememberMe: boolean
}

export interface SignupFormData {
  firstName: string
  lastName: string
  companyName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface SignupFormState {
  isLoading: boolean
  error: string | null
  verificationSent: boolean
  showPassword: boolean
  passwordStrength: number
}

export interface PasswordCriteria {
  label: string
  met: boolean
}

export interface AuthRedirectProps {
  from?: string
}

export interface SocialLoginButtonsProps {
  onSocialLogin: (provider: string) => void
  isLoading: boolean
}

export interface PasswordStrengthProps {
  strength: number
  criteria: PasswordCriteria[]
}

export interface AuthFormLayoutProps {
  title: string
  description: string
  error?: string | null
  children: React.ReactNode
}

export interface AuthPageLayoutProps {
  children: React.ReactNode
}