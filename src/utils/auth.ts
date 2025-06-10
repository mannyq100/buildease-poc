import { Provider } from '@supabase/supabase-js'
import { SignupFormData, LoginFormData, PasswordCriteria } from '@/types/auth'

export function calculatePasswordStrength(password: string): number {
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return strength
}

export function getPasswordCriteria(password: string): PasswordCriteria[] {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) }
  ]
}

export function getPasswordStrengthColor(strength: number): string {
  if (strength <= 1) return 'bg-red-500'
  if (strength <= 3) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function validateSignupForm(formData: SignupFormData, passwordStrength: number): string | null {
  if (!formData.email || !formData.password || !formData.confirmPassword) {
    return 'Please fill in all required fields'
  }
  
  if (formData.password !== formData.confirmPassword) {
    return 'Passwords do not match'
  }
  
  if (passwordStrength < 3) {
    return 'Please create a stronger password'
  }
  
  return null
}

export function validateLoginForm(formData: LoginFormData): string | null {
  if (!formData.email || !formData.password) {
    return 'Please fill in all required fields'
  }
  
  return null
}

export function getLoginErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (errorMessage.includes('Email not confirmed')) {
    return 'Please verify your email before logging in.'
  }
  return errorMessage
}

export function getSocialLoginErrorMessage(provider: Provider, err: unknown): string {
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1)
  
  if (!(err instanceof Error)) {
    return `Failed to initialize ${provider} login. Please try again.`
  }
  
  if (err.message.includes('popup_closed_by_user') || err.message.includes('popup closed')) {
    return `${providerName} login was cancelled. Please try again.`
  }
  if (err.message.includes('popup_blocked')) {
    return `${providerName} login popup was blocked. Please allow popups for this site.`
  }
  if (err.message.includes('network')) {
    return `Network error when connecting to ${provider}. Please check your connection and try again.`
  }
  return `Failed to initialize ${provider} login: ${err.message}`
}

export function parseRedirectParams(location: any) {
  const searchParams = new URLSearchParams(location.search)
  return {
    from: location.state?.from || searchParams.get('from') || '/dashboard',
    errorParam: searchParams.get('error'),
    errorMessage: searchParams.get('message')
  }
}