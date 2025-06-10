import { Check } from 'lucide-react'
import { PasswordStrengthProps } from '@/types/auth'
import { getPasswordStrengthColor } from '@/utils/auth'

export default function PasswordStrength({ 
  strength, 
  criteria 
}: PasswordStrengthProps) {
  return (
    <div className="mt-2 space-y-2">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 flex-1 rounded-full ${
              i < strength 
                ? getPasswordStrengthColor(strength) 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <div className="space-y-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center text-xs">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
              criterion.met 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {criterion.met && <Check className="h-3 w-3 text-green-600 dark:text-green-400" />}
            </div>
            <span className={
              criterion.met 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}