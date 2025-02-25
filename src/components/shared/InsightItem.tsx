import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightItemProps {
  title: string;
  description: string;
  type?: 'default' | 'alert' | 'success';
  className?: string;
}

export const InsightItem: React.FC<InsightItemProps> = ({ 
  title, 
  description,
  type = 'default',
  className
}) => {
  const styles = {
    default: {
      container: 'bg-blue-50/50 border border-blue-100/50 hover:border-blue-200',
      icon: 'text-blue-600',
      heading: 'text-blue-900',
      text: 'text-blue-800'
    },
    alert: {
      container: 'bg-yellow-50/50 border border-yellow-100/50 hover:border-yellow-200',
      icon: 'text-yellow-500',
      heading: 'text-yellow-900', 
      text: 'text-yellow-800'
    },
    success: {
      container: 'bg-green-50/50 border border-green-100/50 hover:border-green-200',
      icon: 'text-green-500',
      heading: 'text-green-900',
      text: 'text-green-800'
    }
  };

  const style = styles[type];

  return (
    <div className={cn(
      "flex items-start space-x-4 p-4 rounded-lg transition-all duration-300", 
      style.container,
      className
    )}>
      <Sparkles className={cn("w-5 h-5 mt-0.5", style.icon)} />
      <div>
        <h4 className={cn("font-medium", style.heading)}>{title}</h4>
        <p className={cn("text-sm mt-1 leading-relaxed", style.text)}>{description}</p>
      </div>
    </div>
  );
}; 