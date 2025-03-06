import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
  color: 'blue' | 'green' | 'amber' | 'red'
  badge?: {
    text: string
    variant: 'success' | 'warning' | 'destructive'
  }
}

/**
 * Displays a card with statistics for materials inventory
 */
export function StatCard({ icon, title, value, color, badge }: StatCardProps) {
  const colorMap = {
    blue: "bg-blue-100 dark:bg-blue-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    red: "bg-red-100 dark:bg-red-900/30"
  }

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center space-x-4">
        <div className={`${colorMap[color]} p-3 rounded-full`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {badge && (
            <Badge variant={badge.variant} className="mt-1">{badge.text}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 