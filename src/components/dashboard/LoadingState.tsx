import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  className?: string
  message?: string
}

/**
 * LoadingState component
 * Displays a loading spinner with optional message
 */
export function LoadingState({ className, message = 'Loading dashboard data...' }: LoadingStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm",
      className
    )}>
      <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
      <p className="text-gray-600 dark:text-gray-300 text-sm">{message}</p>
    </div>
  )
}

export default LoadingState 