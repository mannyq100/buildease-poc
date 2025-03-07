/**
 * QuickStatCard component for displaying statistics in the dashboard
 */
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { QuickStatCard as QuickStatCardProps } from '@/types/dashboard'

export function QuickStatCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend 
}: QuickStatCardProps) {
  const colorMap = {
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    amber: 'bg-amber-500/10',
    purple: 'bg-purple-500/10',
    red: 'bg-red-500/10'
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${colorMap[color]} rounded-lg`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {trend && (
                <span className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}%
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 