/**
 * QuickStatCard component for displaying statistics in the dashboard
 */
import React from 'react'
import { QuickStatCard as QuickStatCardProps } from '@/types/dashboard'
import { StatCard } from '@/components/shared/StatCard'

/**
 * QuickStatCard component that leverages the unified StatCard for dashboard statistics
 */
export function QuickStatCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend,
  subtitle
}: QuickStatCardProps) {
  return (
    <StatCard
      title={title}
      value={value}
      icon={icon}
      colorScheme={color}
      subtitle={subtitle}
      trend={trend}
      simplified={true}
    />
  )
}