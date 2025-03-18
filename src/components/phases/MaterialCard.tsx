import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Package, Warehouse } from 'lucide-react';

interface MaterialCardProps {
  name: string;
  supplier: string;
  quantity: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'ordered';
  className?: string;
}

/**
 * MaterialCard component for displaying material inventory details
 * with enhanced visual styling
 */
export function MaterialCard({ 
  name, 
  supplier, 
  quantity, 
  status,
  className
}: MaterialCardProps) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const statusConfig = {
    'in-stock': {
      bg: isDarkMode ? "bg-green-900/30" : "bg-green-100",
      text: isDarkMode ? "text-green-400" : "text-green-700",
      border: isDarkMode ? "border-green-700/50" : "border-green-200",
      icon: <div className="w-3 h-3 bg-green-500 rounded-full mr-1.5" />
    },
    'low-stock': {
      bg: isDarkMode ? "bg-amber-900/30" : "bg-amber-100",
      text: isDarkMode ? "text-amber-400" : "text-amber-700",
      border: isDarkMode ? "border-amber-700/50" : "border-amber-200",
      icon: <div className="w-3 h-3 bg-amber-500 rounded-full mr-1.5" />
    },
    'out-of-stock': {
      bg: isDarkMode ? "bg-red-900/30" : "bg-red-100",
      text: isDarkMode ? "text-red-400" : "text-red-700",
      border: isDarkMode ? "border-red-700/50" : "border-red-200",
      icon: <div className="w-3 h-3 bg-red-500 rounded-full mr-1.5" />
    },
    'ordered': {
      bg: isDarkMode ? "bg-blue-900/30" : "bg-blue-100",
      text: isDarkMode ? "text-blue-400" : "text-blue-700",
      border: isDarkMode ? "border-blue-700/50" : "border-blue-200",
      icon: <div className="w-3 h-3 bg-blue-500 rounded-full mr-1.5" />
    }
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ y: -4 }} 
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Card className={cn(
          "border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden",
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        )}>
          <div className={cn(
            "h-1.5", 
            status === 'in-stock' ? "bg-green-500" : 
            status === 'low-stock' ? "bg-amber-500" : 
            status === 'out-of-stock' ? "bg-red-500" : 
            "bg-blue-500"
          )} />
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-start">
                <div className={cn(
                  "p-2 rounded-md",
                  isDarkMode ? "bg-slate-700" : "bg-blue-50/80"
                )}>
                  <Warehouse className={cn(
                    "h-4 w-4", 
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  )} />
                </div>
                <div>
                  <h3 className={cn(
                    "font-medium", 
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    {name}
                  </h3>
                  <p className={cn(
                    "text-sm mt-1", 
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {supplier}
                  </p>
                </div>
              </div>
              <Badge className={cn(
                "font-medium rounded-md px-2 py-1 text-xs",
                statusConfig[status].bg,
                statusConfig[status].text,
                statusConfig[status].border
              )}>
                <span className="flex items-center">
                  {statusConfig[status].icon}
                  {status.replace('-', ' ')}
                </span>
              </Badge>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className={cn(
                "text-sm font-medium", 
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                Quantity: {quantity}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "h-8 text-xs",
                  isDarkMode ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20" : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                )}
              >
                <Package className="w-3.5 h-3.5 mr-1" />
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
} 