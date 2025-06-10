import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'

interface VerificationSuccessProps {
  onReturnToLogin: () => void
}

export default function VerificationSuccess({ onReturnToLogin }: VerificationSuccessProps) {
  return (
    <CardContent className="pt-2">
      <div className="text-center py-6 space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verification email sent!</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Please check your email for a verification link to complete your registration.
        </p>
        <Button 
          variant="outline" 
          className="mt-4 w-full"
          onClick={onReturnToLogin}
        >
          Return to login
        </Button>
      </div>
    </CardContent>
  )
}