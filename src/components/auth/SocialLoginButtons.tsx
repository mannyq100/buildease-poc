import { Provider } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { SocialLoginButtonsProps } from '@/types/auth'

export default function SocialLoginButtons({ 
  onSocialLogin, 
  isLoading 
}: SocialLoginButtonsProps) {
  const handleSocialLogin = (provider: Provider) => {
    onSocialLogin(provider)
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Button 
        type="button" 
        variant="outline" 
        className="h-12 min-h-[44px] bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-colors duration-200"
        onClick={() => handleSocialLogin('google')}
        disabled={isLoading}
      >
        <img src="/google.svg" alt="Google" className="h-5 w-5" />
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="h-12 min-h-[44px] bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-colors duration-200"
        onClick={() => handleSocialLogin('facebook')}
        disabled={isLoading}
      >
        <img src="/facebook.svg" alt="Facebook" className="h-5 w-5" />
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="h-12 min-h-[44px] bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-colors duration-200"
        onClick={() => handleSocialLogin('linkedin_oidc')}
        disabled={isLoading}
      >
        <img src="/linkedin.svg" alt="LinkedIn" className="h-5 w-5" />
      </Button>
    </div>
  )
}