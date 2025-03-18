import React from 'react'
import { Frown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/**
 * EmptyState component
 * Used to display a message when no data is available
 */
export function EmptyState({
  title,
  description,
  icon,
  actions,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 border border-dashed rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50 text-center",
      className
    )}>
      <div className="mb-4 text-gray-400 dark:text-gray-500">
        {icon || <Frown className="h-12 w-12" />}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          {description}
        </p>
      )}
      
      {actions && (
        <div className="mt-4">
          {actions}
        </div>
      )}
    </div>
  )
} 