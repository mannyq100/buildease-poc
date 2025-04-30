import React from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { BarChart3, Briefcase, DollarSign, ListTodo, Users } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import type { QuickStatCard } from '@/types/dashboard'
import { cn } from '@/utils/core/ui'

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

// Function to get the appropriate icon component
const getIconComponent = (iconName: string | React.ReactNode) => {
  if (React.isValidElement(iconName)) return iconName;
  
  switch(String(iconName).toLowerCase()) {
    case 'briefcase':
      return <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />;
    case 'dollarsign':
      return <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />;
    case 'listtodo':
      return <ListTodo className="h-4 w-4 sm:h-5 sm:w-5" />;
    case 'users':
      return <Users className="h-4 w-4 sm:h-5 sm:w-5" />;
    default:
      return <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />;
  }
};

/**
 * DashboardMetricsGrid component
 * Displays a grid of key metrics for the dashboard
 * Implements mobile-first responsive design
 */
export function DashboardMetricsGrid({ stats, className = '' }: DashboardMetricsGridProps) {
  return (
    <div className={cn(className, "px-1 sm:px-0")}>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-600 dark:text-blue-400" />
        Key Performance Metrics
      </h2>
      
      <LazyMotion features={domAnimation}>
        <m.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, index) => (
            <m.div key={index} variants={itemVariants} className="h-full">
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={getIconComponent(stat.icon)}
                colorScheme={stat.color}
                subtitle={stat.subtitle}
                trend={stat.trend}
              />
            </m.div>
          ))}
        </m.div>
      </LazyMotion>
    </div>
  )
}