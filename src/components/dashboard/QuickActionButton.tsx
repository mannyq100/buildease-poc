/**
 * QuickActionButton component for dashboard actions
 */
import React from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { QuickAction } from '@/types/dashboard'

export function QuickActionButton({ 
  title, 
  icon, 
  color, 
  route, 
  description 
}: QuickAction) {
  const navigate = useNavigate()

  const colorMap = {
    blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    green: 'hover:bg-green-50 dark:hover:bg-green-900/20',
    purple: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
    amber: 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
    red: 'hover:bg-red-50 dark:hover:bg-red-900/20'
  }

  const colorClass = colorMap[color as keyof typeof colorMap] || colorMap.blue

  return (
    <Button
      variant="outline"
      className={`h-auto p-4 flex flex-col items-center justify-center gap-2 ${colorClass}`}
      onClick={() => navigate(route)}
    >
      {icon}
      <span>{title}</span>
      {description && (
        <span className="text-xs text-gray-500 dark:text-gray-400 text-center">{description}</span>
      )}
    </Button>
  )
} 