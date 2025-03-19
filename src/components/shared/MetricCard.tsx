import React from 'react';
import { StatCard } from './StatCard';
import { cn } from '@/lib/utils';

/**
 * MetricCard component that uses the unified StatCard implementation
 * while following Buildese UI design principles:
 * - Card-based UI with subtle shadows
 * - Clear visual feedback
 * - Consistent spacing
 * - Modern, aesthetic look
 */
export interface MetricCardProps {
  /**
   * Label for the metric
   */
  label: string;
  
  /**
   * Value to display prominently
   */
  value: string;
  
  /**
   * Icon to display
   */
  icon: React.ReactNode;
  
  /**
   * Additional text to display below the value
   */
  subtext?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Color scheme for the card
   */
  colorScheme?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  
  /**
   * Trend information - can be a simple string or detailed object
   */
  trend?: 'positive' | 'negative' | 'warning' | 'normal' | {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

/**
 * Enhanced metric card component that uses the unified StatCard
 * Maintains backward compatibility with existing MetricCard usage
 */
export function MetricCard({
  label,
  value,
  icon,
  subtext,
  className,
  colorScheme = 'blue',
  trend
}: MetricCardProps) {
  // Convert string trend to object format for StatCard
  const normalizedTrend = typeof trend === 'object' ? trend : 
    trend === 'positive' ? { value: 0, isPositive: true } :
    trend === 'negative' ? { value: 0, isPositive: false } :
    undefined;

  return (
    <StatCard
      title={label}
      value={value}
      icon={icon}
      subtitle={subtext}
      description={typeof trend === 'string' ? trend : undefined}
      colorScheme={colorScheme}
      trend={normalizedTrend}
      className={cn('transition-all duration-300', className)}
    />
  );
}