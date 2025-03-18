import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface MaterialItemProps {
  name: string;
  quantity: string;
  used: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'ordered';
  className?: string;
}

/**
 * MaterialItem component for displaying individual materials in phase details
 * with enhanced visual styling
 */
export function MaterialItem({ 
  name, 
  quantity, 
  used, 
  status,
  className
}: MaterialItemProps) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const statusColors = {
    'in-stock': isDarkMode ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-green-100 text-green-700 border-green-200",
    'low-stock': isDarkMode ? "bg-amber-900/30 text-amber-400 border-amber-700/50" : "bg-amber-100 text-amber-700 border-amber-200",
    'out-of-stock': isDarkMode ? "bg-red-900/30 text-red-400 border-red-700/50" : "bg-red-100 text-red-700 border-red-200",
    'ordered': isDarkMode ? "bg-blue-900/30 text-blue-400 border-blue-700/50" : "bg-blue-100 text-blue-700 border-blue-200"
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ scale: 1.01, y: -2 }}
        className={cn(
          "p-4 rounded-lg border transition-all shadow-sm hover:shadow-md",
          isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-200",
          className
        )}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2.5">
            <div className={cn(
              "p-2 rounded-md",
              isDarkMode ? "bg-slate-700" : "bg-blue-50"
            )}>
              <Package className={cn(
                "h-4 w-4", 
                isDarkMode ? "text-blue-400" : "text-blue-600"
              )} />
            </div>
            <div>
              <h4 className={cn(
                "font-medium",
                isDarkMode ? "text-white" : "text-slate-800"
              )}>{name}</h4>
              <p className={cn(
                "text-sm mt-1",
                isDarkMode ? "text-slate-400" : "text-gray-600"
              )}>Quantity: {quantity}</p>
            </div>
          </div>
          <Badge className={cn(
            "font-medium rounded-md px-2 py-1 text-xs",
            statusColors[status]
          )}>
            {status.replace('-', ' ')}
          </Badge>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className={isDarkMode ? "text-slate-400" : "text-gray-500"}>Usage</span>
            <span className={cn(
              "font-medium",
              used > 80 ? "text-red-500" : 
              used > 50 ? "text-amber-500" : 
              "text-green-500"
            )}>{used}% used</span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                used > 80 ? "bg-red-500" : 
                used > 50 ? "bg-amber-500" : 
                "bg-green-500"
              )}
              style={{ width: `${used}%` }}
            />
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
} 