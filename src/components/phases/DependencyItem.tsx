import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, Package, CheckCircle2 } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DependencyItemProps {
  title: string;
  status: 'completed' | 'scheduled' | 'in-progress' | 'blocked';
  type: 'document' | 'material' | 'approval';
}

/**
 * DependencyItem component for displaying phase dependencies
 */
export function DependencyItem({ 
  title, 
  status, 
  type 
}: DependencyItemProps) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const statusColors = {
    completed: isDarkMode ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-green-100 text-green-600 border-green-200",
    scheduled: isDarkMode ? "bg-blue-900/30 text-blue-400 border-blue-700/50" : "bg-blue-100 text-blue-600 border-blue-200",
    'in-progress': isDarkMode ? "bg-amber-900/30 text-amber-400 border-amber-700/50" : "bg-amber-100 text-amber-600 border-amber-200",
    blocked: isDarkMode ? "bg-red-900/30 text-red-400 border-red-700/50" : "bg-red-100 text-red-600 border-red-200",
  };
  
  const typeIcons = {
    document: <FileText className="w-3.5 h-3.5 mr-1.5" />,
    material: <Package className="w-3.5 h-3.5 mr-1.5" />,
    approval: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ x: 2 }}
        className={cn(
          "flex justify-between items-center p-3 rounded-md",
          isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-gray-50"
        )}
      >
        <div className="flex items-center">
          {typeIcons[type]}
          <span className={isDarkMode ? "text-white" : "text-slate-800"}>{title}</span>
        </div>
        <Badge className={statusColors[status]}>
          {status}
        </Badge>
      </m.div>
    </LazyMotion>
  );
} 