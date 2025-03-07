/**
 * StatCard component for displaying statistics across the application
 */
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  /**
   * Title of the stat card
   */
  title: string
  
  /**
   * Value to display prominently
   */
  value: React.ReactNode
  
  /**
   * Icon to display
   */
  icon: React.ReactNode
  
  /**
   * Color theme of the card
   */
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red'
  
  /**
   * Optional subtitle or label to display
   */
  subtitle?: string
  
  /**
   * Optional class name for custom styling
   */
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle,
  className
}: StatCardProps) {
  // Color maps for different themes
  const colorMap = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-100 dark:border-blue-900/30",
      icon: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100/50 dark:bg-blue-900/50"
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-100 dark:border-green-900/30",
      icon: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100/50 dark:bg-green-900/50"
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-100 dark:border-amber-900/30",
      icon: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100/50 dark:bg-amber-900/50"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-100 dark:border-purple-900/30",
      icon: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100/50 dark:bg-purple-900/50"
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-100 dark:border-red-900/30",
      icon: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100/50 dark:bg-red-900/50"
    }
  }

  const colors = colorMap[color]

  return (
    <Card 
      className={cn(
        `${colors.bg} border ${colors.border} shadow-sm hover:shadow transition-all duration-200 rounded-xl h-[120px]`,
        className
      )}
    >
      <CardContent className="p-4 h-full">
        <div className="flex items-start h-full">
          <div className={`flex-shrink-0 mr-4 p-3 rounded-lg ${colors.iconBg}`}>
            <div className={`h-6 w-6 ${colors.icon}`}>
              {icon}
            </div>
          </div>
          <div className="flex flex-col justify-between h-full">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <div className="flex flex-col">
              <p className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-tight">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 