import React from 'react';
import { Briefcase, CheckSquare, DollarSign, PieChart } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { StatCard } from '@/components/shared/StatCard';
import { staggerContainerVariants, fadeInUpVariants } from '@/lib/animations';

interface ProjectMetricsProps {
  totalProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  spentPercentage: number;
  activeProjects: number;
  className?: string;
}

/**
 * ProjectMetrics - Displays a grid of key project metrics
 */
export function ProjectMetrics({
  totalProjects,
  completedProjects,
  totalBudget,
  totalSpent,
  spentPercentage,
  activeProjects,
  className
}: ProjectMetricsProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className || ''}`}
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <m.div variants={fadeInUpVariants} className="h-full">
          <StatCard
            title="Total Projects"
            value={totalProjects}
            icon={<Briefcase className="h-6 w-6" />}
            colorScheme="blue"
            subtitle="projects"
          />
        </m.div>
        
        <m.div variants={fadeInUpVariants} className="h-full">
          <StatCard
            title="Completed Projects"
            value={completedProjects}
            icon={<CheckSquare className="h-6 w-6" />}
            colorScheme="green"
            subtitle="100% complete"
          />
        </m.div>
        
        <m.div variants={fadeInUpVariants} className="h-full">
          <StatCard
            title="Budget"
            value={formatCurrency(totalBudget)}
            icon={<DollarSign className="h-6 w-6" />}
            colorScheme="amber"
            subtitle={`${formatCurrency(totalSpent)} spent`}
          />
        </m.div>
        
        <m.div variants={fadeInUpVariants} className="h-full">
          <StatCard
            title="Progress"
            value={`${Math.round(spentPercentage)}%`}
            icon={<PieChart className="h-6 w-6" />}
            colorScheme="purple"
            subtitle={`${activeProjects} active projects`}
          />
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
} 