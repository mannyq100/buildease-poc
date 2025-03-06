import React from 'react'
import { cn } from '@/lib/utils'

interface FormLabelProps {
  className?: string
  htmlFor?: string
  children: React.ReactNode
}

/**
 * Label component for materials form fields
 */
export function FormLabel({ className, htmlFor, children }: FormLabelProps) {
  return (
    <label 
      className={cn("text-sm font-medium text-gray-700 dark:text-gray-300", className)}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  )
} 