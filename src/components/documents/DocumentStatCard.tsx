/**
 * DocumentStatCard component for displaying document statistics
 */
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

export interface DocumentStatCardProps {
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
   * Optional label to display next to value
   */
  label?: string
}

export function DocumentStatCard({ 
  title, 
  value, 
  icon, 
  color, 
  label 
}: DocumentStatCardProps) {
  // Color maps for different themes
  const colorMap = {
    blue: {
      card: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-200 dark:border-blue-800/30",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      icon: "text-blue-600 dark:text-blue-400"
    },
    green: {
      card: "from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-green-200 dark:border-green-800/30",
      iconBg: "bg-green-100 dark:bg-green-900/50",
      icon: "text-green-600 dark:text-green-400"
    },
    amber: {
      card: "from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/30",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      icon: "text-amber-600 dark:text-amber-400"
    },
    purple: {
      card: "from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border-purple-200 dark:border-purple-800/30",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
      icon: "text-purple-600 dark:text-purple-400"
    },
    red: {
      card: "from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-red-200 dark:border-red-800/30",
      iconBg: "bg-red-100 dark:bg-red-900/50",
      icon: "text-red-600 dark:text-red-400"
    }
  }

  const colorClasses = colorMap[color]

  return (
    <Card className={`bg-gradient-to-br ${colorClasses.card} shadow-sm hover:shadow-md transition-all duration-300 border`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${colorClasses.iconBg} rounded-lg shadow-sm`}>
            <div className={`h-5 w-5 ${colorClasses.icon}`}>
              {icon}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {label && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 