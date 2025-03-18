import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ArrowUpRight } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DocumentItemProps {
  name: string;
  type: string;
  date: string;
  size: string;
  status: 'current' | 'approved' | 'pending' | 'archived';
}

/**
 * DocumentItem component for displaying document details in phase views
 */
export function DocumentItem({ 
  name, 
  type, 
  date, 
  size, 
  status 
}: DocumentItemProps) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const iconMap = {
    'PDF': <FileText className="h-4 w-4 text-red-500" />,
    'DOCX': <FileText className="h-4 w-4 text-blue-500" />,
    'XLSX': <FileText className="h-4 w-4 text-green-500" />,
    'DWG': <FileText className="h-4 w-4 text-purple-500" />
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ x: 2 }}
        className={cn(
          "flex items-center justify-between py-3 px-4 rounded-md",
          isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"
        )}
      >
        <div className="flex items-center space-x-3">
          {iconMap[type] || <FileText className="h-4 w-4 text-gray-500" />}
          <div>
            <div className={cn(
              "font-medium",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>{name}</div>
            <div className={cn(
              "text-xs flex items-center space-x-2",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              <span>{type}</span>
              <span>•</span>
              <span>{date}</span>
              <span>•</span>
              <span>{size}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={cn(
            status === 'approved' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
            status === 'pending' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
            status === 'archived' ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" :
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          )}>
            {status}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open document</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </m.div>
    </LazyMotion>
  );
} 