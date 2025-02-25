import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  label, 
  value, 
  subtext,
  className,
  trend
}) => (
  <motion.div
    whileHover={{ 
      y: -4,
      transition: { duration: 0.2 }
    }}
  >
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg border relative", 
      className
    )}>
      <div className="absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 rounded-full opacity-10 blur-xl bg-current"></div>
      <CardContent className="p-5 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-full bg-current bg-opacity-10 text-primary flex items-center justify-center">
            {icon}
          </div>
          <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="mt-3">
          <div className="flex items-end space-x-1.5">
            <div className="text-2xl font-bold leading-none">{value}</div>
            {trend && (
              <div className={`text-xs font-semibold mb-0.5 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          {subtext && <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtext}</div>}
        </div>
      </CardContent>
    </Card>
  </motion.div>
); 