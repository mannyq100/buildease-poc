/**
 * StatCard component for displaying statistics across the application
 */
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { StatCardProps } from '@/types/ui'

export function StatCard({ 
  title, 
  value, 
  icon, 
  colorScheme = 'blue', 
  subtitle,
  className,
  trend,
  trendValue,
  onClick
}: StatCardProps) {
  // Color maps for different themes
  const colorMap = {
    blue: {
      background: 'bg-blue-50 dark:bg-blue-950/40',
      iconBackground: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-600/20 dark:ring-blue-400/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/50'
    },
    emerald: {
      background: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconBackground: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-600/20 dark:ring-emerald-400/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/50'
    },
    amber: {
      background: 'bg-amber-50 dark:bg-amber-950/40',
      iconBackground: 'bg-amber-100 dark:bg-amber-900/50',
      iconColor: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-600/20 dark:ring-amber-400/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/50'
    },
    purple: {
      background: 'bg-purple-50 dark:bg-purple-950/40',
      iconBackground: 'bg-purple-100 dark:bg-purple-900/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
      ring: 'ring-purple-600/20 dark:ring-purple-400/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/50'
    },
    red: {
      background: 'bg-red-50 dark:bg-red-950/40',
      iconBackground: 'bg-red-100 dark:bg-red-900/50',
      iconColor: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-600/20 dark:ring-red-400/20',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-100 dark:border-red-900/50'
    },
    indigo: {
      background: 'bg-indigo-50 dark:bg-indigo-950/40',
      iconBackground: 'bg-indigo-100 dark:bg-indigo-900/50',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      ring: 'ring-indigo-600/20 dark:ring-indigo-400/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/50'
    }
  }

  const colors = colorMap[colorScheme] || colorMap.blue;

  return (
    <Card 
      className={cn(
        `${colors.background} border ${colors.border} shadow-sm hover:shadow transition-all duration-200 rounded-xl h-[120px]`,
        className
      )}
    >
      <CardContent className="p-4 h-full">
        <div className="flex items-start h-full">
          <div className={`flex-shrink-0 mr-4 p-3 rounded-lg ${colors.iconBackground}`}>
            <div className={`h-6 w-6 ${colors.iconColor}`}>
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