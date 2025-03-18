import React from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import type { QuickStatCard } from '@/types/dashboard'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0, 
    opacity: 1
  }
}

interface DashboardMetricsGridProps {
  stats: QuickStatCard[]
  className?: string
}

/**
 * DashboardMetricsGrid component
 * Displays a grid of key metrics for the dashboard
 */
export function DashboardMetricsGrid({ stats, className = '' }: DashboardMetricsGridProps) {
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
        Key Performance Metrics
      </h2>
      
      <LazyMotion features={domAnimation}>
        <m.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, index) => (
            <m.div key={index} variants={itemVariants} className="h-full">
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                colorScheme={stat.color}
                subtitle={stat.subtitle}
              />
            </m.div>
          ))}
        </m.div>
      </LazyMotion>
    </div>
  )
} 